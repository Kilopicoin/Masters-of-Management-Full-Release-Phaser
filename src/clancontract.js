// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import contractABI from './clancontractABI.json'; // Import the ABI JSON file

export const clancontractAddress = '0x20aF751C887729F48ac49450340e0249C958184A';
const RPC = 'https://api.harmony.one';

const getclanContract = async () => {
  const provider = new JsonRpcProvider(RPC);
  return new Contract(clancontractAddress, contractABI.abi, provider);
};

export const getclanSignerContract = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(clancontractAddress, contractABI.abi, signer);
  } else {
    throw new Error('Ethereum wallet is not installed');
  }
};

export default getclanContract;
