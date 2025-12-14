import React from 'react';
import { FiCopy, FiTrendingUp, FiTrendingDown, FiShare2 } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

interface TipperProfileHeaderProps {
  address: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  memberSince?: Date;
  totalStxGiven: number;
  totalCheerGiven: number;
  creatorsSupported: number;
  totalTips: number;
  rank?: number;
  rankMovement?: number;
  streak?: number;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
}

const TipperProfileHeader: React.FC<TipperProfileHeaderProps> = ({
  address,
  displayName,
  bio,
  profileImage,
  memberSince,
  totalStxGiven,
  totalCheerGiven,
  creatorsSupported,
  totalTips,
  rank,
  rankMovement,
  streak,
  isOwnProfile,
  onEdit,
  onShare,
}) => {
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    // Address copied to clipboard
    // Toast notification can be added via a toast library like react-hot-toast
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Recently';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const totalValue = totalStxGiven + (totalCheerGiven * 0.0001); // Assuming 1 CHEER = 0.0001 STX

  return (
    <div className="bg-linear-to-br from-orange-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-32 bg-linear-to-r from-orange-500 to-orange-600">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Profile Image */}
        <div className="flex items-end justify-between -mt-16 mb-4">
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt={displayName || 'Profile'}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-5xl">👤</span>
              </div>
            )}
            {rank && rank <= 50 && (
              <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <HiSparkles className="text-sm" />
                #{rank}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            {isOwnProfile && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition font-medium"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={onShare}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium flex items-center gap-2"
            >
              <FiShare2 />
              Share
            </button>
          </div>
        </div>

        {/* Name and Address */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {displayName || 'Anonymous Tipper'}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <span className="font-mono text-sm">{truncateAddress(address)}</span>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-gray-100 rounded transition"
              title="Copy address"
            >
              <FiCopy className="text-sm" />
            </button>
          </div>
          {bio && (
            <p className="text-gray-700 mb-2">{bio}</p>
          )}
          <p className="text-sm text-gray-500">
            Member since {formatDate(memberSince)}
          </p>
        </div>

        {/* Rank Badge */}
        {rank && (
          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-orange-200 inline-flex items-center gap-3">
            <div className="text-3xl font-bold text-orange-500">
              #{rank}
            </div>
            <div>
              <div className="text-sm text-gray-600">Leaderboard Rank</div>
              {rankMovement !== undefined && rankMovement !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-medium ${rankMovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {rankMovement > 0 ? (
                    <>
                      <FiTrendingUp />
                      <span>↑ {rankMovement} this week</span>
                    </>
                  ) : (
                    <>
                      <FiTrendingDown />
                      <span>↓ {Math.abs(rankMovement)} this week</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Value Given */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
            <div className="text-2xl font-bold text-orange-500 mb-1">
              {totalValue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Value Given</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalStxGiven} STX + {totalCheerGiven.toLocaleString()} CHEER
            </div>
          </div>

          {/* Creators Supported */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
            <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center gap-2">
              {creatorsSupported}
              <span className="text-lg">🎨</span>
            </div>
            <div className="text-sm text-gray-600">Creators Supported</div>
            <div className="text-xs text-gray-500 mt-1">
              {creatorsSupported > 0 ? 'Making a difference' : 'Start supporting'}
            </div>
          </div>

          {/* Total Tips Sent */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
            <div className="text-2xl font-bold text-orange-500 mb-1">
              {totalTips}
            </div>
            <div className="text-sm text-gray-600">Total Tips Sent</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalTips > 0 ? 'Keep it up!' : 'Send your first tip'}
            </div>
          </div>

          {/* Tipping Streak */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
            <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center gap-2">
              {streak || 0}
              {(streak || 0) > 0 && <span className="text-lg">🔥</span>}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
            <div className="text-xs text-gray-500 mt-1">
              {(streak || 0) > 0 ? 'Keep the streak alive!' : 'Start a streak'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipperProfileHeader;
