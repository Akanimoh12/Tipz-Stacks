import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useConnect } from '@stacks/connect-react';
import { AppConfig, UserSession } from '@stacks/connect';
import { 
  fetchCallReadOnlyFunction, 
  cvToJSON, 
  standardPrincipalCV 
} from '@stacks/transactions';
import { 
  CHEER_TOKEN_CONTRACT,
  STACKS_API 
} from '@utils/constants';
import { getNetwork } from '@services/stacksService';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

interface WalletState {
  walletAddress: string | null;
  isConnected: boolean;
  network: string;
  stxBalance: number;
  cheerBalance: number;
  isLoading: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalances: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticate } = useConnect();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [network] = useState('testnet');
  const [stxBalance, setStxBalance] = useState(0);
  const [cheerBalance, setCheerBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache previous balances to avoid unnecessary re-renders
  const lastBalances = useRef({ stx: 0, cheer: 0 });
  const isFetchingBalances = useRef(false);

  const fetchStxBalance = useCallback(async (address: string) => {
    try {
      const response = await fetch(
        `${STACKS_API}/extended/v1/address/${address}/balances`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch STX balance');
      }
      
      const data = await response.json();
      // Handle both string and number types, convert BigInt safely
      const balanceStr = String(data.stx.balance);
      const microStx = Number(balanceStr);
      
      // Only update if balance changed
      if (lastBalances.current.stx !== microStx) {
        setStxBalance(microStx);
        lastBalances.current.stx = microStx;
      }
      
      return microStx;
    } catch (err) {
      console.error('Error fetching STX balance:', err);
      return 0;
    }
  }, []);

  const fetchCheerBalance = useCallback(async (address: string) => {
    try {
      // Parse contract identifier
      let contractAddress: string;
      let contractName: string;
      
      if (CHEER_TOKEN_CONTRACT.includes('.')) {
        [contractAddress, contractName] = CHEER_TOKEN_CONTRACT.split('.');
      } else {
        // If only contract name provided, use DEPLOYER_ADDRESS
        const deployerAddr = import.meta.env.VITE_DEPLOYER_ADDRESS;
        contractAddress = deployerAddr;
        contractName = CHEER_TOKEN_CONTRACT;
      }
      
      console.log('Fetching CHEER balance:', {
        userAddress: address,
        contractAddress,
        contractName,
        fullContract: `${contractAddress}.${contractName}`
      });
      
      const result = await fetchCallReadOnlyFunction({
        network: getNetwork(),
        contractAddress,
        contractName,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
        senderAddress: address,
      });

      const jsonResult = cvToJSON(result);
      console.log('CHEER balance response:', jsonResult);
      
      const balance = jsonResult.value?.value || 0;
      // Handle BigInt conversion safely
      const balanceStr = String(balance);
      const parsedBalance = Number(balanceStr);
      
      console.log('Parsed CHEER balance:', parsedBalance);
      
      // Only update if balance changed
      if (lastBalances.current.cheer !== parsedBalance) {
        console.log('Updating CHEER balance from', lastBalances.current.cheer, 'to', parsedBalance);
        setCheerBalance(parsedBalance);
        lastBalances.current.cheer = parsedBalance;
      } else {
        console.log('CHEER balance unchanged:', parsedBalance);
      }
      
      return parsedBalance;
    } catch (err) {
      console.error('Error fetching CHEER balance:', err);
      return 0;
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!walletAddress || isFetchingBalances.current) return;
    
    isFetchingBalances.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStxBalance(walletAddress),
        fetchCheerBalance(walletAddress),
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh balances';
      setError(errorMessage);
      console.error('Error refreshing balances:', err);
    } finally {
      setIsLoading(false);
      isFetchingBalances.current = false;
    }
  }, [walletAddress, fetchStxBalance, fetchCheerBalance]);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      authenticate({
        appDetails: {
          name: 'Tipz Stacks',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: async (payload: any) => {
          const address = payload.userSession.loadUserData().profile.stxAddress.testnet || 
                        payload.userSession.loadUserData().profile.stxAddress.mainnet;
          
          if (address) {
            setWalletAddress(address);
            setIsConnected(true);
            
            await Promise.all([
              fetchStxBalance(address),
              fetchCheerBalance(address),
            ]);
          }
          setIsLoading(false);
        },
        onCancel: () => {
          setIsLoading(false);
          setError('Wallet connection cancelled');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Error connecting wallet:', err);
    }
  }, [authenticate, fetchStxBalance, fetchCheerBalance]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setIsConnected(false);
    setStxBalance(0);
    setCheerBalance(0);
    setError(null);
    userSession.signUserOut();
  }, []);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      try {
        const userData = userSession.loadUserData();
        const address = userData.profile.stxAddress.testnet || 
                      userData.profile.stxAddress.mainnet;
        
        if (address) {
          setWalletAddress(address);
          setIsConnected(true);
          refreshBalances();
        }
      } catch (err) {
        console.error('Error loading wallet session:', err);
      }
    }
  }, [refreshBalances]);

  useEffect(() => {
    if (!walletAddress || !isConnected) return;

    const interval = setInterval(() => {
      refreshBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [walletAddress, isConnected, refreshBalances]);

  const value: WalletContextType = {
    walletAddress,
    isConnected,
    network,
    stxBalance,
    cheerBalance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalances,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
