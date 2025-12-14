import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface LeaderboardTabsProps {
  activeTab: 'creators' | 'tippers';
  onTabChange: (tab: 'creators' | 'tippers') => void;
  creatorsCount: number;
  tippersCount: number;
}

export default function LeaderboardTabs({
  activeTab,
  onTabChange,
  creatorsCount,
  tippersCount,
}: LeaderboardTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync with URL on mount
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab === 'creators' || urlTab === 'tippers') {
      onTabChange(urlTab);
    }
  }, []);

  // Handle tab change
  const handleTabClick = (tab: 'creators' | 'tippers') => {
    onTabChange(tab);
    setSearchParams({ tab });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, tab: 'creators' | 'tippers') => {
    if (e.key === 'ArrowLeft') {
      handleTabClick('creators');
    } else if (e.key === 'ArrowRight') {
      handleTabClick('tippers');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tab);
    }
  };

  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-8">
        {/* Creators Tab */}
        <button
          onClick={() => handleTabClick('creators')}
          onKeyDown={(e) => handleKeyDown(e, 'creators')}
          className={`relative pb-4 font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-t-lg ${
            activeTab === 'creators'
              ? 'text-orange-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-selected={activeTab === 'creators'}
          role="tab"
        >
          <span className="flex items-center gap-2">
            Top Creators
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'creators'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {creatorsCount}
            </span>
          </span>

          {/* Active indicator */}
          {activeTab === 'creators' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full animate-slide-in" />
          )}
        </button>

        {/* Tippers Tab */}
        <button
          onClick={() => handleTabClick('tippers')}
          onKeyDown={(e) => handleKeyDown(e, 'tippers')}
          className={`relative pb-4 font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-t-lg ${
            activeTab === 'tippers'
              ? 'text-orange-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-selected={activeTab === 'tippers'}
          role="tab"
        >
          <span className="flex items-center gap-2">
            Top Supporters
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === 'tippers'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tippersCount}
            </span>
          </span>

          {/* Active indicator */}
          {activeTab === 'tippers' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full animate-slide-in" />
          )}
        </button>
      </div>
    </div>
  );
}
