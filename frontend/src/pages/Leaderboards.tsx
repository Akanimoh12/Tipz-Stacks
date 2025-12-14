import { useState, useMemo } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useWallet } from '../hooks/useWallet';
import { useTipping } from '../hooks/useTipping';
import { useLeaderboardFilters, type Category } from '../hooks/useLeaderboardFilters';
import LeaderboardTabs from '../components/leaderboard/LeaderboardTabs';
import LeaderboardFilters from '../components/leaderboard/LeaderboardFilters';
import FilterSummary from '../components/leaderboard/FilterSummary';
import CreatorLeaderboard from '../components/leaderboard/CreatorLeaderboard';
import TipperLeaderboard from '../components/leaderboard/TipperLeaderboard';
import TipModal from '../components/dashboard/TipModal';
import CheerModal from '../components/dashboard/CheerModal';
import { FiRefreshCw, FiClock } from 'react-icons/fi';

export default function Leaderboards() {
  const { walletAddress, stxBalance, cheerBalance } = useWallet();
  const {
    creators,
    tippers,
    isLoading,
    error,
    lastUpdated,
    refreshLeaderboards,
    isRefreshing,
  } = useLeaderboard(walletAddress || undefined);

  const {
    isModalOpen,
    modalType,
    selectedCreator,
    amount,
    isProcessing,
    error: tippingError,
    openTipModal,
    closeModal,
    updateAmount,
    executeTip,
    executeCheer,
  } = useTipping();

  const [activeTab, setActiveTab] = useState<'creators' | 'tippers'>('creators');

  // Filter hook
  const {
    filters,
    setTimePeriod,
    setCategory,
    setSortBy,
    setSearchQuery,
    clearFilters,
    applyFilters,
    hasActiveFilters,
  } = useLeaderboardFilters();

  // Apply filters to creators
  const filteredCreators = useMemo(() => {
    return applyFilters(
      creators,
      (creator) => creator.metadata?.tags || [],
      (creator) => creator.name,
      (creator) => creator.address,
      (creator, sortBy) => {
        switch (sortBy) {
          case 'stx':
            return creator.stxReceived;
          case 'cheer':
            return creator.cheerReceived;
          case 'supporters':
            return creator.supportersCount;
          case 'score':
          default:
            return creator.score;
        }
      }
    );
  }, [creators, applyFilters]);

  // Apply filters to tippers
  const filteredTippers = useMemo(() => {
    return applyFilters(
      tippers,
      () => [], // Tippers don't have categories
      (tipper) => tipper.displayName,
      (tipper) => tipper.address,
      (tipper, sortBy) => {
        switch (sortBy) {
          case 'stx':
            return tipper.stxGiven;
          case 'cheer':
            return tipper.cheerGiven;
          case 'supporters':
            return tipper.creatorsSupported;
          case 'score':
          default:
            return tipper.score;
        }
      }
    );
  }, [tippers, applyFilters]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      all: creators.length,
      artists: 0,
      musicians: 0,
      writers: 0,
      developers: 0,
      designers: 0,
      other: 0,
    };

    creators.forEach(creator => {
      const tags = creator.metadata?.tags || [];
      const tagStr = tags.join(' ').toLowerCase();

      if (tagStr.includes('art') || tagStr.includes('design') || tagStr.includes('photo')) {
        counts.artists++;
      } else if (tagStr.includes('music') || tagStr.includes('audio')) {
        counts.musicians++;
      } else if (tagStr.includes('writing') || tagStr.includes('blog') || tagStr.includes('content')) {
        counts.writers++;
      } else if (tagStr.includes('dev') || tagStr.includes('tech') || tagStr.includes('code')) {
        counts.developers++;
      } else if (tagStr.includes('design') || tagStr.includes('ui') || tagStr.includes('ux')) {
        counts.designers++;
      } else {
        counts.other++;
      }
    });

    return counts;
  }, [creators]);

  // Handle filter removal
  const handleRemoveFilter = (filterType: 'time' | 'category' | 'sort' | 'search') => {
    switch (filterType) {
      case 'time':
        setTimePeriod('all-time');
        break;
      case 'category':
        setCategory('all');
        break;
      case 'sort':
        setSortBy('score');
        break;
      case 'search':
        setSearchQuery('');
        break;
    }
  };

  // Handle tip button click
  const handleTipClick = (creator: any) => {
    openTipModal({
      address: creator.address,
      name: creator.name,
      profileImage: creator.profileImage,
    });
  };

  // Format last updated time
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return 'Never';

    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Leaderboards
        </h1>
        <p className="text-gray-600 text-lg">
          Discover top creators and supporters in the Tipz community
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <LeaderboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            creatorsCount={filteredCreators.length}
            tippersCount={filteredTippers.length}
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Last Updated */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiClock size={16} />
            <span className="hidden sm:inline">Updated</span>
            <span>{getTimeSinceUpdate()}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshLeaderboards}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Refresh leaderboards"
          >
            <FiRefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <LeaderboardFilters
          timePeriod={filters.timePeriod}
          category={filters.category}
          sortBy={filters.sortBy}
          searchQuery={filters.searchQuery}
          onTimePeriodChange={setTimePeriod}
          onCategoryChange={setCategory}
          onSortChange={setSortBy}
          onSearchChange={setSearchQuery}
          isCreatorBoard={activeTab === 'creators'}
          resultCount={activeTab === 'creators' ? filteredCreators.length : filteredTippers.length}
          totalCount={activeTab === 'creators' ? creators.length : tippers.length}
          categoryCounts={categoryCounts}
        />
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && !isLoading && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <FilterSummary
            timePeriod={filters.timePeriod}
            category={filters.category}
            sortBy={filters.sortBy}
            searchQuery={filters.searchQuery}
            resultCount={activeTab === 'creators' ? filteredCreators.length : filteredTippers.length}
            totalCount={activeTab === 'creators' ? creators.length : tippers.length}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={clearFilters}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            {error}
          </p>
          <button
            onClick={refreshLeaderboards}
            className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && creators.length === 0 && tippers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading leaderboards...</p>
        </div>
      )}

      {/* Empty State - No Results After Filtering */}
      {!isLoading && 
       (activeTab === 'creators' ? filteredCreators.length : filteredTippers.length) === 0 &&
       (activeTab === 'creators' ? creators.length : tippers.length) > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">
            No {activeTab === 'creators' ? 'creators' : 'supporters'} match your current filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Leaderboard Content */}
      {!isLoading && (activeTab === 'creators' ? filteredCreators.length : filteredTippers.length) > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {activeTab === 'creators' ? (
            <CreatorLeaderboard
              creators={filteredCreators}
              currentUserAddress={walletAddress || undefined}
              onTipClick={handleTipClick}
            />
          ) : (
            <TipperLeaderboard
              tippers={filteredTippers}
              currentUserAddress={walletAddress || undefined}
            />
          )}
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
    </div>
  );
}
