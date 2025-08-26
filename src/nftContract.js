// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import nftcontractABI from './nftcontractABI.json'; // Import the ABI JSON file

const nftContractAddress = '0x8136868E58e8F15B0B80BA6E573A3Fe6C149A978';
const RPC = 'https://api.harmony.one';

const getNFTContract = async () => {
  const provider = new JsonRpcProvider(RPC);
  return new Contract(nftContractAddress, nftcontractABI.abi, provider);
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
