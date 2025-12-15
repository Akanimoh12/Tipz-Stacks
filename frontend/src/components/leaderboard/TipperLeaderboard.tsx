import { useState, useEffect, memo } from 'react';
import RankBadge from './RankBadge';
import ProfileCell from './ProfileCell';
import { Button } from '../common/Button';
import { FiUser, FiAward } from 'react-icons/fi';

interface TipperLeaderboardEntry {
  address: string;
  displayName: string;
  stxGiven: number;
  cheerGiven: number;
  score: number;
  rank: number;
  creatorsSupported: number;
  badges: string[];
}

interface TipperLeaderboardProps {
  tippers: TipperLeaderboardEntry[];
  currentUserAddress?: string;
}

function TipperLeaderboard({
  tippers,
  currentUserAddress,
}: TipperLeaderboardProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const currentUserIndex = tippers.findIndex(t => t.address === currentUserAddress);

  // Scroll to current user on mount if in list
  useEffect(() => {
    if (currentUserIndex !== -1) {
      const element = document.getElementById(`tipper-${currentUserAddress}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [currentUserIndex, currentUserAddress]);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Badge configuration
  const badgeConfig: Record<string, { icon: string; label: string; color: string; tooltip: string }> = {
    generous: {
      icon: '🎁',
      label: 'Generous',
      color: 'bg-green-100 text-green-700',
      tooltip: '100+ tips given',
    },
    superfan: {
      icon: '⭐',
      label: 'Super Fan',
      color: 'bg-yellow-100 text-yellow-700',
      tooltip: '10+ creators supported',
    },
    whale: {
      icon: '🐋',
      label: 'Whale',
      color: 'bg-blue-100 text-blue-700',
      tooltip: '1000+ STX given',
    },
    'cheer-champion': {
      icon: '🏆',
      label: 'CHEER Champion',
      color: 'bg-orange-100 text-orange-700',
      tooltip: '10,000+ CHEER given',
    },
  };

  // Render badges
  const renderBadges = (badges: string[]) => {
    if (badges.length === 0) return <span className="text-gray-400 text-sm">-</span>;

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {badges.map((badge) => {
          const config = badgeConfig[badge];
          if (!config) return null;

          return (
            <span
              key={badge}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
              title={config.tooltip}
            >
              <span>{config.icon}</span>
              <span className="hidden lg:inline">{config.label}</span>
            </span>
          );
        })}
      </div>
    );
  };

  // Get row background based on rank
  const getRowBackground = (rank: number, isHovered: boolean, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-blue-50 border-l-4 border-blue-500';
    }
    if (rank === 1) {
      return isHovered ? 'bg-gradient-to-r from-yellow-100 to-yellow-50' : 'bg-gradient-to-r from-yellow-50 to-white';
    }
    if (rank === 2) {
      return isHovered ? 'bg-gradient-to-r from-gray-200 to-gray-100' : 'bg-gradient-to-r from-gray-100 to-white';
    }
    if (rank === 3) {
      return isHovered ? 'bg-gradient-to-r from-orange-200 to-orange-100' : 'bg-gradient-to-r from-orange-100 to-white';
    }
    if (isHovered) {
      return 'bg-orange-50';
    }
    return rank % 2 === 0 ? 'bg-gray-50' : 'bg-white';
  };

  // Desktop table view
  const renderTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Supporter
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              STX Given
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              CHEER Given
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Creators
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Achievements
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {tippers.map((tipper) => {
            const isCurrentUser = tipper.address === currentUserAddress;
            const isHovered = hoveredRow === tipper.address;

            return (
              <tr
                key={tipper.address}
                id={`tipper-${tipper.address}`}
                onMouseEnter={() => setHoveredRow(tipper.address)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`transition-colors ${getRowBackground(tipper.rank, isHovered, isCurrentUser)}`}
              >
                {/* Rank */}
                <td className="px-6 py-4">
                  <RankBadge rank={tipper.rank} size="medium" showMedal />
                </td>

                {/* Profile */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ProfileCell
                      address={tipper.address}
                      name={tipper.displayName}
                      isCreator={false}
                    />
                    {isCurrentUser && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </td>

                {/* STX Given */}
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-gray-900">
                    {formatNumber(tipper.stxGiven)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">STX</span>
                </td>

                {/* CHEER Given */}
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-orange-600">
                    {formatNumber(tipper.cheerGiven)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">CHEER</span>
                </td>

                {/* Score */}
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-lg text-gray-900">
                    {formatNumber(tipper.score)}
                  </span>
                </td>

                {/* Creators Supported */}
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                    {tipper.creatorsSupported}
                  </span>
                </td>

                {/* Badges */}
                <td className="px-6 py-4 text-center">
                  {renderBadges(tipper.badges)}
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-center">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => window.location.href = `/tipper/${tipper.address}`}
                    className="px-3! py-1.5!"
                  >
                    <FiUser size={14} />
                    <span>View</span>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Mobile card view
  const renderCards = () => (
    <div className="md:hidden space-y-4">
      {tippers.map((tipper) => {
        const isCurrentUser = tipper.address === currentUserAddress;

        return (
          <div
            key={tipper.address}
            id={`tipper-${tipper.address}`}
            className={`bg-white rounded-lg shadow-md p-4 ${
              isCurrentUser ? 'border-2 border-blue-500' : 'border border-gray-200'
            }`}
          >
            {/* Header with rank and profile */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <RankBadge rank={tipper.rank} size="large" showMedal />
                <ProfileCell
                  address={tipper.address}
                  name={tipper.displayName}
                  isCreator={false}
                />
              </div>
              {isCurrentUser && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                  You
                </span>
              )}
            </div>

            {/* Badges */}
            {tipper.badges.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Achievements</span>
                </div>
                {renderBadges(tipper.badges)}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">STX Given</div>
                <div className="font-semibold text-gray-900">
                  {formatNumber(tipper.stxGiven)} STX
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">CHEER Given</div>
                <div className="font-semibold text-orange-600">
                  {formatNumber(tipper.cheerGiven)}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Score</div>
                <div className="font-bold text-lg text-gray-900">
                  {formatNumber(tipper.score)}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Creators</div>
                <div className="font-semibold text-gray-900">{tipper.creatorsSupported}</div>
              </div>
            </div>

            {/* Action button */}
            <Button
              variant="secondary"
              fullWidth
              onClick={() => window.location.href = `/tipper/${tipper.address}`}
            >
              <FiUser size={16} />
              <span>View Profile</span>
            </Button>
          </div>
        );
      })}
    </div>
  );

  // Empty state
  if (tippers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">No supporters found</p>
        <p className="text-gray-400 text-sm">Be the first to support a creator!</p>
      </div>
    );
  }

  return (
    <div>
      {renderTable()}
      {renderCards()}
    </div>
  );
}

export default memo(TipperLeaderboard, (prevProps, nextProps) => {
  // Only re-render if tippers array actually changed or user address changed
  return (
    prevProps.tippers.length === nextProps.tippers.length &&
    prevProps.currentUserAddress === nextProps.currentUserAddress &&
    prevProps.tippers.every((tipper, idx) => 
      tipper.address === nextProps.tippers[idx]?.address &&
      tipper.score === nextProps.tippers[idx]?.score &&
      tipper.stxGiven === nextProps.tippers[idx]?.stxGiven &&
      tipper.cheerGiven === nextProps.tippers[idx]?.cheerGiven
    )
  );
});
