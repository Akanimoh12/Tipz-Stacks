import { FiArrowRight } from 'react-icons/fi';
import type { LockedAchievement } from '../../utils/achievementSystem';

interface AchievementProgressProps {
  nextAchievement: LockedAchievement | null;
  variant?: 'full' | 'compact' | 'mini';
}

export const AchievementProgress: React.FC<AchievementProgressProps> = ({
  nextAchievement,
  variant = 'full',
}) => {
  if (!nextAchievement) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg p-6 text-white">
        <div className="text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">All Achievements Unlocked!</h3>
          <p className="text-white/90">
            Congratulations! You've unlocked all available achievements.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'mini') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl opacity-50">{nextAchievement.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600 truncate">
                Next: {nextAchievement.name}
              </span>
              <span className="text-xs font-bold text-orange-500 ml-2">
                {nextAchievement.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${nextAchievement.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl opacity-50">{nextAchievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-900">{nextAchievement.name}</h4>
              <span className="text-sm font-bold text-orange-500">
                {nextAchievement.progress}% complete
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{nextAchievement.description}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${nextAchievement.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  const getMotivationalMessage = (progress: number): string => {
    if (progress >= 90) return "Almost there! Just a little more!";
    if (progress >= 75) return "You're so close! Keep going!";
    if (progress >= 50) return "Halfway there! You're doing great!";
    if (progress >= 25) return "Good progress! Keep it up!";
    return "Every step counts. You've got this!";
  };

  const getEstimatedTime = (progress: number): string => {
    if (progress >= 90) return "Could unlock today";
    if (progress >= 75) return "Could unlock this week";
    if (progress >= 50) return "Could unlock soon";
    if (progress >= 25) return "Keep going to unlock";
    return "More activity needed";
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200 p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wide">
            Next Achievement
          </h3>
        </div>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
          {nextAchievement.tier}
        </span>
      </div>

      {/* Achievement Info */}
      <div className="flex items-start gap-6 mb-6">
        <div
          className="text-6xl opacity-70"
          style={{
            filter: `drop-shadow(0 0 12px rgba(249, 115, 22, 0.3))`,
          }}
        >
          {nextAchievement.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            {nextAchievement.name}
          </h4>
          <p className="text-gray-700 mb-4">{nextAchievement.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Reward:</span>
            <span>{nextAchievement.reward}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <span className="font-medium">Points:</span>
            <span className="text-orange-600 font-bold">+{nextAchievement.points}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-xs text-gray-500">({getEstimatedTime(nextAchievement.progress)})</span>
          </div>
          <span className="text-2xl font-bold text-orange-600">
            {nextAchievement.progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 h-4 rounded-full transition-all duration-500 relative"
              style={{ width: `${nextAchievement.progress}%` }}
            >
              {nextAchievement.progress > 10 && (
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <FiArrowRight className="text-white animate-pulse" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute -top-1 left-0 w-full flex justify-between px-1">
            <div className="w-1 h-6 bg-gray-300 rounded-full" />
            <div className="w-1 h-6 bg-gray-300 rounded-full" />
            <div className="w-1 h-6 bg-gray-300 rounded-full" />
            <div className="w-1 h-6 bg-gray-300 rounded-full" />
            <div className="w-1 h-6 bg-gray-300 rounded-full" />
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-orange-200">
          <p className="text-center text-sm font-medium text-gray-700">
            💪 {getMotivationalMessage(nextAchievement.progress)}
          </p>
        </div>
      </div>
    </div>
  );
};
