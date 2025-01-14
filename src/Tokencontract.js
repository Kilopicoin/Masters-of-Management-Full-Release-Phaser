// contract.js
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import TokencontractABI from './TokencontractABI.json'; // Import the ABI JSON file

const TokencontractAddress = '0x1fFfFFaC36C8b644B1EC334511af6852dc101014';
const RPC = 'https://api.s0.b.hmny.io';

const getTokenContract = async () => {
  const provider = new JsonRpcProvider(RPC);
  return new Contract(TokencontractAddress, TokencontractABI.abi, provider);
};

export const getTokenSignerContract = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(TokencontractAddress, TokencontractABI.abi, signer);
  } else {
    throw new Error('Ethereum wallet is not installed');
  }
};

export default getTokenContract;
