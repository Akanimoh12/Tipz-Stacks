import { FiImage, FiMusic, FiEdit, FiCode, FiLayout, FiMoreHorizontal } from 'react-icons/fi';
import type { Category } from '../../hooks/useLeaderboardFilters';

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  counts?: Record<Category, number>;
}

const CATEGORIES: Array<{ value: Category; label: string; icon: JSX.Element }> = [
  { value: 'all', label: 'All', icon: <FiMoreHorizontal /> },
  { value: 'artists', label: 'Artists', icon: <FiImage /> },
  { value: 'musicians', label: 'Musicians', icon: <FiMusic /> },
  { value: 'writers', label: 'Writers', icon: <FiEdit /> },
  { value: 'developers', label: 'Developers', icon: <FiCode /> },
  { value: 'designers', label: 'Designers', icon: <FiLayout /> },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange, counts }: CategoryFilterProps) {
  return (
    <div className="w-full">
      {/* Horizontal Scrollable Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {CATEGORIES.map(category => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === category.value
                ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-md'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35]'
            }`}
          >
            <span className={`text-sm ${selectedCategory === category.value ? 'text-white' : ''}`}>
              {category.icon}
            </span>
            <span>{category.label}</span>
            {counts && counts[category.value] > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCategory === category.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {counts[category.value]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
