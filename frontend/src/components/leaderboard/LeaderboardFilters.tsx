import { useState } from 'react';
import { FiFilter, FiChevronDown } from 'react-icons/fi';
import CategoryFilter from './CategoryFilter';
import SortDropdown from './SortDropdown';
import type { TimePeriod, Category, SortOption } from '../../hooks/useLeaderboardFilters';

interface LeaderboardFiltersProps {
  timePeriod: TimePeriod;
  category: Category;
  sortBy: SortOption;
  searchQuery: string;
  onTimePeriodChange: (period: TimePeriod) => void;
  onCategoryChange: (category: Category) => void;
  onSortChange: (sort: SortOption) => void;
  onSearchChange: (query: string) => void;
  isCreatorBoard?: boolean;
  resultCount?: number;
  totalCount?: number;
  categoryCounts?: Record<Category, number>;
}

const TIME_PERIODS: Array<{ value: TimePeriod; label: string; description: string }> = [
  { value: 'all-time', label: 'All Time', description: 'Since the beginning' },
  { value: 'month', label: 'This Month', description: 'Last 30 days' },
  { value: 'week', label: 'This Week', description: 'Last 7 days' },
  { value: 'today', label: 'Today', description: 'Last 24 hours' },
];

export default function LeaderboardFilters({
  timePeriod,
  category,
  sortBy,
  searchQuery,
  onTimePeriodChange,
  onCategoryChange,
  onSortChange,
  onSearchChange,
  isCreatorBoard = true,
  categoryCounts,
}: LeaderboardFiltersProps) {
  const [showTimePeriodMenu, setShowTimePeriodMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        {/* Top Row: Search and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search - Compact */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search ${isCreatorBoard ? 'creators' : 'supporters'}...`}
              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>

          {/* Sort Dropdown - Compact */}
          <div className="flex gap-2">
            {/* Time Period */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowTimePeriodMenu(!showTimePeriodMenu)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] transition-colors"
              >
                <span className="font-medium text-gray-700 truncate">
                  {TIME_PERIODS.find(p => p.value === timePeriod)?.label}
                </span>
                <FiChevronDown
                  size={16}
                  className={`ml-2 flex-shrink-0 transition-transform ${showTimePeriodMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {showTimePeriodMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {TIME_PERIODS.map(period => (
                    <button
                      key={period.value}
                      onClick={() => {
                        onTimePeriodChange(period.value);
                        setShowTimePeriodMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        timePeriod === period.value ? 'bg-[#FF6B35]/5 text-[#FF6B35] font-medium' : 'text-gray-700'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="flex-1">
              <SortDropdown
                selectedSort={sortBy}
                onSortChange={onSortChange}
                isCreatorBoard={isCreatorBoard}
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Category Filter - Horizontal Scroll (Creators only) */}
        {isCreatorBoard && (
          <div>
            <CategoryFilter
              selectedCategory={category}
              onCategoryChange={onCategoryChange}
              counts={categoryCounts}
            />
          </div>
        )}
      </div>
    </div>
  );
}
