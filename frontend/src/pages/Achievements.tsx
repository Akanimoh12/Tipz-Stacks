import { useWallet } from '../hooks/useWallet';
import { useAchievements, type UserStats } from '../hooks/useAchievements';
import {
  AchievementTracker,
  AchievementProgress,
  UnlockModal,
  MilestoneTracker,
  AchievementNotification,
  useAchievementNotifications,
} from '../components/achievements';
import { ShareModal } from '../components/social';
import { useSocialShare, useShareableUrl } from '../hooks/useSocialShare';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

export const Achievements: React.FC = () => {
  const { walletAddress } = useWallet();
  const {
    allAchievements,
    unlockedAchievements,
    recentUnlock,
    nextAchievement,
    totalPoints,
    clearRecentUnlock,
    getUnlockedCountByCategory,
  } = useAchievements(walletAddress || undefined);

  const {
    notifications,
    dismissNotification,
  } = useAchievementNotifications();

  const {
    isShareModalOpen,
    shareData,
    openShareModal,
    closeShareModal,
  } = useSocialShare();

  const { createShareableUrl } = useShareableUrl();

  // Mock user stats - in production, fetch from blockchain/API
  const userStats: UserStats = {
    tipsSent: 15,
    stxGiven: 75,
    cheerGiven: 5000,
    creatorsSupported: 8,
    tipsReceived: 0,
    supportersCount: 0,
    leaderboardRank: 150,
    claimsMade: 12,
    claimStreak: 5,
    platformAge: 45,
    referrals: 2,
    shares: 6,
  };

  const categoryStats = [
    {
      category: 'tipper' as const,
      label: 'Tipper',
      icon: '💰',
      unlocked: getUnlockedCountByCategory('tipper'),
      total: allAchievements.filter(a => a.category === 'tipper').length,
    },
    {
      category: 'creator' as const,
      label: 'Creator',
      icon: '🎨',
      unlocked: getUnlockedCountByCategory('creator'),
      total: allAchievements.filter(a => a.category === 'creator').length,
    },
    {
      category: 'claim' as const,
      label: 'Claims',
      icon: '🎁',
      unlocked: getUnlockedCountByCategory('claim'),
      total: allAchievements.filter(a => a.category === 'claim').length,
    },
    {
      category: 'platform' as const,
      label: 'Platform',
      icon: '🚀',
      unlocked: getUnlockedCountByCategory('platform'),
      total: allAchievements.filter(a => a.category === 'platform').length,
    },
  ];

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAward className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600">
            Connect your wallet to view and track your achievements
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiAward className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          </div>
          <p className="text-gray-600">
            Track your progress and unlock rewards as you support creators
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categoryStats.map(stat => (
            <div
              key={stat.category}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <span className="text-sm font-semibold text-gray-500">
                  {stat.unlocked}/{stat.total}
                </span>
              </div>
              <h3 className="font-bold text-gray-900">{stat.label}</h3>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stat.unlocked / stat.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total Points */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FiTrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold opacity-90">Total Achievement Points</h3>
                <p className="text-4xl font-bold">{totalPoints}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Achievements Unlocked</p>
              <p className="text-3xl font-bold">{unlockedAchievements.length}</p>
            </div>
          </div>
        </div>

        {/* Next Achievement */}
        <div className="mb-8">
          <AchievementProgress nextAchievement={nextAchievement} variant="full" />
        </div>

        {/* Milestone Trackers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MilestoneTracker
            category="stx"
            currentValue={userStats.stxGiven}
          />
          <MilestoneTracker
            category="tips"
            currentValue={userStats.tipsSent}
          />
          <MilestoneTracker
            category="creators"
            currentValue={userStats.creatorsSupported}
          />
          <MilestoneTracker
            category="claims"
            currentValue={userStats.claimsMade}
          />
        </div>

        {/* Achievement Tracker */}
        <AchievementTracker
          achievements={allAchievements}
        />

        {/* Unlock Modal */}
        {recentUnlock && (
          <UnlockModal
            achievement={recentUnlock}
            nextAchievement={nextAchievement}
            onClose={clearRecentUnlock}
            onShare={() => {
              const shareUrl = createShareableUrl('/achievements', {
                action: 'achievement_unlock',
              });
              openShareModal({
                type: 'achievement',
                url: shareUrl,
                achievementName: recentUnlock.name,
                progress: `${unlockedAchievements.length}/${allAchievements.length} achievements unlocked`,
              });
            }}
            onViewAll={() => {
              clearRecentUnlock();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Share Modal */}
        {shareData && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={closeShareModal}
            shareData={shareData}
          />
        )}

        {/* Notifications */}
        <AchievementNotification
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </div>
    </div>
  );
};
