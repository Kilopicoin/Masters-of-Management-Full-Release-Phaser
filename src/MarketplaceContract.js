// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import contractABI from './MarketplaceContractABI.json'; // Import the ABI JSON file

export const MarketplacecontractAddress = '0x7b1AD0BdbE51Fb7077A517566ad478EC378D9f05';
const RPC = 'https://api.s0.b.hmny.io';

const getMarketplaceContract = async () => {
  const provider = new JsonRpcProvider(RPC);
  return new Contract(MarketplacecontractAddress, contractABI.abi, provider);
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
