import { FiCheck, FiCircle } from 'react-icons/fi';

export interface Milestone {
  id: string;
  label: string;
  threshold: number;
  isCompleted: boolean;
  category: 'stx' | 'tips' | 'creators' | 'claims' | 'rank';
}

interface MilestoneTrackerProps {
  category: 'stx' | 'tips' | 'creators' | 'claims' | 'rank';
  currentValue: number;
}

const MILESTONE_CONFIGS = {
  stx: {
    title: 'Total STX Given',
    icon: '💰',
    thresholds: [10, 50, 100, 500, 1000],
    unit: 'STX',
  },
  tips: {
    title: 'Total Tips Sent',
    icon: '🎯',
    thresholds: [10, 50, 100, 500, 1000],
    unit: 'tips',
  },
  creators: {
    title: 'Creators Supported',
    icon: '🎨',
    thresholds: [5, 10, 25, 50, 100],
    unit: 'creators',
  },
  claims: {
    title: 'Claims Completed',
    icon: '🎁',
    thresholds: [7, 30, 100, 365, 1000],
    unit: 'claims',
  },
  rank: {
    title: 'Leaderboard Rank',
    icon: '🏆',
    thresholds: [100, 50, 25, 10, 3],
    unit: 'rank',
    reverse: true, // Lower is better
  },
};

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  category,
  currentValue,
}) => {
  const config = MILESTONE_CONFIGS[category];
  const isReverse = (config as { reverse?: boolean }).reverse || false;

  const milestones: Milestone[] = config.thresholds.map((threshold) => {
    const isCompleted = isReverse
      ? currentValue <= threshold && currentValue > 0
      : currentValue >= threshold;

    return {
      id: `${category}-${threshold}`,
      label: `${threshold} ${config.unit}`,
      threshold,
      isCompleted,
      category,
    };
  });

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const nextMilestone = milestones.find(m => !m.isCompleted);
  const currentIndex = milestones.findIndex(m => !m.isCompleted);
  const progressToNext = nextMilestone
    ? isReverse
      ? Math.min(((nextMilestone.threshold - currentValue) / nextMilestone.threshold) * 100, 100)
      : Math.min((currentValue / nextMilestone.threshold) * 100, 100)
    : 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{config.icon}</div>
          <div>
            <h3 className="font-bold text-gray-900">{config.title}</h3>
            <p className="text-sm text-gray-600">
              {completedCount} of {milestones.length} milestones reached
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">{currentValue}</div>
          <div className="text-xs text-gray-500">{config.unit}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
          <div
            className="h-1 bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all duration-500"
            style={{
              width: `${(completedCount / milestones.length) * 100}%`,
            }}
          />
        </div>

        {/* Milestones */}
        <div className="relative flex justify-between">
          {milestones.map((milestone, index) => {
            const isCurrent = index === currentIndex;
            const isPast = milestone.isCompleted;

            return (
              <div key={milestone.id} className="flex flex-col items-center">
                {/* Milestone Node */}
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                    isPast
                      ? 'bg-green-500 shadow-lg shadow-green-200'
                      : isCurrent
                      ? 'bg-orange-500 shadow-lg shadow-orange-200 animate-pulse'
                      : 'bg-gray-300'
                  }`}
                >
                  {isPast ? (
                    <FiCheck className="w-6 h-6 text-white" />
                  ) : isCurrent ? (
                    <div className="w-6 h-6 border-4 border-white rounded-full" />
                  ) : (
                    <FiCircle className="w-6 h-6 text-gray-500" />
                  )}

                  {/* Current progress ring */}
                  {isCurrent && (
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 48 48"
                    >
                      <circle
                        cx="24"
                        cy="24"
                        r="22"
                        fill="none"
                        stroke="rgba(249, 115, 22, 0.2)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="22"
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 22}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 22 * (1 - progressToNext / 100)
                        }`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                  )}
                </div>

                {/* Milestone Label */}
                <div className="mt-3 text-center">
                  <div
                    className={`text-sm font-semibold ${
                      isPast
                        ? 'text-green-600'
                        : isCurrent
                        ? 'text-orange-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {milestone.threshold}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {milestone.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Milestone Info */}
      {nextMilestone && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Next Milestone</span>
            <span className="text-sm font-bold text-orange-500">
              {isReverse
                ? `${nextMilestone.threshold - currentValue} ${config.unit} to go`
                : `${nextMilestone.threshold - currentValue} more ${config.unit}`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}

      {/* All Milestones Reached */}
      {!nextMilestone && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-semibold text-green-600">All milestones reached!</p>
          <p className="text-sm text-gray-600 mt-1">
            You've completed all {category} milestones. Keep up the great work!
          </p>
        </div>
      )}
    </div>
  );
};
