import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCreators } from '../hooks/useCreators';
import { useTipping } from '../hooks/useTipping';
import { CreatorCard } from '../components/dashboard/CreatorCard';
import { CreatorCardSkeletonGrid } from '../components/common/CreatorCardSkeleton';
import { Button } from '../components/common/Button';
import TipModal from '../components/dashboard/TipModal';
import CheerModal from '../components/dashboard/CheerModal';
import SuccessModal from '../components/dashboard/SuccessModal';

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
    fetchCreators,
  } = useCreators();

  const {
    modalType,
    isModalOpen,
    selectedCreator,
    amount,
    isProcessing,
    error: tippingError,
    showSuccess,
    transactionId,
    openTipModal,
    openCheerModal,
    closeModal,
    closeSuccess,
    updateAmount,
    executeTip,
    executeCheer,
    stxBalance,
    cheerBalance,
  } = useTipping();

  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Debounced search to avoid excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        searchCreators(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchQuery]); // Only depend on localSearchQuery

  // Memoize event handlers to prevent unnecessary re-renders
  const handleCategoryChange = useCallback((category: string) => {
    filterByCategory(category === 'All' ? undefined : category);
  }, [filterByCategory]);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    sortCreators(e.target.value as any);
  }, [sortCreators]);

  const handleTip = useCallback((creator: any) => {
    openTipModal({
      address: creator.address,
      name: creator.name,
      profileImage: creator.metadata?.profileImage,
      totalStxReceived: creator.stats.totalStxReceived,
    });
  }, [openTipModal]);

  const handleCheer = useCallback((creator: any) => {
    openCheerModal({
      address: creator.address,
      name: creator.name,
      profileImage: creator.metadata?.profileImage,
      totalCheerReceived: creator.stats.totalCheerReceived,
    });
  }, [openCheerModal]);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent mb-2">
              Discover Creators
            </h1>
            <p className="text-gray-600">
              Find amazing creators to support with tips and cheers
            </p>
          </div>
          <button
            onClick={() => fetchCreators(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
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
                    ? 'bg-linear-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-md'
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
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => fetchCreators(true)}
              className="text-red-600 underline text-sm mt-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCreators.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {searchQuery ? (
                <FiSearch className="w-12 h-12 text-gray-400" />
              ) : (
                <FiUsers className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No Creators Found' : 'No Creators Yet'}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No creators match "${searchQuery}". Try a different search term.`
                : 'Be the first to join! Register as a creator and start receiving tips from supporters.'}
            </p>
            <Button
              onClick={() => navigate('/register-creator')}
              className="bg-linear-to-r from-[#FF6B35] to-[#FF8C42] text-white"
            >
              {searchQuery ? 'Register as Creator' : 'Become a Creator'}
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
                onTip={() => handleTip(creator)}
                onCheer={() => handleCheer(creator)}
              />
            ))}
          </div>
        )}

        {/* Tip Modal */}
        {modalType === 'tip' && selectedCreator && (
          <TipModal
            isOpen={isModalOpen}
            onClose={closeModal}
            creator={selectedCreator}
            amount={amount}
            onAmountChange={updateAmount}
            onSubmit={executeTip}
            isProcessing={isProcessing}
            error={tippingError}
            userBalance={stxBalance}
          />
        )}

        {/* Cheer Modal */}
        {modalType === 'cheer' && selectedCreator && (
          <CheerModal
            isOpen={isModalOpen}
            onClose={closeModal}
            creator={selectedCreator}
            amount={amount}
            onAmountChange={updateAmount}
            onSubmit={executeCheer}
            isProcessing={isProcessing}
            error={tippingError}
            userBalance={cheerBalance}
          />
        )}

        {/* Success Modal */}
        {showSuccess && selectedCreator && (
          <SuccessModal
            isOpen={showSuccess}
            onClose={closeSuccess}
            type={modalType || 'tip'}
            amount={amount}
            creatorName={selectedCreator.name}
            transactionId={transactionId}
            onTipAnother={() => {
              closeSuccess();
              // Could navigate to discover page if not already there
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Discover;
