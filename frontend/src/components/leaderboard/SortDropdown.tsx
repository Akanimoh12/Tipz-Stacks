import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import type { SortOption } from '../../hooks/useLeaderboardFilters';

interface SortDropdownProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  isCreatorBoard?: boolean;
}

const SORT_OPTIONS: Record<SortOption, { label: string; description: string }> = {
  score: { label: 'Combined Score', description: 'STX + CHEER total' },
  stx: { label: 'STX Only', description: 'Sort by STX amount' },
  cheer: { label: 'CHEER Only', description: 'Sort by CHEER tokens' },
  supporters: { label: 'Most Supporters', description: 'By number of supporters' },
  newest: { label: 'Newest First', description: 'Recently joined' },
};

export default function SortDropdown({ selectedSort, onSortChange, isCreatorBoard = true }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (sort: SortOption) => {
    onSortChange(sort);
    setIsOpen(false);
  };

  // Filter out "supporters" option for tipper board
  const availableOptions = Object.entries(SORT_OPTIONS).filter(([key]) => {
    if (!isCreatorBoard && key === 'supporters') return false;
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] transition-colors justify-between text-sm"
      >
        <span className="font-medium text-gray-900">{SORT_OPTIONS[selectedSort].label}</span>
        <FiChevronDown className={`transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {availableOptions.map(([key, option]) => (
            <button
              key={key}
              onClick={() => handleSelect(key as SortOption)}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                selectedSort === key ? 'bg-[#FF6B35]/5' : ''
              }`}
            >
              <div className="flex flex-col items-start">
                <span className={`font-medium ${selectedSort === key ? 'text-[#FF6B35]' : 'text-gray-900'}`}>
                  {option.label}
                </span>
                <span className="text-xs text-gray-500">{option.description}</span>
              </div>
              {selectedSort === key && (
                <FiCheck className="text-[#FF6B35] shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
