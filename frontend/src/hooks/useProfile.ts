import { useState, useEffect, useCallback } from 'react';
import { fetchCallReadOnlyFunction, cvToJSON, standardPrincipalCV } from '@stacks/transactions';
import { getNetwork } from '../services/stacksService';
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
}

interface TipTransaction {
  id: string;
  creatorAddress: string;
  creatorName?: string;
  amount: number;
  type: 'STX' | 'CHEER';
  timestamp: Date;
  txId: string;
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
  totalGiven: number;
  lastTipDate: Date;
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
      // Fetch tipper score from contract
      const network = getNetwork();
      const scoreResponse = await fetchCallReadOnlyFunction({
        contractAddress: TIPZ_CORE_CONTRACT.address,
        contractName: TIPZ_CORE_CONTRACT.name,
        functionName: 'calculate-tipper-score',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress,
      });

      // Score data can be used later for real data
      cvToJSON(scoreResponse);
      
      // Mock data for now - in production, fetch from blockchain events and IPFS
      const profile: ProfileData = {
        address: userAddress,
        displayName: undefined, // Fetch from IPFS metadata if available
        bio: undefined,
        profileImage: undefined,
        memberSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        totalStxGiven: 0,
        totalCheerGiven: 0,
        creatorsSupported: 0,
        totalTips: 0,
        rank: undefined,
        rankMovement: 0,
        streak: 0,
      };

      // Cache profile data
      profileCache.set(userAddress, { data: profile, timestamp: Date.now() });
      setProfileData(profile);
    } catch (err) {
      console.error('Error fetching tipper profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTippingHistory = useCallback(async (userAddress: string) => {
    if (!userAddress) return;

    setIsLoading(true);
    try {
      // In production, fetch from Stacks API blockchain events
      // Filter tip-sent and cheer-sent events by sender address
      
      // Mock data for now
      const mockHistory: TipTransaction[] = [
        {
          id: '1',
          creatorAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          creatorName: 'Alice Creator',
          amount: 5,
          type: 'STX',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          txId: '0x123...',
          message: 'Great work!',
        },
        {
          id: '2',
          creatorAddress: 'ST2JHG321N6TGQ1H3JH3DGWQ3KDGJ1D3DG9876D',
          creatorName: 'Bob Artist',
          amount: 100,
          type: 'CHEER',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          txId: '0x456...',
        },
      ];

      setTippingHistory(mockHistory);
    } catch (err) {
      console.error('Error fetching tipping history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const fetchSupportedCreators = useCallback(async (userAddress: string) => {
    if (!userAddress) return;

    try {
      // In production, aggregate from tipping history
      // Group by creator and calculate totals
      
      // Mock data for now
      const mockCreators: SupportedCreator[] = [
        {
          address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          name: 'Alice Creator',
          totalGiven: 25.5,
          lastTipDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
          tipCount: 5,
        },
        {
          address: 'ST2JHG321N6TGQ1H3JH3DGWQ3KDGJ1D3DG9876D',
          name: 'Bob Artist',
          totalGiven: 15.0,
          lastTipDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          tipCount: 3,
        },
      ];

      setSupportedCreators(mockCreators);
    } catch (err) {
      console.error('Error fetching supported creators:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!address) return;
    
    await Promise.all([
      fetchTipperProfile(address),
      fetchTippingHistory(address),
      fetchSupportedCreators(address),
    ]);
  }, [address, fetchTipperProfile, fetchTippingHistory, fetchSupportedCreators]);

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
