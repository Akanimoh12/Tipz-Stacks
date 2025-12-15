// Achievement System - Defines all achievements and their unlock conditions

export type AchievementCategory = 'tipper' | 'creator' | 'claim' | 'platform';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type AchievementMetric = 
  | 'tips-sent' 
  | 'stx-given' 
  | 'cheer-given' 
  | 'creators-supported' 
  | 'tips-received'
  | 'supporters-count'
  | 'leaderboard-rank'
  | 'claims-made'
  | 'claim-streak'
  | 'platform-age'
  | 'referrals'
  | 'shares';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  threshold: number;
  metric: AchievementMetric;
  reward: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UnlockedAchievement extends Achievement {
  isUnlocked: true;
  progress: number;
  unlockedAt: string;
}

export interface LockedAchievement extends Achievement {
  isUnlocked: false;
  progress: number;
  unlockedAt: null;
}

export type UserAchievement = UnlockedAchievement | LockedAchievement;

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Tipper Achievements
  {
    id: 'first-tip',
    name: 'First Tip',
    description: 'Sent your first tip to a creator',
    category: 'tipper',
    tier: 'bronze',
    icon: '🎯',
    threshold: 1,
    metric: 'tips-sent',
    reward: 'Bronze badge on profile',
    points: 10,
    rarity: 'common',
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Sent 5 tips to creators',
    category: 'tipper',
    tier: 'bronze',
    icon: '🚀',
    threshold: 5,
    metric: 'tips-sent',
    reward: 'Bronze badge on profile',
    points: 10,
    rarity: 'common',
  },
  {
    id: 'supporter',
    name: 'Supporter',
    description: 'Sent 25 tips to creators',
    category: 'tipper',
    tier: 'silver',
    icon: '⭐',
    threshold: 25,
    metric: 'tips-sent',
    reward: 'Silver badge on profile',
    points: 25,
    rarity: 'common',
  },
  {
    id: 'generous-supporter',
    name: 'Generous Supporter',
    description: 'Sent 100 tips to creators',
    category: 'tipper',
    tier: 'gold',
    icon: '🌟',
    threshold: 100,
    metric: 'tips-sent',
    reward: 'Gold badge on profile',
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'super-supporter',
    name: 'Super Supporter',
    description: 'Sent 500 tips to creators',
    category: 'tipper',
    tier: 'platinum',
    icon: '💫',
    threshold: 500,
    metric: 'tips-sent',
    reward: 'Platinum badge on profile',
    points: 100,
    rarity: 'epic',
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Sent 1,000 tips to creators',
    category: 'tipper',
    tier: 'diamond',
    icon: '👑',
    threshold: 1000,
    metric: 'tips-sent',
    reward: 'Diamond badge on profile',
    points: 250,
    rarity: 'legendary',
  },
  {
    id: 'whale',
    name: 'Whale',
    description: 'Given 100 STX to creators',
    category: 'tipper',
    tier: 'platinum',
    icon: '🐋',
    threshold: 100,
    metric: 'stx-given',
    reward: 'Platinum badge on profile',
    points: 100,
    rarity: 'epic',
  },
  {
    id: 'mega-whale',
    name: 'Mega Whale',
    description: 'Given 1,000 STX to creators',
    category: 'tipper',
    tier: 'diamond',
    icon: '🐳',
    threshold: 1000,
    metric: 'stx-given',
    reward: 'Diamond badge on profile',
    points: 250,
    rarity: 'legendary',
  },
  {
    id: 'cheer-champion',
    name: 'CHEER Champion',
    description: 'Given 10,000 CHEER to creators',
    category: 'tipper',
    tier: 'platinum',
    icon: '🎊',
    threshold: 10000,
    metric: 'cheer-given',
    reward: 'Platinum badge on profile',
    points: 100,
    rarity: 'epic',
  },
  {
    id: 'diverse-supporter',
    name: 'Diverse Supporter',
    description: 'Supported 10 different creators',
    category: 'tipper',
    tier: 'silver',
    icon: '🎨',
    threshold: 10,
    metric: 'creators-supported',
    reward: 'Silver badge on profile',
    points: 25,
    rarity: 'common',
  },
  {
    id: 'patron',
    name: 'Patron',
    description: 'Supported 50 different creators',
    category: 'tipper',
    tier: 'gold',
    icon: '🏛️',
    threshold: 50,
    metric: 'creators-supported',
    reward: 'Gold badge on profile',
    points: 50,
    rarity: 'rare',
  },
  
  // Creator Achievements
  {
    id: 'welcome-creator',
    name: 'Welcome Creator',
    description: 'Registered as a creator',
    category: 'creator',
    tier: 'bronze',
    icon: '🎭',
    threshold: 1,
    metric: 'tips-received',
    reward: 'Bronze badge on profile',
    points: 10,
    rarity: 'common',
  },
  {
    id: 'first-support',
    name: 'First Support',
    description: 'Received your first tip',
    category: 'creator',
    tier: 'bronze',
    icon: '💝',
    threshold: 1,
    metric: 'tips-received',
    reward: 'Bronze badge on profile',
    points: 10,
    rarity: 'common',
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Have 10 supporters',
    category: 'creator',
    tier: 'silver',
    icon: '🌠',
    threshold: 10,
    metric: 'supporters-count',
    reward: 'Silver badge on profile',
    points: 25,
    rarity: 'common',
  },
  {
    id: 'popular',
    name: 'Popular',
    description: 'Have 50 supporters',
    category: 'creator',
    tier: 'gold',
    icon: '🔥',
    threshold: 50,
    metric: 'supporters-count',
    reward: 'Gold badge on profile',
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Have 100 supporters',
    category: 'creator',
    tier: 'platinum',
    icon: '💎',
    threshold: 100,
    metric: 'supporters-count',
    reward: 'Platinum badge on profile',
    points: 100,
    rarity: 'epic',
  },
  {
    id: 'top-100',
    name: 'Top 100',
    description: 'Reached top 100 on creator leaderboard',
    category: 'creator',
    tier: 'silver',
    icon: '🏆',
    threshold: 100,
    metric: 'leaderboard-rank',
    reward: 'Silver badge on profile',
    points: 25,
    rarity: 'common',
  },
  {
    id: 'top-50',
    name: 'Top 50',
    description: 'Reached top 50 on creator leaderboard',
    category: 'creator',
    tier: 'gold',
    icon: '🥉',
    threshold: 50,
    metric: 'leaderboard-rank',
    reward: 'Gold badge on profile',
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'top-25',
    name: 'Top 25',
    description: 'Reached top 25 on creator leaderboard',
    category: 'creator',
    tier: 'gold',
    icon: '🥈',
    threshold: 25,
    metric: 'leaderboard-rank',
    reward: 'Gold badge on profile',
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'top-10',
    name: 'Top 10',
    description: 'Reached top 10 on creator leaderboard',
    category: 'creator',
    tier: 'platinum',
    icon: '🥇',
    threshold: 10,
    metric: 'leaderboard-rank',
    reward: 'Platinum badge on profile',
    points: 100,
    rarity: 'epic',
  },
  {
    id: 'top-3',
    name: 'Top 3',
    description: 'Reached top 3 on creator leaderboard',
    category: 'creator',
    tier: 'diamond',
    icon: '👑',
    threshold: 3,
    metric: 'leaderboard-rank',
    reward: 'Diamond badge on profile',
    points: 250,
    rarity: 'legendary',
  },
  
  // Claim Achievements
  {
    id: 'daily-claimer',
    name: 'Daily Claimer',
    description: 'Claimed your first CHEER tokens',
    category: 'claim',
    tier: 'bronze',
    icon: '🎁',
    threshold: 1,
    metric: 'claims-made',
    reward: 'Bronze badge on profile',
    points: 10,
    rarity: 'common',
  },
  {
    id: 'week-streak',
    name: 'Week Streak',
    description: 'Claimed for 7 consecutive days',
    category: 'claim',
    tier: 'silver',
    icon: '📅',
    threshold: 7,
    metric: 'claim-streak',
    reward: 'Silver badge on profile',
    points: 25,
    rarity: 'common',
  },
  {
    id: 'month-streak',
    name: 'Month Streak',
    description: 'Claimed for 30 consecutive days',
    category: 'claim',
    tier: 'gold',
    icon: '📆',
    threshold: 30,
    metric: 'claim-streak',
    reward: 'Gold badge on profile',
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'consistent-claimer',
    name: 'Consistent Claimer',
    description: 'Made 100 total claims',
    category: 'claim',
    tier: 'platinum',
    icon: '💯',
    threshold: 100,
    metric: 'claims-made',
    reward: 'Platinum badge on profile',
    points: 100,
    rarity: 'epic',
  },
  {
    id: 'year-streak',
    name: 'Year Streak',
    description: 'Claimed for 365 consecutive days',
    category: 'claim',
    tier: 'diamond',
    icon: '🎯',
    threshold: 365,
    metric: 'claim-streak',
    reward: 'Diamond badge on profile',
    points: 250,
    rarity: 'legendary',
  },
  
  // Platform Achievements
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    category: 'platform',
    tier: 'gold',
    icon: '🚀',
    threshold: 30,
    metric: 'platform-age',
    reward: 'Gold badge on profile',
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'community-builder',
    name: 'Community Builder',
    description: 'Referred 5 users to the platform',
    category: 'platform',
    tier: 'gold',
    icon: '🤝',
    threshold: 5,
    metric: 'referrals',
    reward: 'Gold badge on profile',
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Shared 10 times on social media',
    category: 'platform',
    tier: 'silver',
    icon: '🦋',
    threshold: 10,
    metric: 'shares',
    reward: 'Silver badge on profile',
    points: 25,
    rarity: 'common',
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Active for 365 days',
    category: 'platform',
    tier: 'platinum',
    icon: '🎖️',
    threshold: 365,
    metric: 'platform-age',
    reward: 'Platinum badge on profile',
    points: 100,
    rarity: 'epic',
  },
];

// Helper functions
export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getAchievementsByTier = (tier: AchievementTier): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.tier === tier);
};

export const getTierColor = (tier: AchievementTier): string => {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  };
  return colors[tier];
};

export const getRarityColor = (rarity: 'common' | 'rare' | 'epic' | 'legendary'): string => {
  const colors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };
  return colors[rarity];
};

export const calculateTotalPoints = (unlockedAchievements: UnlockedAchievement[]): number => {
  return unlockedAchievements.reduce((total, achievement) => total + achievement.points, 0);
};

export const calculateProgress = (current: number, threshold: number): number => {
  return Math.min(Math.round((current / threshold) * 100), 100);
};
