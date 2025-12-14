import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export type TimePeriod = 'all-time' | 'month' | 'week' | 'today';
export type Category = 'all' | 'artists' | 'musicians' | 'writers' | 'developers' | 'designers' | 'other';
export type SortOption = 'score' | 'stx' | 'cheer' | 'supporters' | 'newest';

interface FilterState {
  timePeriod: TimePeriod;
  category: Category;
  sortBy: SortOption;
  searchQuery: string;
}

const DEFAULT_FILTERS: FilterState = {
  timePeriod: 'all-time',
  category: 'all',
  sortBy: 'score',
  searchQuery: '',
};

export const useLeaderboardFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize from URL params or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    const savedFilters = localStorage.getItem('leaderboard-filters');
    if (savedFilters) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(savedFilters) };
      } catch {
        return DEFAULT_FILTERS;
      }
    }

    return {
      timePeriod: (searchParams.get('period') as TimePeriod) || DEFAULT_FILTERS.timePeriod,
      category: (searchParams.get('category') as Category) || DEFAULT_FILTERS.category,
      sortBy: (searchParams.get('sort') as SortOption) || DEFAULT_FILTERS.sortBy,
      searchQuery: searchParams.get('search') || DEFAULT_FILTERS.searchQuery,
    };
  });

  // Sync filters to URL and localStorage
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.timePeriod !== DEFAULT_FILTERS.timePeriod) {
      params.set('period', filters.timePeriod);
    }
    if (filters.category !== DEFAULT_FILTERS.category) {
      params.set('category', filters.category);
    }
    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.set('sort', filters.sortBy);
    }
    if (filters.searchQuery) {
      params.set('search', filters.searchQuery);
    }

    setSearchParams(params, { replace: true });
    localStorage.setItem('leaderboard-filters', JSON.stringify(filters));
  }, [filters, setSearchParams]);

  // Filter setters
  const setTimePeriod = useCallback((period: TimePeriod) => {
    setFilters(prev => ({ ...prev, timePeriod: period }));
  }, []);

  const setCategory = useCallback((category: Category) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Calculate date range for time periods
  const getDateRange = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filters.timePeriod) {
      case 'today':
        return { start: today, end: now };
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);
        return { start: weekStart, end: now };
      }
      case 'month': {
        const monthStart = new Date(today);
        monthStart.setDate(monthStart.getDate() - 30);
        return { start: monthStart, end: now };
      }
      case 'all-time':
      default:
        return { start: new Date(0), end: now };
    }
  }, [filters.timePeriod]);

  // Apply filters to data
  const applyFilters = useCallback(<T extends any>(
    data: T[],
    getCategory: (item: T) => string[],
    getName: (item: T) => string,
    getAddress: (item: T) => string,
    getScore: (item: T, sortBy: SortOption) => number,
    getCreatedAt?: (item: T) => Date
  ): T[] => {
    let filtered = [...data];

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const name = getName(item).toLowerCase();
        const address = getAddress(item).toLowerCase();
        return name.includes(query) || address.includes(query);
      });
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => {
        const categories = getCategory(item).map(c => c.toLowerCase());
        return categories.some(cat => {
          if (filters.category === 'artists') {
            return cat.includes('art') || cat.includes('design') || cat.includes('photo');
          }
          if (filters.category === 'musicians') {
            return cat.includes('music') || cat.includes('audio');
          }
          if (filters.category === 'writers') {
            return cat.includes('writing') || cat.includes('blog') || cat.includes('content');
          }
          if (filters.category === 'developers') {
            return cat.includes('dev') || cat.includes('tech') || cat.includes('code');
          }
          if (filters.category === 'designers') {
            return cat.includes('design') || cat.includes('ui') || cat.includes('ux');
          }
          return cat.includes('other');
        });
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (filters.sortBy === 'newest' && getCreatedAt) {
        const dateA = getCreatedAt(a).getTime();
        const dateB = getCreatedAt(b).getTime();
        return dateB - dateA;
      }
      return getScore(b, filters.sortBy) - getScore(a, filters.sortBy);
    });

    return filtered;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.timePeriod !== DEFAULT_FILTERS.timePeriod) count++;
    if (filters.category !== DEFAULT_FILTERS.category) count++;
    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  // Check if filters are default
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0;
  }, [activeFilterCount]);

  return {
    filters,
    setTimePeriod,
    setCategory,
    setSortBy,
    setSearchQuery,
    clearFilters,
    applyFilters,
    getDateRange,
    activeFilterCount,
    hasActiveFilters,
  };
};
