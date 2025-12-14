import { useState } from 'react';
import RankBadge from './RankBadge';
import ProfileCell from './ProfileCell';
import { Button } from '../common/Button';
import { FiZap } from 'react-icons/fi';

interface CreatorLeaderboardEntry {
  address: string;
  name: string;
  profileImage: string;
  stxReceived: number;
  cheerReceived: number;
  score: number;
  rank: number;
  supportersCount: number;
}

interface CreatorLeaderboardProps {
  creators: CreatorLeaderboardEntry[];
  currentUserAddress?: string;
  onTipClick: (creator: CreatorLeaderboardEntry) => void;
}

export default function CreatorLeaderboard({
  creators,
  currentUserAddress,
  onTipClick,
}: CreatorLeaderboardProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
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
              Creator
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              STX Received
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              CHEER Received
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Supporters
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {creators.map((creator) => {
            const isCurrentUser = creator.address === currentUserAddress;
            const isHovered = hoveredRow === creator.address;

            return (
              <tr
                key={creator.address}
                onMouseEnter={() => setHoveredRow(creator.address)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`transition-colors ${getRowBackground(creator.rank, isHovered, isCurrentUser)}`}
              >
                {/* Rank */}
                <td className="px-6 py-4">
                  <RankBadge rank={creator.rank} size="medium" showMedal />
                </td>

                {/* Profile */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ProfileCell
                      address={creator.address}
                      name={creator.name}
                      profileImage={creator.profileImage}
                      isCreator
                    />
                    {isCurrentUser && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </td>

                {/* STX Received */}
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-gray-900">
                    {formatNumber(creator.stxReceived)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">STX</span>
                </td>

                {/* CHEER Received */}
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-orange-600">
                    {formatNumber(creator.cheerReceived)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">CHEER</span>
                </td>

                {/* Score */}
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-lg text-gray-900">
                    {formatNumber(creator.score)}
                  </span>
                </td>

                {/* Supporters */}
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                    {creator.supportersCount}
                  </span>
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-center">
                  <Button
                    size="small"
                    onClick={() => onTipClick(creator)}
                    className="px-3! py-1.5!"
                  >
                    <FiZap size={14} />
                    <span>Tip</span>
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
      {creators.map((creator) => {
        const isCurrentUser = creator.address === currentUserAddress;

        return (
          <div
            key={creator.address}
            className={`bg-white rounded-lg shadow-md p-4 ${
              isCurrentUser ? 'border-2 border-blue-500' : 'border border-gray-200'
            }`}
          >
            {/* Header with rank and profile */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <RankBadge rank={creator.rank} size="large" showMedal />
                <ProfileCell
                  address={creator.address}
                  name={creator.name}
                  profileImage={creator.profileImage}
                  isCreator
                />
              </div>
              {isCurrentUser && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                  You
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">STX Received</div>
                <div className="font-semibold text-gray-900">
                  {formatNumber(creator.stxReceived)} STX
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">CHEER Received</div>
                <div className="font-semibold text-orange-600">
                  {formatNumber(creator.cheerReceived)}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Score</div>
                <div className="font-bold text-lg text-gray-900">
                  {formatNumber(creator.score)}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Supporters</div>
                <div className="font-semibold text-gray-900">{creator.supportersCount}</div>
              </div>
            </div>

            {/* Action button */}
            <Button fullWidth onClick={() => onTipClick(creator)}>
              <FiZap size={16} />
              <span>Send Tip</span>
            </Button>
          </div>
        );
      })}
    </div>
  );

  // Empty state
  if (creators.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">No creators found</p>
        <p className="text-gray-400 text-sm">Be the first to register as a creator!</p>
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
