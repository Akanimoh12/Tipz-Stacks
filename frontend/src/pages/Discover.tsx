import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCreators } from '../hooks/useCreators';
import { CreatorCard } from '../components/dashboard/CreatorCard';
import { CreatorCardSkeletonGrid } from '../components/common/CreatorCardSkeleton';
import { Button } from '../components/common/Button';

const CATEGORIES = [
  'All',
  'Art & Design',
  'Music',
  'Writing',
  'Gaming',
  'Technology',
  'Education',
  'Photography',
  'Video',
  'Other',
];

const SORT_OPTIONS = [
  { value: 'tips', label: 'Most Tips' },
  { value: 'cheers', label: 'Most Cheers' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name (A-Z)' },
];

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredCreators,
    isLoading,
    error,
    searchQuery,
    sortBy,
    filterCategory,
    searchCreators,
    sortCreators,
    filterByCategory,
  } = useCreators();

  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCreators(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, searchCreators]);

  const handleCategoryChange = (category: string) => {
    filterByCategory(category === 'All' ? undefined : category);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    sortCreators(e.target.value as any);
  };

  const handleTip = (creatorAddress: string) => {
    // TODO: Open tip modal
    console.log('Tip creator:', creatorAddress);
  };

  const handleCheer = (creatorAddress: string) => {
    // TODO: Open cheer modal
    console.log('Cheer creator:', creatorAddress);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent mb-2">
            Discover Creators
          </h1>
          <p className="text-gray-600">
            Find amazing creators to support with tips and cheers
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search creators by name, bio, or tags..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B35] transition-colors"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B35] transition-colors appearance-none cursor-pointer bg-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  (filterCategory === category || (category === 'All' && !filterCategory))
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Info */}
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found for "{searchQuery}"
          </div>
        )}

        {/* Loading State */}
        {isLoading && <CreatorCardSkeletonGrid count={6} />}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCreators.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-[#FF6B35] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Creators Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `No creators match "${searchQuery}". Try a different search term.`
                : 'Be the first to register as a creator!'}
            </p>
            <Button
              onClick={() => navigate('/register-creator')}
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white"
            >
              Register as Creator
            </Button>
          </div>
        )}

        {/* Creator Grid */}
        {!isLoading && !error && filteredCreators.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator: any) => (
              <CreatorCard
                key={creator.address}
                address={creator.address}
                name={creator.name}
                bio={creator.bio}
                profileImage={creator.metadata?.profileImage}
                totalStxReceived={creator.stats.totalStxReceived}
                totalCheerReceived={creator.stats.totalCheerReceived}
                supporterCount={creator.stats.supporterCount}
                rank={creator.rank}
                tags={creator.metadata?.tags}
                onTip={() => handleTip(creator.address)}
                onCheer={() => handleCheer(creator.address)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
