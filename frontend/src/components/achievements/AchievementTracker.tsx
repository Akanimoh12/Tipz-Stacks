import { useState, useMemo } from 'react';
import { FiLock, FiUnlock, FiFilter, FiSearch } from 'react-icons/fi';
import type { UserAchievement } from '../../utils/achievementSystem';
import { getTierColor, getRarityColor } from '../../utils/achievementSystem';

interface AchievementTrackerProps {
  achievements: UserAchievement[];
  onAchievementClick?: (achievement: UserAchievement) => void;
}

type CategoryFilter = 'all' | 'tipper' | 'creator' | 'claim' | 'platform';
type SortOption = 'recently-unlocked' | 'progress' | 'locked' | 'points';

export const AchievementTracker: React.FC<AchievementTrackerProps> = ({
  achievements,
  onAchievementClick,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('progress');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered = [...achievements];

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a => a.name.toLowerCase().includes(query) || 
             a.description.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'recently-unlocked') {
        if (a.isUnlocked && b.isUnlocked) {
          return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
        }
        return a.isUnlocked ? -1 : 1;
      } else if (sortBy === 'progress') {
        return b.progress - a.progress;
      } else if (sortBy === 'locked') {
        return a.isUnlocked ? 1 : -1;
      } else if (sortBy === 'points') {
        return b.points - a.points;
      }
      return 0;
    });

    return filtered;
  }, [achievements, categoryFilter, searchQuery, sortBy]);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <p className="text-gray-600 mt-1">
            {unlockedCount} of {totalCount} unlocked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-full sm:w-48 bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="text-orange-500" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'tipper', 'creator', 'claim', 'platform'] as CategoryFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    categoryFilter === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="progress">Progress</option>
              <option value="recently-unlocked">Recently Unlocked</option>
              <option value="locked">Locked First</option>
              <option value="points">Highest Points</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search achievements..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onClick={() => onAchievementClick?.(achievement)}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No achievements found</p>
        </div>
      )}
    </div>
  );
};

interface AchievementCardProps {
  achievement: UserAchievement;
  onClick?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClick }) => {
  const isNearlyUnlocked = !achievement.isUnlocked && achievement.progress >= 75;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
        achievement.isUnlocked
          ? 'border-transparent shadow-md hover:shadow-xl'
          : isNearlyUnlocked
          ? 'border-orange-500 animate-pulse'
          : 'border-gray-200'
      }`}
      style={{
        filter: achievement.isUnlocked ? 'none' : 'grayscale(80%)',
        opacity: achievement.isUnlocked ? 1 : 0.7,
      }}
    >
      {/* Icon and Lock/Unlock Indicator */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`text-5xl ${achievement.isUnlocked ? '' : 'opacity-50'}`}
          style={{
            filter: achievement.isUnlocked
              ? `drop-shadow(0 0 8px ${getTierColor(achievement.tier)})`
              : 'none',
          }}
        >
          {achievement.icon}
        </div>
        <div
          className={`p-2 rounded-full ${
            achievement.isUnlocked ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          {achievement.isUnlocked ? (
            <FiUnlock className="text-green-600" />
          ) : (
            <FiLock className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Achievement Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{achievement.name}</h3>
          <span
            className="text-xs font-semibold px-2 py-1 rounded"
            style={{
              backgroundColor: `${getRarityColor(achievement.rarity)}20`,
              color: getRarityColor(achievement.rarity),
            }}
          >
            {achievement.rarity}
          </span>
        </div>
        <p className="text-sm text-gray-600">{achievement.description}</p>

        {/* Progress Bar (if locked) */}
        {!achievement.isUnlocked && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{achievement.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Unlock Date (if unlocked) */}
        {achievement.isUnlocked && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Unlocked</span>
            <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
          </div>
        )}

        {/* Points */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">Points</span>
          <span className="text-sm font-bold text-orange-500">{achievement.points}</span>
        </div>
      </div>
    </div>
  );
};
