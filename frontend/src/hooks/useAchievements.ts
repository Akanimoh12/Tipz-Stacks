import { useState, useEffect, useCallback } from 'react';
import type { UserAchievement, UnlockedAchievement, LockedAchievement, AchievementMetric } from '../utils/achievementSystem';
import { ACHIEVEMENTS, calculateTotalPoints, calculateProgress } from '../utils/achievementSystem';

export interface UserStats {
  tipsSent: number;
  stxGiven: number;
  cheerGiven: number;
  creatorsSupported: number;
  tipsReceived: number;
  supportersCount: number;
  leaderboardRank: number;
  claimsMade: number;
  claimStreak: number;
  platformAge: number; // days since joined
  referrals: number;
  shares: number;
}

const STORAGE_KEY = 'tipz_unlocked_achievements';

export const useAchievements = (userAddress?: string) => {
  const [allAchievements, setAllAchievements] = useState<UserAchievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<LockedAchievement[]>([]);
  const [recentUnlock, setRecentUnlock] = useState<UnlockedAchievement | null>(null);
  const [nextAchievement, setNextAchievement] = useState<LockedAchievement | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load unlocked achievements from localStorage
  const loadUnlockedAchievements = useCallback((): string[] => {
    if (!userAddress) return [];
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userAddress}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load unlocked achievements:', error);
      return [];
    }
  }, [userAddress]);

  // Save unlocked achievements to localStorage
  const saveUnlockedAchievements = useCallback((achievementIds: string[]) => {
    if (!userAddress) return;
    
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userAddress}`, JSON.stringify(achievementIds));
    } catch (error) {
      console.error('Failed to save unlocked achievements:', error);
    }
  }, [userAddress]);

  // Get metric value from user stats
  const getMetricValue = (metric: AchievementMetric, stats: UserStats): number => {
    const metricMap: Record<AchievementMetric, keyof UserStats> = {
      'tips-sent': 'tipsSent',
      'stx-given': 'stxGiven',
      'cheer-given': 'cheerGiven',
      'creators-supported': 'creatorsSupported',
      'tips-received': 'tipsReceived',
      'supporters-count': 'supportersCount',
      'leaderboard-rank': 'leaderboardRank',
      'claims-made': 'claimsMade',
      'claim-streak': 'claimStreak',
      'platform-age': 'platformAge',
      'referrals': 'referrals',
      'shares': 'shares',
    };

    return stats[metricMap[metric]] || 0;
  };

  // Check achievements and update unlock status
  const checkAchievements = useCallback((stats: UserStats) => {
    if (!userAddress) return;

    setIsLoading(true);
    const unlockedIds = loadUnlockedAchievements();
    const newUnlocks: UnlockedAchievement[] = [];
    const unlocked: UnlockedAchievement[] = [];
    const locked: LockedAchievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      const metricValue = getMetricValue(achievement.metric, stats);
      const progress = calculateProgress(metricValue, achievement.threshold);
      const isUnlocked = unlockedIds.includes(achievement.id) || metricValue >= achievement.threshold;

      if (isUnlocked) {
        const unlockedAchievement: UnlockedAchievement = {
          ...achievement,
          isUnlocked: true,
          progress: 100,
          unlockedAt: unlockedIds.includes(achievement.id) 
            ? new Date().toISOString() 
            : new Date().toISOString(),
        };
        unlocked.push(unlockedAchievement);

        // Check if this is a new unlock
        if (!unlockedIds.includes(achievement.id)) {
          newUnlocks.push(unlockedAchievement);
        }
      } else {
        locked.push({
          ...achievement,
          isUnlocked: false,
          progress,
          unlockedAt: null,
        });
      }
    });

    // Save new unlocks
    if (newUnlocks.length > 0) {
      const allUnlockedIds = [...unlockedIds, ...newUnlocks.map(a => a.id)];
      saveUnlockedAchievements(allUnlockedIds);
      setRecentUnlock(newUnlocks[0]); // Show modal for first new unlock
    }

    setUnlockedAchievements(unlocked);
    setLockedAchievements(locked);
    setAllAchievements([...unlocked, ...locked]);
    setTotalPoints(calculateTotalPoints(unlocked));

    // Find next achievement to unlock (highest progress)
    const nextToUnlock = locked.sort((a, b) => b.progress - a.progress)[0];
    setNextAchievement(nextToUnlock || null);

    setIsLoading(false);
  }, [userAddress, loadUnlockedAchievements, saveUnlockedAchievements]);

  // Manually unlock an achievement (for testing or admin)
  const unlockAchievement = useCallback((achievementId: string) => {
    if (!userAddress) return;

    const unlockedIds = loadUnlockedAchievements();
    if (unlockedIds.includes(achievementId)) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const unlockedAchievement: UnlockedAchievement = {
      ...achievement,
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date().toISOString(),
    };

    saveUnlockedAchievements([...unlockedIds, achievementId]);
    setUnlockedAchievements(prev => [...prev, unlockedAchievement]);
    setLockedAchievements(prev => prev.filter(a => a.id !== achievementId));
    setRecentUnlock(unlockedAchievement);
    setTotalPoints(prev => prev + achievement.points);
  }, [userAddress, loadUnlockedAchievements, saveUnlockedAchievements]);

  // Calculate progress for a specific achievement
  const getAchievementProgress = useCallback((achievementId: string, stats: UserStats): number => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return 0;

    const metricValue = getMetricValue(achievement.metric, stats);
    return calculateProgress(metricValue, achievement.threshold);
  }, []);

  // Get next achievement to unlock
  const getNextAchievement = useCallback((): LockedAchievement | null => {
    return nextAchievement;
  }, [nextAchievement]);

  // Get total points
  const getTotalPoints = useCallback((): number => {
    return totalPoints;
  }, [totalPoints]);

  // Clear recent unlock (dismiss modal)
  const clearRecentUnlock = useCallback(() => {
    setRecentUnlock(null);
  }, []);

  // Get achievements by category
  const getAchievementsByCategory = useCallback((category: string) => {
    return allAchievements.filter(a => a.category === category);
  }, [allAchievements]);

  // Get unlocked count per category
  const getUnlockedCountByCategory = useCallback((category: string): number => {
    return unlockedAchievements.filter(a => a.category === category).length;
  }, [unlockedAchievements]);

  // Initialize achievements on mount
  useEffect(() => {
    if (userAddress) {
      const unlockedIds = loadUnlockedAchievements();
      const unlocked: UnlockedAchievement[] = [];
      const locked: LockedAchievement[] = [];

      ACHIEVEMENTS.forEach(achievement => {
        if (unlockedIds.includes(achievement.id)) {
          unlocked.push({
            ...achievement,
            isUnlocked: true,
            progress: 100,
            unlockedAt: new Date().toISOString(),
          });
        } else {
          locked.push({
            ...achievement,
            isUnlocked: false,
            progress: 0,
            unlockedAt: null,
          });
        }
      });

      setUnlockedAchievements(unlocked);
      setLockedAchievements(locked);
      setAllAchievements([...unlocked, ...locked]);
      setTotalPoints(calculateTotalPoints(unlocked));
    }
  }, [userAddress, loadUnlockedAchievements]);

  return {
    allAchievements,
    unlockedAchievements,
    lockedAchievements,
    recentUnlock,
    nextAchievement,
    totalPoints,
    isLoading,
    checkAchievements,
    unlockAchievement,
    getAchievementProgress,
    getNextAchievement,
    getTotalPoints,
    clearRecentUnlock,
    getAchievementsByCategory,
    getUnlockedCountByCategory,
  };
};
