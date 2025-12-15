import { useState, useEffect, useCallback } from 'react';
import { TIPZ_CORE_CONTRACT } from '../utils/constants';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface ProfileData {
  address: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  memberSince?: Date;
  totalStxGiven: number;
  totalCheerGiven: number;
  creatorsSupported: number;
  totalTips: number;
  rank?: number;
  rankMovement?: number;
  streak?: number;
  isCreator?: boolean;
  creatorStats?: {
    totalStxReceived: number;
    totalCheerReceived: number;
    supportersCount: number;
    registeredAt: Date;
  };
}

interface TipTransaction {
  id: string;
  creatorAddress: string;
  creatorName?: string;
  amount: number;
  token: 'STX' | 'CHEER';
  timestamp: Date;
  txId: string;
  status: 'confirmed' | 'pending' | 'failed';
  message?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'generosity' | 'diversity' | 'value' | 'cheer' | 'streak';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  threshold: number;
  unlocked: boolean;
  progress: number;
  icon: string;
}

interface SupportedCreator {
  address: string;
  name: string;
  profileImage?: string;
  totalTipped: number;
  lastTipDate?: Date;
  tipCount: number;
}

interface UseProfileReturn {
  profileData: ProfileData | null;
  tippingHistory: TipTransaction[];
  achievements: Achievement[];
  supportedCreators: SupportedCreator[];
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  fetchTippingHistory: (address: string) => Promise<void>;
}

const profileCache = new Map<string, { data: ProfileData; timestamp: number }>();

