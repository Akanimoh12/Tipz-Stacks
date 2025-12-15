import { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiRefreshCw, FiCalendar, FiSearch } from 'react-icons/fi';
import { useTransactions, type TransactionFilters, type Transaction } from '../hooks/useTransactions';
import { useWallet } from '../hooks/useWallet';
import TransactionTable from '../components/history/TransactionTable';
import TransactionCard from '../components/history/TransactionCard';
import TransactionDetailsModal from '../components/history/TransactionDetailsModal';

const TransactionHistory = () => {
  const { walletAddress } = useWallet();
  const {
    isLoading,
    error,
    fetchTransactions,
    exportTransactions,
    filterTransactions,
    refreshTransactions,
  } = useTransactions();

  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    status: 'all',
    dateRange: 'all',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // Fetch transactions on mount
  useEffect(() => {
    if (walletAddress) {
      fetchTransactions(walletAddress, filters);
    }
  }, [walletAddress, fetchTransactions]);

  // Apply filters
  const filteredTransactions = filterTransactions(filters);

  // Apply search
  const searchedTransactions = searchQuery
    ? filteredTransactions.filter(tx =>
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.recipientName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTransactions;

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (walletAddress) {
      fetchTransactions(walletAddress, newFilters);
    }
  };

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    exportTransactions(format, searchedTransactions);
  };

  const handleRefresh = async () => {
    await refreshTransactions();
  };

  const handleApplyCustomDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      const newFilters = {
        ...filters,
        dateRange: 'custom' as const,
        startDate: new Date(customDateRange.start),
        endDate: new Date(customDateRange.end),
      };
      setFilters(newFilters);
      
      if (walletAddress) {
        fetchTransactions(walletAddress, newFilters);
      }
    }
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">
            View and manage all your platform transactions
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-orange-50 border-orange-500 text-orange-700'
                    : 'border-gray-300 text-gray-700 hover:border-orange-500'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-orange-500 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <FiDownload className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                
                {/* Export Dropdown */}
                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="tip">Tips (STX)</option>
                    <option value="cheer">Cheers (CHEER)</option>
                    <option value="claim">Claims</option>
                    <option value="registration">Registrations</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{searchedTransactions.length}</span> transactions
                  </div>
                </div>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === 'custom' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleApplyCustomDateRange}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && searchedTransactions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filters.type !== 'all' || filters.status !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Start tipping creators to see your transaction history'}
            </p>
          </div>
        )}

        {/* Transactions Display */}
        {!isLoading && searchedTransactions.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <TransactionTable
                transactions={searchedTransactions}
                onTransactionClick={setSelectedTransaction}
              />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {searchedTransactions.map(transaction => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => setSelectedTransaction(transaction)}
                />
              ))}
            </div>
          </>
        )}

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            isOpen={!!selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
