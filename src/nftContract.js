// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import nftcontractABI from './nftcontractABI.json'; // Import the ABI JSON file

export const nftContractAddress = '0x8136868E58e8F15B0B80BA6E573A3Fe6C149A978';

// Harmony mainnet RPCs (failover pool)
export const RPC_LIST = [
  'https://api.s0.t.hmny.io',
  'https://a.api.s0.t.hmny.io',
  'https://1rpc.io/one',
  'https://api.harmony.one', // original as fallback
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
    cachedProviderPromise = null;
    cachedRpc = null;
    const provider2 = await getFailoverProvider();
    return await fn(provider2);
  }
};

// ---- Public API ----
const getNFTContract = async () => {
  return withProviderFailover(async (provider) => {
    return new Contract(nftContractAddress, nftcontractABI.abi, provider);
  });
};

export const getNFTSignerContract = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(nftContractAddress, nftcontractABI.abi, signer);
  } else {
    throw new Error('Ethereum wallet is not installed');
  }
};

export default getNFTContract;
