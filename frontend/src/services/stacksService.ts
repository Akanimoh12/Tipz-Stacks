import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import type { StacksNetwork } from '@stacks/network';
import { NETWORK, STACKS_API } from '@utils/constants';

export const getNetwork = (): StacksNetwork => {
  const isTestnet = NETWORK === 'testnet';
  
  if (isTestnet) {
    const network = { ...STACKS_TESTNET };
    // Override the URL to use our configured API
    if (STACKS_API) {
      network.client.baseUrl = STACKS_API;
    }
    return network;
  }
  
  const network = { ...STACKS_MAINNET };
  if (STACKS_API) {
    network.client.baseUrl = STACKS_API;
  }
  return network;
};

export const getExplorerUrl = (txId: string): string => {
  const isTestnet = NETWORK === 'testnet';
  const baseUrl = isTestnet 
    ? 'https://explorer.hiro.so/txid' 
    : 'https://explorer.hiro.so/txid';
  
  return `${baseUrl}/${txId}?chain=${isTestnet ? 'testnet' : 'mainnet'}`;
};

export const getAddressExplorerUrl = (address: string): string => {
  const isTestnet = NETWORK === 'testnet';
  const baseUrl = isTestnet 
    ? 'https://explorer.hiro.so/address' 
    : 'https://explorer.hiro.so/address';
  
  return `${baseUrl}/${address}?chain=${isTestnet ? 'testnet' : 'mainnet'}`;
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};

export const microStxToStx = (microStx: number | string): number => {
  const amount = typeof microStx === 'string' ? Number(microStx) : microStx;
  return amount / 1_000_000;
};

export const stxToMicroStx = (stx: number): number => {
  return Math.floor(stx * 1_000_000);
};

export const formatTokenAmount = (
  amount: number | string, 
  decimals: number = 6
): string => {
  // Convert BigInt or string to number safely
  let value: number;
  if (typeof amount === 'string') {
    value = parseFloat(amount);
  } else if (typeof amount === 'bigint') {
    value = Number(amount);
  } else {
    value = amount;
  }
  
  if (isNaN(value)) return '0';
  
  const normalized = value / (10 ** decimals);
  
  if (normalized >= 1_000_000) {
    return `${(normalized / 1_000_000).toFixed(2)}M`;
  }
  
  if (normalized >= 1_000) {
    return `${(normalized / 1_000).toFixed(2)}K`;
  }
  
  return normalized.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatStxBalance = (microStx: number | string): string => {
  const stx = microStxToStx(microStx);
  return stx.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

export const validateStacksAddress = (address: string): boolean => {
  const testnetRegex = /^ST[0-9A-Z]{38,41}$/;
  const mainnetRegex = /^SP[0-9A-Z]{38,41}$/;
  
  return testnetRegex.test(address) || mainnetRegex.test(address);
};
