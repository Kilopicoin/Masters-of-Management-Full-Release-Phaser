// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import contractABI from "./contractABI.json";

// ---------- Harmony constants ----------
export const HARMONY_CHAIN_ID_DEC = 1666600000;
export const HARMONY_CHAIN_ID_HEX = "0x63564c40";
export const RPC = "https://api.harmony.one";

// ---------- Deployed contract ----------
export const contractAddress = "0x399721e792E69F1393917F36e1EF561234AfF07c";

// Dedicated RPC for fee data, gas estimation, and nonce (stable)
const estimator = new JsonRpcProvider(RPC);

// Prefer Trust Wallet injection on mobile; fall back to any EIP-1193 (e.g., MetaMask/Trust extension)
function getInjectedEip1193() {
  if (typeof window === "undefined") return null;
  const w = window;
  if (w?.trustwallet?.ethereum) return w.trustwallet.ethereum; // Trust Wallet in-app browser
  if (w?.ethereum) return w.ethereum;                           // Desktop extensions
  return null;
}

// Ensure Harmony Mainnet (Shard 0) is selected (add if missing)
export async function ensureHarmonyChain(eip1193) {
  if (!eip1193?.request) throw new Error("No EIP-1193 provider found");
  try {
    await eip1193.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARMONY_CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err && err.code === 4902) {
      await eip1193.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: HARMONY_CHAIN_ID_HEX,
          chainName: "Harmony Mainnet (Shard 0)",
          rpcUrls: [RPC],
          nativeCurrency: { name: "ONE", symbol: "ONE", decimals: 18 },
          blockExplorerUrls: ["https://explorer.harmony.one"],
        }],
      });
    } else {
      throw err;
    }
  }
}

// ---------- Read-only contract ----------
const getContract = async () => {
  const provider = new JsonRpcProvider(RPC);
  return new Contract(contractAddress, contractABI.abi, provider);
};

// ---------- Signer-connected contract ----------
export const getSignerContract = async () => {
  const eip1193 = getInjectedEip1193();
  if (!eip1193) throw new Error("No injected wallet found (Trust Wallet / MetaMask)");

  await eip1193.request({ method: "eth_requestAccounts" });
  await ensureHarmonyChain(eip1193);

  const provider = new BrowserProvider(eip1193);
  const signer = await provider.getSigner();
  return new Contract(contractAddress, contractABI.abi, signer);
};

export default getContract;

// ---------- Harmony-safe legacy sender utilities ----------

function padGas(g) {
  return (g * 12n) / 10n; // +20% buffer
}

// Find the correct overload by trying to encode args against ABI fragments
function resolveOverloadOrThrow(contract, name, args, wantsValue) {
  const cands = contract.interface.fragments
    .filter(f => f.type === "function" && f.name === name);
  if (!cands.length) throw new Error(`ABI has no function named "${name}".`);

  const byCount = cands.filter(f => f.inputs.length === args.length);
  const list = byCount.length ? byCount : cands;

  for (const f of list) {
    if (wantsValue && f.stateMutability !== "payable") continue;
    const sig = f.format(); // e.g., "foo(uint32,uint16)"
    try {
      contract.interface.encodeFunctionData(sig, args);
      return { fragment: f, signature: sig };
    } catch { /* try next */ }
  }

  const sigs = cands.map(f => `${f.format()} [${f.stateMutability}]`).join(", ");
  throw new Error(`No overload of ${name} matched ${args.length} args. Candidates: ${sigs}`);
}

// Build legacy overrides (Harmony is legacy: gasPrice only; no EIP-1559 fields)
async function buildHarmonyLegacyOverrides(unsignedTx, fromAddr) {
  let gasPrice = (await estimator.getFeeData())?.gasPrice;
  if (!gasPrice) gasPrice = await estimator.getGasPrice();
  if (!gasPrice) throw new Error("Harmony RPC: failed to fetch gasPrice");

  const gasEstimate = await estimator.estimateGas({
    from: fromAddr,
    to: unsignedTx.to,
    data: unsignedTx.data,
    value: unsignedTx.value ?? 0n,
    gasPrice,
  });

  const gasLimit = padGas(gasEstimate);
  const nonce = await estimator.getTransactionCount(fromAddr, "latest");

  return { type: 0, gasPrice, gasLimit, nonce };
}

/**
 * sendHarmonyLegacyTx(contractWithSigner, methodName, args, extraOverrides)
 * - Auto-resolves overloads
 * - Populates unsigned tx
 * - Estimates gas/nonce on stable Harmony RPC
 * - Sends with legacy fields (type:0, gasPrice) – never sets `from`
 */
export async function sendHarmonyLegacyTx(
  contractWithSigner,
  methodName,
  args = [],
  extraOverrides = {}
) {
  if (!contractWithSigner?.getFunction || !contractWithSigner?.runner) {
    throw new Error("Expected a signer-connected ethers.Contract");
  }

  const signer = contractWithSigner.runner;           // ethers v6 signer
  const from = await signer.getAddress();
  const wantsValue = extraOverrides?.value != null && extraOverrides.value !== 0n;

  // Resolve the exact function (handles overloads)
  const { signature, fragment } = resolveOverloadOrThrow(
    contractWithSigner, methodName, args, wantsValue
  );
  if (wantsValue && fragment.stateMutability !== "payable") {
    throw new Error(`${signature} is not payable; remove 'value' from overrides.`);
  }

  const fn = contractWithSigner.getFunction(signature);

  // Build an unsigned tx (so we know to/data/value accurately)
  const unsigned = await fn.populateTransaction(...args, extraOverrides);
  const to = (unsigned.to ?? contractWithSigner.target)?.toString?.();
  if (!to) throw new Error("Could not resolve contract address (to)");
  if (to.toLowerCase() === from.toLowerCase()) {
    throw new Error("Contract address equals sender address; wrong contract instance?");
    }

  // Legacy overrides derived from Harmony RPC (fixes nonce/gas on mobile)
  const base = await buildHarmonyLegacyOverrides(
    { to, data: unsigned.data, value: unsigned.value ?? extraOverrides.value ?? 0n },
    from
  );

  // Final send overrides: enforce legacy, never include `from`
  const overrides = { ...base, ...extraOverrides, type: 0 };

  const tx = await fn(...args, overrides);
  return tx.wait();
}
