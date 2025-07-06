// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import nftcontractABI from './nftcontractABI.json'; // Import the ABI JSON file

const nftContractAddress = '0x25a46179b54fBfca292270C7f13f96305CF81cf4';
const RPC = 'https://api.s0.b.hmny.io';

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
