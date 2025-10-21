// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import contractABI from './contractABI.json';

export const contractAddress = '0x399721e792E69F1393917F36e1EF561234AfF07c';

// Harmony mainnet RPCs (robin/failover pool)
export const RPC_LIST = [
  'https://api.s0.t.hmny.io',
  'https://a.api.s0.t.hmny.io',
  'https://harmony-0.drpc.org',
  'https://1rpc.io/one',
  'https://endpoints.omniatech.io/v1/harmony/mainnet-0/public',
  'https://api.harmony.one', // original as an extra fallback
];

// ---- Failover utilities ----
const PROBE_TIMEOUT_MS = 3500; // tweak if your users are farther from these endpoints
let cachedRpc = null;
let cachedProviderPromise = null;

// Small helper to shuffle the list (so we don't hammer the same first RPC)
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Probe a single RPC with a lightweight JSON-RPC call
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
    // Consider it healthy if we got a hex block number back
    return Boolean(json && json.result && /^0x[0-9a-fA-F]+$/.test(json.result));
  } catch {
    clearTimeout(timer);
    return false;
  }
};

// Pick the first healthy RPC (sequential, to avoid firing at all at once)
const pickHealthyRpc = async () => {
  const candidates = shuffle(RPC_LIST);
  for (const url of candidates) {
    const ok = await probeRpc(url);
    if (ok) return url;
  }
  throw new Error('No healthy Harmony RPC endpoints are reachable at the moment.');
};

// Get (or create) a provider with failover caching
const getFailoverProvider = async () => {
  // If we already have a provider in-flight/ready, reuse it
  if (cachedProviderPromise) return cachedProviderPromise;

  cachedProviderPromise = (async () => {
    const rpc = cachedRpc || (await pickHealthyRpc());
    cachedRpc = rpc;
    return new JsonRpcProvider(rpc);
  })();

  try {
    return await cachedProviderPromise;
  } catch (err) {
    // Reset and bubble up so the caller can retry (this will trigger a re-probe)
    cachedProviderPromise = null;
    cachedRpc = null;
    throw err;
  }
};

// If an operation fails with a network-ish error, force re-pick a provider and retry once
const withProviderFailover = async (fn) => {
  try {
    const provider = await getFailoverProvider();
    return await fn(provider);
  } catch (err) {
    // Simple heuristic: on any error, try once more after resetting provider
    cachedProviderPromise = null;
    cachedRpc = null;

    const provider2 = await getFailoverProvider();
    return await fn(provider2);
  }
};

// ---- Public API ----
const getContract = async () => {
  return withProviderFailover(async (provider) => {
    return new Contract(contractAddress, contractABI.abi, provider);
  });
};

export const getSignerContract = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(contractAddress, contractABI.abi, signer);
  } else {
    throw new Error('Ethereum wallet is not installed');
  }
};

export default getContract;
