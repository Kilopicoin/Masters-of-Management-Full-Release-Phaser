// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import contractABI from './TheLandContractABI.json'; // Import the ABI JSON file

export const contractAddress = '0x3f99d08284fc3cE3Abb742db67E0Bd95CB762eB3';
const RPC = 'https://api.s0.b.hmny.io';

const getTheLandContract = async () => {
  const provider = new JsonRpcProvider(RPC);
  return new Contract(contractAddress, contractABI.abi, provider);
};

export const getTheLandSignerContract = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(contractAddress, contractABI.abi, signer);
  } else {
    throw new Error('Ethereum wallet is not installed');
  }
};

export default getTheLandContract;