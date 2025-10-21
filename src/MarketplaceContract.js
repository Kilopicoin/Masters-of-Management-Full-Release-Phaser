// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import contractABI from './MarketplaceContractABI.json'; // Import the ABI JSON file

export const MarketplacecontractAddress = '0xe8283D05c18A6ce129286B57C657e0754041FE39';

// Harmony mainnet RPCs (failover pool)
export const RPC_LIST = [
  'https://api.s0.t.hmny.io',
  'https://a.api.s0.t.hmny.io',
  'https://harmony-0.drpc.org',
  'https://1rpc.io/one',
  'https://endpoints.omniatech.io/v1/harmony/mainnet-0/public',
  'https://api.harmony.one', // original as extra fallback
];

// ---- Failover utilities ----
const PROBE_TIMEOUT_MS = 3500;
let cachedRpc = null;
let cachedProviderPromise = null;

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const probeRpc = async (rpcUrl) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      }),
    });

    clearTimeout(timer);
    if (!res.ok) return false;

    const json = await res.json();
    return Boolean(json && json.result && /^0x[0-9a-fA-F]+$/.test(json.result));
  } catch {
    clearTimeout(timer);
    return false;
  }
};

const pickHealthyRpc = async () => {
  const candidates = shuffle(RPC_LIST);
  for (const url of candidates) {
    const ok = await probeRpc(url);
    if (ok) return url;
  }
  throw new Error('No healthy Harmony RPC endpoints are reachable at the moment.');
};

const getFailoverProvider = async () => {
  if (cachedProviderPromise) return cachedProviderPromise;

  cachedProviderPromise = (async () => {
    const rpc = cachedRpc || (await pickHealthyRpc());
    cachedRpc = rpc;
    return new JsonRpcProvider(rpc);
  })();

  try {
    return await cachedProviderPromise;
  } catch (err) {
    cachedProviderPromise = null;
    cachedRpc = null;
    throw err;
  }
};

const withProviderFailover = async (fn) => {
  try {
    const provider = await getFailoverProvider();
    return await fn(provider);
  } catch (err) {
    // reset and retry once on any network-ish error
    cachedProviderPromise = null;
    cachedRpc = null;
    const provider2 = await getFailoverProvider();
    return await fn(provider2);
  }
};

// ---- Public API ----
const getMarketplaceContract = async () => {
  return withProviderFailover(async (provider) => {
    return new Contract(MarketplacecontractAddress, contractABI.abi, provider);
  });
};

export const getMarketplaceSignerContract = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(MarketplacecontractAddress, contractABI.abi, signer);
  } else {
    throw new Error('Ethereum wallet is not installed');
  }
};

export default getMarketplaceContract;
