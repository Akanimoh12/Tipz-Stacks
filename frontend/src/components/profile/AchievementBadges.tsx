import React, { useState } from 'react';
import { FiLock } from 'react-icons/fi';

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

interface AchievementBadgesProps {
  achievements: Achievement[];
  showProgress?: boolean;
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ 
  achievements, 
  showProgress = true 
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getTierColor = (tier: string, unlocked: boolean) => {
    if (!unlocked) return 'bg-gray-300 text-gray-600 border-gray-400';
    
    switch (tier) {
      case 'bronze':
        return 'bg-linear-to-br from-orange-700 to-orange-900 text-white border-orange-800';
      case 'silver':
        return 'bg-linear-to-br from-gray-300 to-gray-500 text-gray-900 border-gray-400';
      case 'gold':
        return 'bg-linear-to-br from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-500';
      case 'platinum':
        return 'bg-linear-to-br from-purple-500 to-purple-700 text-white border-purple-600';
      default:
        return 'bg-gray-300 text-gray-600 border-gray-400';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      generosity: 'Generosity',
      diversity: 'Diversity',
      value: 'Value',
      cheer: 'CHEER',
      streak: 'Streak',
    };
    return labels[category] || category;
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked' && !achievement.unlocked) return false;
    if (filter === 'locked' && achievement.unlocked) return false;
    if (categoryFilter !== 'all' && achievement.category !== categoryFilter) return false;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Achievements</h2>
            <p className="text-sm text-gray-600">
              {unlockedCount} of {totalCount} unlocked ({Math.round((unlockedCount / totalCount) * 100)}%)
            </p>
          </div>
          <div className="text-4xl">🏆</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-linear-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filter === 'unlocked'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filter === 'locked'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>

          <div className="w-px bg-gray-300 mx-2" />

          {['all', 'generosity', 'diversity', 'value', 'cheer', 'streak'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                categoryFilter === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <div
            key={achievement.id}
            className={`relative rounded-lg border-2 p-4 transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-white hover:shadow-lg cursor-pointer transform hover:-translate-y-1'
                : 'bg-gray-50 opacity-75'
            }`}
          >
            {/* Badge Icon */}
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-3xl shadow-lg ${getTierColor(
                  achievement.tier,
                  achievement.unlocked
                )}`}
              >
                {achievement.unlocked ? achievement.icon : <FiLock className="text-xl" />}
              </div>
              
              {/* Tier Badge */}
              <div
                className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                  achievement.unlocked
                    ? `${getTierColor(achievement.tier, true)} border`
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {achievement.tier}
              </div>
            </div>

            {/* Achievement Info */}
            <div className="mb-3">
              <h3 className={`font-bold text-lg mb-1 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {achievement.name}
              </h3>
              <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                {achievement.description}
              </p>
            </div>

            {/* Progress Bar (for locked achievements) */}
            {!achievement.unlocked && showProgress && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{Math.round(achievement.progress * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${achievement.progress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(achievement.progress * achievement.threshold)} / {achievement.threshold}
                </p>
              </div>
            )}

            {/* Unlocked Badge */}
            {achievement.unlocked && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                ✓ Unlocked
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No achievements yet</h3>
          <p className="text-gray-600">
            Start tipping creators to unlock your first achievement!
          </p>
        </div>
      )}

      {/* Next Achievement to Unlock */}
      {showProgress && unlockedCount < totalCount && (
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
            <span>🎯</span>
            Next Milestone
          </h3>
          {(() => {
            const nextAchievement = achievements
              .filter(a => !a.unlocked)
              .sort((a, b) => b.progress - a.progress)[0];
            
            if (!nextAchievement) return null;

            return (
              <div className="flex items-center gap-3">
                <div className="text-3xl">{nextAchievement.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{nextAchievement.name}</div>
                  <div className="text-sm text-gray-600">{nextAchievement.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-white rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${nextAchievement.progress * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-orange-600">
                      {Math.round(nextAchievement.progress * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;
