import { useState, useEffect, useCallback } from 'react';
import { fetchCallReadOnlyFunction, cvToJSON, standardPrincipalCV } from '@stacks/transactions';
import { getNetwork } from '../services/stacksService';
import { TIPZ_CORE_CONTRACT } from '../utils/constants';

const CACHE_DURATION = 30000; // 30 seconds
const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds

interface CreatorLeaderboardEntry {
  address: string;
  name: string;
  profileImage: string;
  stxReceived: number;
  cheerReceived: number;
  score: number;
  rank: number;
  supportersCount: number;
  metadata?: {
    tags?: string[];
    bio?: string;
  };
}

interface TipperLeaderboardEntry {
  address: string;
  displayName: string;
  stxGiven: number;
  cheerGiven: number;
  score: number;
  rank: number;
  creatorsSupported: number;
  badges: string[];
}

interface LeaderboardState {
  creators: CreatorLeaderboardEntry[];
  tippers: TipperLeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  currentUserRank: { creators: number | null; tippers: number | null };
}

export const useLeaderboard = (userAddress?: string) => {
  const [state, setState] = useState<LeaderboardState>({
    creators: [],
    tippers: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    currentUserRank: { creators: null, tippers: null },
  });

  const [cache, setCache] = useState<{
    creators: { data: CreatorLeaderboardEntry[]; timestamp: number } | null;
    tippers: { data: TipperLeaderboardEntry[]; timestamp: number } | null;
  }>({
    creators: null,
    tippers: null,
  });

  // Calculate creator score from contract
  const calculateCreatorScore = useCallback(async (address: string): Promise<number> => {
    try {
      const result = await fetchCallReadOnlyFunction({
        network: getNetwork(),
        contractAddress: TIPZ_CORE_CONTRACT.address,
        contractName: TIPZ_CORE_CONTRACT.name,
        functionName: 'calculate-creator-score',
        functionArgs: [standardPrincipalCV(address)],
        senderAddress: address,
      });

      const jsonResult = cvToJSON(result);
      return Number(jsonResult.value?.value || 0);
    } catch (error) {
      console.error('Error calculating creator score:', error);
      return 0;
    }
  }, []);

  // Calculate tipper score from contract
  const calculateTipperScore = useCallback(async (address: string): Promise<number> => {
    try {
      const result = await fetchCallReadOnlyFunction({
        network: getNetwork(),
        contractAddress: TIPZ_CORE_CONTRACT.address,
        contractName: TIPZ_CORE_CONTRACT.name,
        functionName: 'calculate-tipper-score',
        functionArgs: [standardPrincipalCV(address)],
        senderAddress: address,
      });

      const jsonResult = cvToJSON(result);
      return Number(jsonResult.value?.value || 0);
    } catch (error) {
      console.error('Error calculating tipper score:', error);
      return 0;
    }
  }, []);

  // Fetch all creators from contract
  const fetchCreatorLeaderboard = useCallback(async (): Promise<CreatorLeaderboardEntry[]> => {
    // Check cache first
    if (cache.creators && Date.now() - cache.creators.timestamp < CACHE_DURATION) {
      return cache.creators.data;
    }

    try {
      // Get all creators from contract
      const creatorsResult = await fetchCallReadOnlyFunction({
        network: getNetwork(),
        contractAddress: TIPZ_CORE_CONTRACT.address,
        contractName: TIPZ_CORE_CONTRACT.name,
        functionName: 'get-all-creators',
        functionArgs: [],
        senderAddress: TIPZ_CORE_CONTRACT.address,
      });

      const creatorsJson = cvToJSON(creatorsResult);
      const creatorsList = creatorsJson.value || [];

      // Fetch scores and details for each creator
      const creatorsWithScores = await Promise.all(
        creatorsList.map(async (creator: any) => {
          const address = creator.value.address?.value || creator.value;
          const score = await calculateCreatorScore(address);

          // Get creator info
          const infoResult = await fetchCallReadOnlyFunction({
            network: getNetwork(),
            contractAddress: TIPZ_CORE_CONTRACT.address,
            contractName: TIPZ_CORE_CONTRACT.name,
            functionName: 'get-creator-info',
            functionArgs: [standardPrincipalCV(address)],
            senderAddress: address,
          });

          const info = cvToJSON(infoResult);
          const creatorData = info.value?.value || {};

          return {
            address,
            name: creatorData.name?.value || 'Anonymous Creator',
            profileImage: creatorData['metadata-uri']?.value || '',
            stxReceived: Number(creatorData['total-stx-received']?.value || 0) / 1000000,
            cheerReceived: Number(creatorData['total-cheer-received']?.value || 0),
            score,
            rank: 0, // Will be assigned after sorting
            supportersCount: Number(creatorData['supporters-count']?.value || 0),
          };
        })
      );

      // Sort by score (descending) and assign ranks
      const sorted = creatorsWithScores.sort((a, b) => b.score - a.score);
      
      let currentRank = 1;
      const ranked = sorted.map((creator, index) => {
        // Handle ties - same score gets same rank
        if (index > 0 && creator.score < sorted[index - 1].score) {
          currentRank = index + 1;
        }
        return { ...creator, rank: currentRank };
      });

      // Update cache
      setCache(prev => ({
        ...prev,
        creators: { data: ranked, timestamp: Date.now() },
      }));

      return ranked;
    } catch (error) {
      console.error('Error fetching creator leaderboard:', error);
      throw error;
    }
  }, [cache.creators, calculateCreatorScore]);

  // Fetch all tippers from contract
  const fetchTipperLeaderboard = useCallback(async (): Promise<TipperLeaderboardEntry[]> => {
    // Check cache first
    if (cache.tippers && Date.now() - cache.tippers.timestamp < CACHE_DURATION) {
      return cache.tippers.data;
    }

    try {
      // Get all tippers from contract
      const tippersResult = await fetchCallReadOnlyFunction({
        network: getNetwork(),
        contractAddress: TIPZ_CORE_CONTRACT.address,
        contractName: TIPZ_CORE_CONTRACT.name,
        functionName: 'get-all-tippers',
        functionArgs: [],
        senderAddress: TIPZ_CORE_CONTRACT.address,
      });

      const tippersJson = cvToJSON(tippersResult);
      const tippersList = tippersJson.value || [];

      // Fetch scores and details for each tipper
      const tippersWithScores = await Promise.all(
        tippersList.map(async (tipper: any) => {
          const address = tipper.value?.address?.value || tipper.value;
          const score = await calculateTipperScore(address);

          // Get tipper info
          const infoResult = await fetchCallReadOnlyFunction({
            network: getNetwork(),
            contractAddress: TIPZ_CORE_CONTRACT.address,
            contractName: TIPZ_CORE_CONTRACT.name,
            functionName: 'get-tipper-info',
            functionArgs: [standardPrincipalCV(address)],
            senderAddress: address,
          });

          const info = cvToJSON(infoResult);
          const tipperData = info.value?.value || {};

          const stxGiven = Number(tipperData['total-stx-given']?.value || 0) / 1000000;
          const cheerGiven = Number(tipperData['total-cheer-given']?.value || 0);
          const creatorsSupported = Number(tipperData['creators-supported']?.value || 0);

          // Calculate achievement badges
          const badges: string[] = [];
          const totalTips = Number(tipperData['total-tips']?.value || 0);
          
          if (totalTips >= 100) badges.push('generous');
          if (creatorsSupported >= 10) badges.push('superfan');
          if (stxGiven >= 1000) badges.push('whale');
          if (cheerGiven >= 10000) badges.push('cheer-champion');

          return {
            address,
            displayName: tipperData.name?.value || `${address.slice(0, 6)}...${address.slice(-4)}`,
            stxGiven,
            cheerGiven,
            score,
            rank: 0, // Will be assigned after sorting
            creatorsSupported,
            badges,
          };
        })
      );

      // Sort by score (descending) and assign ranks
      const sorted = tippersWithScores.sort((a, b) => b.score - a.score);
      
      let currentRank = 1;
      const ranked = sorted.map((tipper, index) => {
        // Handle ties - same score gets same rank
        if (index > 0 && tipper.score < sorted[index - 1].score) {
          currentRank = index + 1;
        }
        return { ...tipper, rank: currentRank };
      });

      // Update cache
      setCache(prev => ({
        ...prev,
        tippers: { data: ranked, timestamp: Date.now() },
      }));

      return ranked;
    } catch (error) {
      console.error('Error fetching tipper leaderboard:', error);
      throw error;
    }
  }, [cache.tippers, calculateTipperScore]);

  // Find user's rank in both leaderboards
  const findUserRank = useCallback(
    (creators: CreatorLeaderboardEntry[], tippers: TipperLeaderboardEntry[]) => {
      if (!userAddress) return { creators: null, tippers: null };

      const creatorRank = creators.find(c => c.address === userAddress)?.rank || null;
      const tipperRank = tippers.find(t => t.address === userAddress)?.rank || null;

      return { creators: creatorRank, tippers: tipperRank };
    },
    [userAddress]
  );

  // Refresh both leaderboards
  const refreshLeaderboards = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [creators, tippers] = await Promise.all([
        fetchCreatorLeaderboard(),
        fetchTipperLeaderboard(),
      ]);

      const userRank = findUserRank(creators, tippers);

      setState({
        creators,
        tippers,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        currentUserRank: userRank,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboards',
      }));
    }
  }, [fetchCreatorLeaderboard, fetchTipperLeaderboard, findUserRank]);

  // Initial load
  useEffect(() => {
    refreshLeaderboards();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLeaderboards();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshLeaderboards]);

  return {
    ...state,
    refreshLeaderboards,
    isRefreshing: state.isLoading,
  };
};
