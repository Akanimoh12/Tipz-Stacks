import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface LeaderboardSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

export default function LeaderboardSearch({
  searchQuery,
  onSearchChange,
  placeholder = 'Search by name or address...',
  resultCount,
  totalCount,
}: LeaderboardSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        onSearchChange(localQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, onSearchChange]);

  // Sync external changes
  useEffect(() => {
    if (searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    onSearchChange('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF6B35] transition-colors"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Result count */}
      {localQuery && resultCount !== undefined && totalCount !== undefined && (
        <div className="absolute top-full left-0 mt-2 text-sm text-gray-600">
          Showing {resultCount} of {totalCount} results
        </div>
      )}
    </div>
  );
}
