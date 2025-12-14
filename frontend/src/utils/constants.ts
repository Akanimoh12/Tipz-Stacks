export const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'testnet';
export const DEPLOYER_ADDRESS = import.meta.env.VITE_DEPLOYER_ADDRESS || '';
export const CHEER_TOKEN_CONTRACT = import.meta.env.VITE_CHEER_TOKEN_CONTRACT || 'cheer-token';
export const TIPZ_CORE_CONTRACT = import.meta.env.VITE_TIPZ_CORE_CONTRACT || 'tipz-core';
export const STACKS_API = import.meta.env.VITE_STACKS_API || 
  (NETWORK === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so');
export const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
export const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET;

export const APP_NAME = 'Tipz Stacks';
export const APP_DESCRIPTION = 'Empower your favorite creators on Stacks blockchain';

export const EXPLORER_URL = NETWORK === 'mainnet' 
  ? 'https://explorer.hiro.so' 
  : 'https://explorer.hiro.so/?chain=testnet';

export const MIN_TIP_AMOUNT = 0.001;
export const DAILY_CHEER_AMOUNT = 100;
export const BLOCKS_PER_DAY = 144;
export const BLOCK_TIME_MINUTES = 10;
