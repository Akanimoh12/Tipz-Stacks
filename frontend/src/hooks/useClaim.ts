import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getClaimStatus,
  claimDailyTokens,
  blocksToTime,
  type ClaimStatus,
} from '../services/contractService';
import { useWallet } from './useWallet';

interface UseClaimReturn {
  canClaim: boolean;
  blocksUntilClaim: number;
  timeUntilClaim: string;
  isClaiming: boolean;
  isLoading: boolean;
  lastClaimBlock: number;
  totalClaimed: number;
  error: string | null;
  claimSuccess: boolean;
  claimTxId: string | null;
  handleClaim: () => Promise<void>;
  refreshClaimData: () => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useClaim = (): UseClaimReturn => {
  const { walletAddress, isConnected, refreshBalances } = useWallet();
  
  const [canClaim, setCanClaim] = useState(false);
  const [blocksUntilClaim, setBlocksUntilClaim] = useState(0);
  const [lastClaimBlock, setLastClaimBlock] = useState(0);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimTxId, setClaimTxId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Use refs to prevent unnecessary re-renders
  const lastFetchedData = useRef<ClaimStatus | null>(null);
  const isFetching = useRef(false);

  /**
   * Fetch claim status from contract (only update state if values changed)
   */
  const refreshClaimData = useCallback(async () => {
    if (!walletAddress || !isConnected || isFetching.current) {
      setIsLoading(false);
      return;
    }

    try {
      isFetching.current = true;
      setIsLoading(true);
      const status: ClaimStatus = await getClaimStatus(walletAddress);
      
      // Only update state if values actually changed
      const hasChanged = !lastFetchedData.current || 
        lastFetchedData.current.canClaim !== status.canClaim ||
        lastFetchedData.current.blocksUntilClaim !== status.blocksUntilClaim ||
        lastFetchedData.current.totalClaimed !== status.totalClaimed;
      
      if (hasChanged) {
        lastFetchedData.current = status;
        setCanClaim(status.canClaim);
        setBlocksUntilClaim(status.blocksUntilClaim);
        setLastClaimBlock(status.lastClaimBlock);
        setTotalClaimed(status.totalClaimed);
        
        // Set initial time remaining for countdown
        if (status.blocksUntilClaim > 0) {
          const { totalSeconds } = blocksToTime(status.blocksUntilClaim);
          setTimeRemaining(totalSeconds);
        } else {
          setTimeRemaining(0);
        }
      }
    } catch (err: any) {
      console.error('Error fetching claim data:', err);
      setError('Failed to load claim status');
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [walletAddress, isConnected]);

  /**
   * Handle claim transaction
   */
  const handleClaim = async () => {
    if (!walletAddress || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!canClaim) {
      setError('You cannot claim tokens yet');
      return;
    }

    setIsClaiming(true);
    setError(null);
    setClaimSuccess(false);

    try {
      const txId = await claimDailyTokens();
      
      setClaimTxId(txId);
      setClaimSuccess(true);
      
      // Optimistically update claim status
      setCanClaim(false);
      setBlocksUntilClaim(144); // Reset to full cooldown
      setTotalClaimed(prev => prev + 100);
      
      console.log('Claim transaction broadcasted:', txId);
      console.log('Waiting for transaction confirmation...');
      
      // Show immediate optimistic feedback, but wait longer for blockchain confirmation
      // Stacks blocks take ~10 minutes, but transaction should be in mempool quickly
      
      // Refresh balances after 15 seconds (should be in mempool by then)
      setTimeout(async () => {
        console.log('First balance refresh attempt (15s)...');
        await refreshBalances();
      }, 15000);
      
      // Refresh again after 30 seconds
      setTimeout(async () => {
        console.log('Second balance refresh attempt (30s)...');
        await refreshBalances();
      }, 30000);
      
      // Refresh claim data after 45 seconds
      setTimeout(() => {
        console.log('Refreshing claim data (45s)...');
        refreshClaimData();
      }, 45000);
    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim tokens');
      setClaimSuccess(false);
    } finally {
      setIsClaiming(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Clear success message
   */
  const clearSuccess = () => {
    setClaimSuccess(false);
    setClaimTxId(null);
  };

  /**
   * Format time remaining as HH:MM:SS
   */
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return '00:00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Initial fetch and poll claim status every 60 seconds (reduced from 30)
   */
  useEffect(() => {
    if (!walletAddress || !isConnected) return;
    
    // Initial fetch
    refreshClaimData();

    // Poll less frequently to reduce re-renders
    const interval = setInterval(() => {
      refreshClaimData();
    }, 60000); // Poll every 60 seconds instead of 30

    return () => clearInterval(interval);
  }, [walletAddress, isConnected]); // Only depend on wallet changes, not refreshClaimData

  /**
   * Countdown timer - updates every second (client-side only, no API calls)
   */
  useEffect(() => {
    if (timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up! Trigger a refresh
          setTimeout(() => refreshClaimData(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]); // Only depend on timeRemaining, not refreshClaimData

  return {
    canClaim,
    blocksUntilClaim,
    timeUntilClaim: formatTimeRemaining(timeRemaining),
    isClaiming,
    isLoading,
    lastClaimBlock,
    totalClaimed,
    error,
    claimSuccess,
    claimTxId,
    handleClaim,
    refreshClaimData,
    clearError,
    clearSuccess,
  };
};
