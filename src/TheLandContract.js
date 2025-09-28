// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import contractABI from "./TheLandContractABI.json";

// ---- Harmony constants ----
export const HARMONY_CHAIN_ID_DEC = 1666600000;
export const HARMONY_CHAIN_ID_HEX = "0x63564c40";
export const HARMONY_RPC = "https://api.harmony.one";

// ---- Deployed contract ----
export const contractAddress = "0xCD22445A5Ee0fcFFFD41396bE5A1B807436f3de2";

// Dedicated RPC for fee data, gas estimation, and nonce (stable & consistent)
const estimator = new JsonRpcProvider(HARMONY_RPC);

// Prefer Trust Wallet’s injected provider on mobile; fallback to window.ethereum
function getInjectedEip1193() {
  if (typeof window === "undefined") return null;
  const w = window;
  // Trust Wallet in-app browser injects window.trustwallet.ethereum
  if (w?.trustwallet?.ethereum) return w.trustwallet.ethereum;
  if (w?.ethereum) return w.ethereum;
  return null;
}

// Ensure the wallet is on Harmony mainnet (adds if missing)
export async function ensureHarmonyChain(eip1193) {
  if (!eip1193?.request) throw new Error("No EIP-1193 provider found");
  try {
    await eip1193.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARMONY_CHAIN_ID_HEX }],
    });
  } catch (err) {
    // 4902 = chain not added
    if (err && err.code === 4902) {
      await eip1193.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: HARMONY_CHAIN_ID_HEX,
          chainName: "Harmony Mainnet (Shard 0)",
          rpcUrls: [HARMONY_RPC],
          nativeCurrency: { name: "ONE", symbol: "ONE", decimals: 18 },
          blockExplorerUrls: ["https://explorer.harmony.one"],
        }],
      });
    } else {
      throw err;
    }
  }
}

// Read-only (public) contract via stable RPC
export const getTheLandContract = async () => {
  const provider = new JsonRpcProvider(HARMONY_RPC);
  return new Contract(contractAddress, contractABI.abi, provider);
};

// Signer-connected contract via injected wallet (MetaMask / Trust Wallet mobile in-app / Trust extension)
export const getTheLandSignerContract = async () => {
  const eip1193 = getInjectedEip1193();
  if (!eip1193) throw new Error("No injected wallet found (Trust Wallet / MetaMask)");

  // Ask accounts & ensure Harmony chain
  await eip1193.request({ method: "eth_requestAccounts" });
  await ensureHarmonyChain(eip1193);

  const provider = new BrowserProvider(eip1193);
  const signer = await provider.getSigner();

  // Optional sanity logs (uncomment while debugging)
  // const net = await provider.getNetwork();
  // console.log("Signer:", await signer.getAddress(), "chainId:", Number(net.chainId));

  return new Contract(contractAddress, contractABI.abi, signer);
};

// --------- Harmony-safe legacy sender (type:0, no 'from' in overrides) ---------

// Small gas buffer to avoid underestimates on mobile
function padGas(g) {
  return (g * 12n) / 10n; // +20%
}

/**
 * Build legacy overrides (type:0) using the *estimator* RPC:
 * - gasPrice (legacy only on Harmony)
 * - gasLimit (estimated from the exact unsigned tx)
 * - nonce (from chain; avoids 0)
 */
async function buildHarmonyLegacyOverrides(contract, unsignedTx, fromAddr) {
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
 * sendHarmonyLegacyTx(contract, methodOrSignature, args, extraOverrides)
 * - Works with overloaded methods (use name or full signature)
 * - Populates tx, estimates via stable RPC, then sends via wallet signer
 * - NEVER sets `from` in send overrides (wallet will inject the correct from)
 */
export async function sendHarmonyLegacyTx(
  contractWithSigner,
  methodOrSignature,
  args = [],
  extraOverrides = {}
) {
  if (!contractWithSigner?.getFunction || !contractWithSigner?.runner) {
    throw new Error("Expected a signer-connected ethers.Contract");
  }

  const fn = contractWithSigner.getFunction(methodOrSignature);
  const signer = contractWithSigner.runner; // ethers v6 signer
  const from = await signer.getAddress();

  // Build unsigned tx from ABI
  const unsigned = await fn.populateTransaction(...args, extraOverrides);
  const to = (unsigned.to ?? contractWithSigner.target)?.toString?.();
  if (!to) throw new Error("Could not resolve contract address (to)");

  // Ensure we never accidentally send to EOA (sanity)
  if (to.toLowerCase() === from.toLowerCase()) {
    throw new Error("Contract address equals sender address; wrong contract instance?");
  }

  // Legacy overrides (type:0) derived from stable RPC (avoids TW mobile quirks)
  const base = await buildHarmonyLegacyOverrides(
    contractWithSigner,
    { to, data: unsigned.data, value: unsigned.value ?? extraOverrides.value ?? 0n },
    from
  );

  // Final overrides: type:0 enforced, no 'from'
  const overrides = { ...base, ...extraOverrides, type: 0 };
  const tx = await fn(...args, overrides);
  return tx.wait();
}
