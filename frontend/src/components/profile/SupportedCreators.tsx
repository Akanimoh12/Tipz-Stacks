import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SupportedCreator {
  address: string;
  name: string;
  profileImage?: string;
  totalTipped: number;
  lastTipDate?: Date;
  tipCount: number;
}

interface SupportedCreatorsProps {
  creators: SupportedCreator[];
  isLoading?: boolean;
  onTipAgain?: (creatorAddress: string) => void;
}

const SupportedCreators: React.FC<SupportedCreatorsProps> = ({ 
  creators, 
  isLoading,
  onTipAgain 
}) => {
  const [sortBy, setSortBy] = useState<'amount' | 'recent' | 'alphabetical'>('amount');

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const sortedCreators = [...creators].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.totalTipped - a.totalTipped;
      case 'recent':
        return (b.lastTipDate?.getTime() || 0) - (a.lastTipDate?.getTime() || 0);
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Supported Creators</h2>
            <p className="text-sm text-gray-600">{creators.length} creators</p>
          </div>
          <div className="text-4xl">🎨</div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy('amount')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'amount'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Most Supported
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'recent'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Recently Tipped
          </button>
          <button
            onClick={() => setSortBy('alphabetical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'alphabetical'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Creators Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No creators supported yet</h3>
          <p className="text-gray-600 mb-6">
            Start your journey by supporting amazing creators!
          </p>
          <Link
            to="/discover"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
          >
            Discover Creators
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedCreators.map(creator => (
            <div
              key={creator.address}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-orange-300 transition group"
            >
              {/* Profile Image */}
              <Link to={`/creator/${creator.address}`} className="block mb-3">
                {creator.profileImage ? (
                  <img
                    src={creator.profileImage}
                    alt={creator.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-gray-100 group-hover:border-orange-200 transition"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl border-4 border-gray-100 group-hover:border-orange-200 transition">
                    🎨
                  </div>
                )}
              </Link>

              {/* Creator Info */}
              <div className="text-center mb-3">
                <Link
                  to={`/creator/${creator.address}`}
                  className="font-bold text-gray-900 hover:text-orange-500 transition block mb-1"
                >
                  {creator.name}
                </Link>
                <p className="text-xs text-gray-500 mb-2">
                  {creator.lastTipDate ? `Last tipped ${getRelativeTime(creator.lastTipDate)}` : 'No recent tips'}
                </p>
              </div>

              {/* Stats */}
              <div className="bg-orange-50 rounded-lg p-3 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-1">
                    {creator.totalTipped.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">Total Given (STX)</div>
                </div>
                <div className="text-center mt-2 pt-2 border-t border-orange-100">
                  <div className="text-sm font-semibold text-gray-700">
                    {creator.tipCount} {creator.tipCount === 1 ? 'tip' : 'tips'}
                  </div>
                </div>
              </div>

              {/* Tip Again Button */}
              {onTipAgain && (
                <button
                  onClick={() => onTipAgain(creator.address)}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm"
                >
                  Tip Again
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportedCreators;
