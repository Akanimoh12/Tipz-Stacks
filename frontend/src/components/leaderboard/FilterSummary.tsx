import { FiX, FiCalendar, FiTag, FiBarChart2, FiSearch } from 'react-icons/fi';
import type { TimePeriod, Category, SortOption } from '../../hooks/useLeaderboardFilters';

interface FilterSummaryProps {
  timePeriod: TimePeriod;
  category: Category;
  sortBy: SortOption;
  searchQuery: string;
  resultCount: number;
  totalCount: number;
  onRemoveFilter: (filterType: 'time' | 'category' | 'sort' | 'search') => void;
  onClearAll: () => void;
}

const TIME_LABELS: Record<TimePeriod, string> = {
  'all-time': 'All Time',
  'month': 'This Month',
  'week': 'This Week',
  'today': 'Today',
};

const CATEGORY_LABELS: Record<Category, string> = {
  'all': 'All Categories',
  'artists': 'Artists',
  'musicians': 'Musicians',
  'writers': 'Writers',
  'developers': 'Developers',
  'designers': 'Designers',
  'other': 'Other',
};

const SORT_LABELS: Record<SortOption, string> = {
  'score': 'Combined Score',
  'stx': 'STX Only',
  'cheer': 'CHEER Only',
  'supporters': 'Most Supporters',
  'newest': 'Newest First',
};

export default function FilterSummary({
  timePeriod,
  category,
  sortBy,
  searchQuery,
  resultCount,
  totalCount,
  onRemoveFilter,
  onClearAll,
}: FilterSummaryProps) {
  const hasActiveFilters = 
    timePeriod !== 'all-time' || 
    category !== 'all' || 
    sortBy !== 'score' || 
    searchQuery.trim() !== '';

  if (!hasActiveFilters) {
    return (
      <div className="flex items-center justify-between text-sm text-gray-600 py-2">
        <span>Showing all {totalCount} results</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Active filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Active Filters:</span>

        {timePeriod !== 'all-time' && (
          <FilterChip
            icon={<FiCalendar size={14} />}
            label={TIME_LABELS[timePeriod]}
            onRemove={() => onRemoveFilter('time')}
          />
        )}

        {category !== 'all' && (
          <FilterChip
            icon={<FiTag size={14} />}
            label={CATEGORY_LABELS[category]}
            onRemove={() => onRemoveFilter('category')}
          />
        )}

        {sortBy !== 'score' && (
          <FilterChip
            icon={<FiBarChart2 size={14} />}
            label={SORT_LABELS[sortBy]}
            onRemove={() => onRemoveFilter('sort')}
          />
        )}

        {searchQuery.trim() && (
          <FilterChip
            icon={<FiSearch size={14} />}
            label={`"${searchQuery}"`}
            onRemove={() => onRemoveFilter('search')}
          />
        )}

        <button
          onClick={onClearAll}
          className="text-sm text-[#FF6B35] hover:text-[#FF8C42] font-medium transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Result count */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{resultCount}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalCount}</span> results
      </div>
    </div>
  );
}

interface FilterChipProps {
  icon: React.ReactNode;
  label: string;
  onRemove: () => void;
}

function FilterChip({ icon, label, onRemove }: FilterChipProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-sm font-medium">
      {icon}
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-[#FF6B35]/20 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <FiX size={14} />
      </button>
    </div>
  );
}
