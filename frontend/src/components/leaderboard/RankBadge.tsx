interface RankBadgeProps {
  rank: number;
  size?: 'small' | 'medium' | 'large';
  showMedal?: boolean;
}

export default function RankBadge({ rank, size = 'medium', showMedal = true }: RankBadgeProps) {
  const sizeClasses = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-12 h-12 text-lg',
  };

  // Medal emojis for top 3
  if (showMedal && rank <= 3) {
    const medals = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
    };

    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center animate-pop-in`}>
        <span className="text-2xl">{medals[rank as 1 | 2 | 3]}</span>
      </div>
    );
  }

  // Colored badges for ranks 4-10
  if (rank <= 10) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center shadow-md animate-pop-in`}
      >
        {rank}
      </div>
    );
  }

  // Grey badges for rank 11+
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-300 text-gray-700 font-semibold flex items-center justify-center`}
    >
      {rank}
    </div>
  );
}
