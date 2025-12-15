import { useEffect, useState } from 'react';
import { FiX, FiShare2, FiAward } from 'react-icons/fi';
import Confetti from 'react-confetti';
import type { UnlockedAchievement, LockedAchievement } from '../../utils/achievementSystem';
import { getTierColor } from '../../utils/achievementSystem';

interface UnlockModalProps {
  achievement: UnlockedAchievement | null;
  nextAchievement?: LockedAchievement | null;
  onClose: () => void;
  onShare?: () => void;
  onViewAll?: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  achievement,
  nextAchievement,
  onClose,
  onShare,
  onViewAll,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true);
      setIsAnimating(true);

      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
      };
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const tierGradients = {
    bronze: 'from-orange-600 via-orange-500 to-yellow-600',
    silver: 'from-gray-400 via-gray-300 to-gray-400',
    gold: 'from-yellow-500 via-yellow-400 to-yellow-600',
    platinum: 'from-blue-400 via-purple-400 to-pink-400',
    diamond: 'from-cyan-400 via-blue-500 to-purple-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#F97316', '#FBBF24', '#F59E0B', '#FB923C', '#FDBA74']}
        />
      )}

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Gradient Header */}
        <div
          className={`bg-gradient-to-br ${tierGradients[achievement.tier]} p-8 text-white relative overflow-hidden`}
        >
          {/* Animated sparkles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="relative text-center">
            <h2 className="text-3xl font-bold mb-2">Achievement Unlocked!</h2>
            <p className="text-white/90">🎉 Congratulations! 🎉</p>
          </div>
        </div>

        {/* Achievement Content */}
        <div className="p-8">
          {/* Achievement Icon (Animated) */}
          <div className="flex justify-center mb-6">
            <div
              className="text-8xl animate-bounce"
              style={{
                filter: `drop-shadow(0 0 20px ${getTierColor(achievement.tier)})`,
                animation: 'bounce 1s ease-in-out 3',
              }}
            >
              {achievement.icon}
            </div>
          </div>

          {/* Achievement Details */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-3xl font-bold text-gray-900">
                {achievement.name}
              </h3>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold capitalize"
                style={{
                  backgroundColor: `${getTierColor(achievement.tier)}20`,
                  color: getTierColor(achievement.tier),
                }}
              >
                {achievement.tier}
              </span>
            </div>

            <p className="text-lg text-gray-600">{achievement.description}</p>

            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Reward</div>
                <div className="font-semibold text-gray-900">{achievement.reward}</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Points</div>
                <div className="text-2xl font-bold text-orange-500">
                  +{achievement.points}
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          {nextAchievement && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 mb-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <FiAward className="text-orange-500" />
                <h4 className="font-bold text-gray-900">What's Next?</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl opacity-50">{nextAchievement.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{nextAchievement.name}</p>
                  <p className="text-sm text-gray-600">{nextAchievement.description}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{nextAchievement.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                        style={{ width: `${nextAchievement.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onShare && (
              <button
                onClick={() => {
                  onShare();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiShare2 />
                Share on X
              </button>
            )}
            {onViewAll && (
              <button
                onClick={() => {
                  onViewAll();
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                View All Achievements
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
