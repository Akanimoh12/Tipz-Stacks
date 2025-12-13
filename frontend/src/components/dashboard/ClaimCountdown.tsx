import React, { useEffect, useState, memo } from 'react';
import { FiClock } from 'react-icons/fi';

interface ClaimCountdownProps {
  timeRemaining: string; // Format: "HH:MM:SS"
  blocksRemaining: number;
  onTimeUp?: () => void;
}

const ClaimCountdown: React.FC<ClaimCountdownProps> = memo(({
  timeRemaining,
  blocksRemaining,
  onTimeUp,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate progress (0-100) based on blocks
    // Total cooldown is 144 blocks
    const totalBlocks = 144;
    const progressPercent = Math.max(
      0,
      Math.min(100, ((totalBlocks - blocksRemaining) / totalBlocks) * 100)
    );
    setProgress(progressPercent);

    // Trigger onTimeUp when countdown reaches zero
    if (blocksRemaining === 0 && timeRemaining === '00:00:00' && onTimeUp) {
      onTimeUp();
    }
  }, [blocksRemaining, timeRemaining, onTimeUp]);

  // Determine color based on time remaining
  const getColorClass = () => {
    if (blocksRemaining === 0) return 'text-green-600';
    if (blocksRemaining <= 10) return 'text-[#FF6B35]'; // Almost ready
    if (blocksRemaining <= 50) return 'text-orange-500'; // Getting close
    return 'text-gray-600'; // Long wait
  };

  const getProgressColor = () => {
    if (blocksRemaining === 0) return 'bg-green-500';
    if (blocksRemaining <= 10) return 'bg-[#FF6B35]';
    if (blocksRemaining <= 50) return 'bg-orange-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-3">
      {/* Time Display */}
      <div className="flex items-center justify-center gap-3">
        <FiClock className={`text-2xl ${getColorClass()}`} />
        <div className="text-center">
          <div className={`text-3xl font-bold font-mono ${getColorClass()}`}>
            {timeRemaining}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {blocksRemaining === 0 ? (
              <span className="text-green-600 font-semibold">Ready to claim!</span>
            ) : (
              <>
                {blocksRemaining} block{blocksRemaining !== 1 ? 's' : ''} remaining
              </>
            )}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Message */}
      <div className="text-center">
        {blocksRemaining === 0 ? (
          <p className="text-sm text-green-600 font-medium">
            🎉 Your daily CHEER is ready!
          </p>
        ) : blocksRemaining <= 10 ? (
          <p className="text-sm text-[#FF6B35] font-medium">
            ⏰ Almost there! Check back in a few minutes
          </p>
        ) : blocksRemaining <= 50 ? (
          <p className="text-sm text-orange-500">
            ⏳ Come back soon to claim your CHEER
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Next claim available in approximately{' '}
            {Math.floor(blocksRemaining / 6)} hour
            {Math.floor(blocksRemaining / 6) !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Circular Progress (Optional - Decorative) */}
      <div className="flex justify-center mt-4">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * progress) / 100}
              className={`${
                blocksRemaining === 0
                  ? 'text-green-500'
                  : blocksRemaining <= 10
                  ? 'text-[#FF6B35]'
                  : 'text-gray-400'
              } transition-all duration-500`}
              strokeLinecap="round"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ClaimCountdown.displayName = 'ClaimCountdown';

export default ClaimCountdown;
