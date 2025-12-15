import React, { useState } from 'react';
import { FiExternalLink, FiSearch } from 'react-icons/fi';

interface TipTransaction {
  id: string;
  creatorAddress: string;
  creatorName?: string;
  amount: number;
  token: 'STX' | 'CHEER';
  timestamp: Date;
  txId: string;
  status: 'confirmed' | 'pending' | 'failed';
  message?: string;
}

interface TippingHistoryProps {
  transactions: TipTransaction[];
  isLoading?: boolean;
}

const TippingHistory: React.FC<TippingHistoryProps> = ({ transactions, isLoading }) => {
  const [filter, setFilter] = useState<'all' | 'STX' | 'CHEER'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getExplorerUrl = (txId: string) => {
    const baseUrl = import.meta.env.VITE_NETWORK === 'mainnet'
      ? 'https://explorer.stacks.co'
      : 'https://explorer.hiro.so';
    return `${baseUrl}/txid/${txId}?chain=${import.meta.env.VITE_NETWORK || 'testnet'}`;
  };

  const filteredTransactions = transactions
    .filter(tx => filter === 'all' || tx.token === filter)
    .filter(tx => 
      searchQuery === '' ||
      tx.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.creatorAddress.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, visibleCount);

  const hasMore = filteredTransactions.length < transactions.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tipping History</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('STX')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                filter === 'STX'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💰 STX
            </button>
            <button
              onClick={() => setFilter('CHEER')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                filter === 'CHEER'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📣 CHEER
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by creator name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💸</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">
            {searchQuery ? 'No transactions match your search.' : 'Start supporting creators to see your history here!'}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

          {/* Transactions */}
          <div className="space-y-6">
            {filteredTransactions.map((tx, index) => (
              <div
                key={tx.id}
                className="relative flex gap-4 group"
              >
                {/* Timeline Dot */}
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-xl shadow-lg ${
                    tx.token === 'STX'
                      ? 'bg-linear-to-br from-orange-400 to-orange-600'
                      : 'bg-linear-to-br from-yellow-400 to-yellow-600'
                  }`}>
                    {tx.token === 'STX' ? '💰' : '📣'}
                  </div>
                  {index < filteredTransactions.length - 1 && (
                    <div className="absolute left-1/2 top-12 -translate-x-1/2 w-0.5 h-6 bg-gray-200 md:hidden" />
                  )}
                </div>

                {/* Transaction Card */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:shadow-md transition group-hover:bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {tx.token === 'STX' ? 'Tipped' : 'Cheered'}
                        </span>
                        <a
                          href={`/creator/${tx.creatorAddress}`}
                          className="text-orange-500 hover:text-orange-600 font-medium hover:underline"
                        >
                          {tx.creatorName || `${tx.creatorAddress.slice(0, 8)}...`}
                        </a>
                      </div>
                      <div className="text-2xl font-bold text-orange-500 mb-1">
                        {tx.amount} {tx.token}
                      </div>
                      {tx.message && (
                        <p className="text-sm text-gray-700 italic mb-2">"{tx.message}"</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{getRelativeTime(tx.timestamp)}</span>
                        <span>•</span>
                        <a
                          href={getExplorerUrl(tx.txId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-orange-500 transition"
                        >
                          View on Explorer
                          <FiExternalLink className="text-xs" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TippingHistory;