export const useProfile = (address?: string): UseProfileReturn => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [tippingHistory, setTippingHistory] = useState<TipTransaction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [supportedCreators, setSupportedCreators] = useState<SupportedCreator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTipperProfile = useCallback(async (userAddress: string) => {
    if (!userAddress) return;

    // Check cache
    const cached = profileCache.get(userAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProfileData(cached.data);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching profile data for ${userAddress}...`);

      // Import contract functions
      const { isCreatorRegistered, getCreatorInfo, getTipperStats } = await import('../services/contractService');
      const { fetchCreatorMetadata } = await import('../services/pinataService');

      // Check if user is a registered creator
      const isCreator = await isCreatorRegistered(userAddress);
      let creatorInfo = null;
      let metadata: any = {};

      if (isCreator) {
        console.log('User is a registered creator, fetching creator info...');
        // Fetch creator info
        creatorInfo = await getCreatorInfo(userAddress);
        
        // Fetch IPFS metadata
        if (creatorInfo?.metadataUri) {
          try {
            metadata = await fetchCreatorMetadata(creatorInfo.metadataUri);
          } catch (err) {
            console.warn('Failed to fetch creator metadata:', err);
          }
        }
      }

      // Fetch tipper stats from contract
      const tipperStats = await getTipperStats(userAddress);

      // Build profile data from real sources
      const profile: ProfileData = {
        address: userAddress,
        displayName: creatorInfo?.name || metadata.name || undefined,
        bio: metadata.bio || undefined,
        profileImage: metadata.profileImage || undefined,
        memberSince: isCreator && creatorInfo ? new Date(creatorInfo.createdAt * 1000) : undefined,
        totalStxGiven: tipperStats.totalStxGiven / 1_000_000, // Convert to STX
        totalCheerGiven: tipperStats.totalCheerGiven,
        creatorsSupported: tipperStats.creatorsSupported,
        totalTips: 0, // Will calculate from history
        rank: undefined,
        rankMovement: 0,
        streak: 0,
        isCreator,
        creatorStats: isCreator && creatorInfo ? {
          totalStxReceived: creatorInfo.totalStxReceived / 1_000_000,
          totalCheerReceived: creatorInfo.totalCheerReceived,
          supportersCount: creatorInfo.supportersCount,
          registeredAt: new Date(creatorInfo.createdAt * 1000),
        } : undefined,
      };

      console.log('Profile data loaded successfully:', profile);

      // Cache profile data
      profileCache.set(userAddress, { data: profile, timestamp: Date.now() });
      setProfileData(profile);
    } catch (err) {
      console.error('Error fetching tipper profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTippingHistory = useCallback(async (userAddress: string) => {
    if (!userAddress) return;

    setIsLoading(true);
    try {
      console.log(`Fetching tipping history for ${userAddress}...`);
      
      const apiUrl = import.meta.env.VITE_STACKS_API || 'https://api.testnet.hiro.so';
      const { address, name } = TIPZ_CORE_CONTRACT;
      const contractId = `${address}.${name}`;

      // Fetch events where user is the tipper
      const response = await fetch(
        `${apiUrl}/extended/v1/contract/${contractId}/events?limit=100&offset=0`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      const data = await response.json();

      // Parse events to extract tips
      const tips: TipTransaction[] = data.results
        .filter((event: any) => {
          const logValue = event.contract_log?.value?.repr || '';
          return logValue.includes(userAddress) && logValue.includes('tip');
        })
        .map((event: any, index: number) => {
          try {
            const logValue = event.contract_log.value.repr;
            
            // Extract transaction details
            const amountMatch = logValue.match(/amount:\s*u(\d+)/);
            const creatorMatch = logValue.match(/creator:\s*([A-Z0-9]+)/);
            const tokenMatch = logValue.match(/token:\s*"([^"]+)"/);

            return {
              id: `${event.tx_id}-${index}`,
              txId: event.tx_id,
              creatorAddress: creatorMatch ? creatorMatch[1] : '',
              creatorName: '', // Will fetch separately
              amount: amountMatch ? Number(amountMatch[1]) : 0,
              token: (tokenMatch ? tokenMatch[1] : 'STX') as ('STX' | 'CHEER'),
              timestamp: new Date(event.block_time_iso),
              status: 'confirmed' as const,
            };
          } catch (err) {
            console.warn('Error parsing transaction:', err);
            return null;
          }
        })
        .filter((tip: TipTransaction | null): tip is TipTransaction => tip !== null);

      console.log(`Found ${tips.length} tip transactions`);

      // Fetch creator names for each tip
      const { getCreatorInfo } = await import('../services/contractService');
      for (const tip of tips) {
        try {
          const creatorInfo = await getCreatorInfo(tip.creatorAddress);
          tip.creatorName = creatorInfo?.name || 'Unknown Creator';
        } catch (err) {
          tip.creatorName = 'Unknown Creator';
        }
      }

      // Sort by timestamp (newest first)
      const sortedTips = tips.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setTippingHistory(sortedTips);

      // Update profile with total tips count
      if (profileData) {
        setProfileData({ ...profileData, totalTips: sortedTips.length });
      }
    } catch (err) {
      console.error('Error fetching tipping history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tipping history');
    } finally {
      setIsLoading(false);
    }
  }, [profileData]);

  const calculateAchievements = useCallback((profile: ProfileData, history: TipTransaction[]): Achievement[] => {
    const achievementDefinitions: Omit<Achievement, 'unlocked' | 'progress'>[] = [
      // Generosity Milestones
      { id: 'first-tip', name: 'First Tip', description: 'Send your first tip', category: 'generosity', tier: 'bronze', threshold: 1, icon: '🎉' },
      { id: 'supporter', name: 'Supporter', description: 'Send 10 tips', category: 'generosity', tier: 'bronze', threshold: 10, icon: '👏' },
      { id: 'generous', name: 'Generous Supporter', description: 'Send 100 tips', category: 'generosity', tier: 'silver', threshold: 100, icon: '🌟' },
      { id: 'super', name: 'Super Supporter', description: 'Send 500 tips', category: 'generosity', tier: 'gold', threshold: 500, icon: '⭐' },
      { id: 'legend', name: 'Legend', description: 'Send 1000 tips', category: 'generosity', tier: 'platinum', threshold: 1000, icon: '👑' },
      
      // Diversity Awards
      { id: 'explorer', name: 'Explorer', description: 'Support 5 different creators', category: 'diversity', tier: 'bronze', threshold: 5, icon: '🧭' },
      { id: 'patron', name: 'Patron', description: 'Support 25 different creators', category: 'diversity', tier: 'silver', threshold: 25, icon: '🎨' },
      { id: 'benefactor', name: 'Benefactor', description: 'Support 100 different creators', category: 'diversity', tier: 'gold', threshold: 100, icon: '💎' },
      
      // Value Milestones
      { id: 'starter', name: 'Starter', description: 'Give 10 STX total', category: 'value', tier: 'bronze', threshold: 10, icon: '💰' },
      { id: 'contributor', name: 'Contributor', description: 'Give 100 STX total', category: 'value', tier: 'silver', threshold: 100, icon: '💵' },
      { id: 'whale', name: 'Whale', description: 'Give 1000 STX total', category: 'value', tier: 'gold', threshold: 1000, icon: '🐋' },
      
      // CHEER Milestones
      { id: 'cheer-fan', name: 'CHEER Fan', description: 'Give 1,000 CHEER', category: 'cheer', tier: 'silver', threshold: 1000, icon: '📣' },
      { id: 'cheer-champion', name: 'CHEER Champion', description: 'Give 10,000 CHEER', category: 'cheer', tier: 'gold', threshold: 10000, icon: '🏆' },
      
      // Streak Awards
      { id: 'consistent', name: 'Consistent', description: '7-day tipping streak', category: 'streak', tier: 'bronze', threshold: 7, icon: '🔥' },
      { id: 'dedicated', name: 'Dedicated', description: '30-day tipping streak', category: 'streak', tier: 'silver', threshold: 30, icon: '⚡' },
      { id: 'unstoppable', name: 'Unstoppable', description: '100-day tipping streak', category: 'streak', tier: 'gold', threshold: 100, icon: '🚀' },
    ];

    const totalTips = profile.totalTips || history.length;
    const creatorsSupported = profile.creatorsSupported;
    const totalStx = profile.totalStxGiven;
    const totalCheer = profile.totalCheerGiven;
    const streak = profile.streak || 0;

    return achievementDefinitions.map(def => {
      let currentValue = 0;
      
      switch (def.category) {
        case 'generosity':
          currentValue = totalTips;
          break;
        case 'diversity':
          currentValue = creatorsSupported;
          break;
        case 'value':
          currentValue = totalStx;
          break;
        case 'cheer':
          currentValue = totalCheer;
          break;
        case 'streak':
          currentValue = streak;
          break;
      }

      return {
        ...def,
        unlocked: currentValue >= def.threshold,
        progress: Math.min(currentValue / def.threshold, 1),
      };
    });
  }, []);

  const fetchSupportedCreators = useCallback(async (userAddress: string, history: TipTransaction[]) => {
    if (!userAddress) return;

    try {
      console.log('Fetching supported creators from transaction history...');
      
      // Group tips by creator
      const creatorTips = new Map<string, { count: number; total: number }>();

      history.forEach((tip) => {
        const existing = creatorTips.get(tip.creatorAddress) || { count: 0, total: 0 };
        creatorTips.set(tip.creatorAddress, {
          count: existing.count + 1,
          total: existing.total + (tip.token === 'STX' ? tip.amount / 1_000_000 : tip.amount),
        });
      });

      console.log(`Found ${creatorTips.size} unique creators supported`);

      // Convert to supported creators list
      const supported: SupportedCreator[] = [];

      const { getCreatorInfo } = await import('../services/contractService');
      const { fetchCreatorMetadata } = await import('../services/pinataService');

      for (const [address, stats] of creatorTips.entries()) {
        try {
          const info = await getCreatorInfo(address);
          if (!info) continue;

          // Fetch metadata for profile image
          let profileImage = '';
          if (info.metadataUri) {
            try {
              const metadata = await fetchCreatorMetadata(info.metadataUri);
              profileImage = metadata.profileImage || '';
            } catch (err) {
              console.warn(`Failed to fetch metadata for ${address}`);
            }
          }

          supported.push({
            address,
            name: info.name,
            profileImage,
            totalTipped: stats.total,
            tipCount: stats.count,
            lastTipDate: history.find(h => h.creatorAddress === address)?.timestamp,
          });
        } catch (err) {
          console.warn(`Error fetching creator info for ${address}:`, err);
        }
      }

      // Sort by total tipped (descending)
      const sortedSupported = supported.sort((a, b) => b.totalTipped - a.totalTipped);
      
      setSupportedCreators(sortedSupported);
    } catch (err) {
      console.error('Error fetching supported creators:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!address) return;
    
    // Fetch profile first
    await fetchTipperProfile(address);
    // Then fetch history (which will also update totalTips in profile)
    await fetchTippingHistory(address);
  }, [address, fetchTipperProfile, fetchTippingHistory]);
  
  // Update supported creators when history changes
  useEffect(() => {
    if (address && tippingHistory.length > 0) {
      fetchSupportedCreators(address, tippingHistory);
    }
  }, [address, tippingHistory, fetchSupportedCreators]);

  // Update achievements when profile or history changes
  useEffect(() => {
    if (profileData) {
      const calculatedAchievements = calculateAchievements(profileData, tippingHistory);
      setAchievements(calculatedAchievements);
    }
  }, [profileData, tippingHistory, calculateAchievements]);

  // Initial load
  useEffect(() => {
    if (address) {
      refreshProfile();
    }
  }, [address, refreshProfile]);

  return {
    profileData,
    tippingHistory,
    achievements,
    supportedCreators,
    isLoading,
    error,
    refreshProfile,
    fetchTippingHistory,
  };
};
