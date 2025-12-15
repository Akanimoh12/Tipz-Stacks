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
      console.log('Fetching creator leaderboard...');
      
      // Get all registered creators using the improved getAllCreators function
      const { getAllCreators, getCreatorInfo } = await import('../services/contractService');
      const creatorAddresses = await getAllCreators();
      
      if (creatorAddresses.length === 0) {
        console.log('No creators found for leaderboard');
        return [];
      }

      console.log(`Calculating scores for ${creatorAddresses.length} creators...`);

      // Fetch data for each creator in parallel
      const creatorsData = await Promise.all(
        creatorAddresses.map(async (address) => {
          try {
            // Get creator info from contract
            const info = await getCreatorInfo(address);
            if (!info) return null;

            // Calculate score from contract
            const score = await calculateCreatorScore(address);

            // Fetch metadata for profile image
            let profileImage = '';
            let metadata: any = {};
            if (info.metadataUri) {
              try {
                const { fetchCreatorMetadata } = await import('../services/pinataService');
                metadata = await fetchCreatorMetadata(info.metadataUri);
                profileImage = metadata.profileImage || '';
              } catch (err) {
                console.warn(`Failed to fetch metadata for ${address}`);
              }
            }

            return {
              address,
              name: info.name,
              profileImage,
              stxReceived: info.totalStxReceived / 1_000_000, // Convert to STX
              cheerReceived: info.totalCheerReceived,
              score,
              rank: 0, // Will be assigned after sorting
              supportersCount: info.supportersCount,
              metadata: {
                tags: metadata.tags || [],
                bio: metadata.bio || '',
              },
            };
          } catch (error) {
            console.error(`Error fetching creator ${address}:`, error);
            return null;
          }
        })
      );

      // Filter out nulls and sort by score
      const validCreators = creatorsData
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .sort((a, b) => b.score - a.score);

      // Assign ranks
      validCreators.forEach((creator, index) => {
        creator.rank = index + 1;
      });

      console.log(`Leaderboard ready with ${validCreators.length} creators`);

      // Update cache
      setCache(prev => ({
        ...prev,
        creators: { data: validCreators, timestamp: Date.now() },
      }));

      return validCreators;
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
      console.log('Fetching tipper leaderboard...');
      
      // Query transaction events to find all tippers
      const apiUrl = import.meta.env.VITE_STACKS_API || 'https://api.testnet.hiro.so';
      const { address, name } = TIPZ_CORE_CONTRACT;
      const contractId = `${address}.${name}`;

      // Fetch all tip events
      const response = await fetch(
        `${apiUrl}/extended/v1/contract/${contractId}/events?limit=200&offset=0`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tipper data');
      }

      const data = await response.json();
      
      // Extract unique tipper addresses from events
      const tipperAddresses = new Set<string>();
      
      data.results.forEach((event: any) => {
        if (event.event_type === 'print_event') {
          const logValue = event.contract_log?.value?.repr;
          // Extract tipper address from event
          const tipperMatch = logValue?.match(/tipper:\s*([A-Z0-9]+)/);
          if (tipperMatch) {
            tipperAddresses.add(tipperMatch[1]);
          }
        }
      });

      console.log(`Found ${tipperAddresses.size} unique tippers`);

      if (tipperAddresses.size === 0) {
        console.log('No tippers found for leaderboard');
        return [];
      }

      // Fetch data for each tipper
      const { getTipperStats } = await import('../services/contractService');
      const tippersData = await Promise.all(
        Array.from(tipperAddresses).map(async (address) => {
          try {
            // Calculate tipper score from contract
            const score = await calculateTipperScore(address);

            // Get tipper stats
            const stats = await getTipperStats(address);

            return {
              address,
              displayName: address.slice(0, 6) + '...' + address.slice(-4),
              stxGiven: stats.totalStxGiven / 1_000_000,
              cheerGiven: stats.totalCheerGiven,
              score,
              rank: 0,
              creatorsSupported: stats.creatorsSupported,
              badges: [], // Calculate based on achievements
            };
          } catch (error) {
            console.error(`Error fetching tipper ${address}:`, error);
            return null;
          }
        })
      );

      // Filter and sort
      const validTippers = tippersData
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .sort((a, b) => b.score - a.score);

      // Assign ranks
      validTippers.forEach((tipper, index) => {
        tipper.rank = index + 1;
      });

      console.log(`Tipper leaderboard ready with ${validTippers.length} tippers`);

      // Update cache
      setCache(prev => ({
        ...prev,
        tippers: { data: validTippers, timestamp: Date.now() },
      }));

      return validTippers;
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
      console.log('Auto-refreshing leaderboard...');
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
