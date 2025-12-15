import { useEffect, useState } from 'react';
import { FiDollarSign, FiHeart, FiGift, FiUserPlus, FiTrendingUp, FiClock, FiRefreshCw } from 'react-icons/fi';
import { useTransactions, type Transaction } from '../../hooks/useTransactions';
import { useWallet } from '../../hooks/useWallet';
import { useNavigate } from 'react-router-dom';

const ActivityFeed = () => {
  const { walletAddress } = useWallet();
  const { recentActivity, fetchTransactions, isLoading } = useTransactions();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !walletAddress) return;

    const interval = setInterval(() => {
      fetchTransactions(walletAddress);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, walletAddress, fetchTransactions]);

  // Initial fetch
  useEffect(() => {
    if (walletAddress) {
      fetchTransactions(walletAddress);
    }
  }, [walletAddress, fetchTransactions]);

  const getActivityIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'tip':
        return <FiDollarSign className="w-5 h-5 text-orange-500" />;
      case 'cheer':
        return <FiHeart className="w-5 h-5 text-orange-500" />;
      case 'claim':
        return <FiGift className="w-5 h-5 text-orange-500" />;
      case 'registration':
        return <FiUserPlus className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp * 1000;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const formatAmount = (amount?: number, token?: string) => {
    if (!amount || !token) return '';
    
    if (token === 'STX') {
      return `${(amount / 1000000).toFixed(2)} STX`;
    }
    
    return `${amount} ${token}`;
  };

  const handleActivityClick = (transaction: Transaction) => {
    if (transaction.recipient) {
      navigate(`/creator/${transaction.recipient}`);
    } else if (transaction.type === 'registration') {
      navigate('/my-profile');
    } else {
      navigate('/transactions');
    }
  };

  const handleRefresh = () => {
    if (walletAddress) {
      fetchTransactions(walletAddress);
    }
  };

  const displayActivities = recentActivity.slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                autoRefresh
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <FiClock className="w-3 h-3" />
            </button>

            {/* Manual refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-gray-600 hover:text-orange-500 transition-colors p-1 disabled:opacity-50"
              title="Refresh activity"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100">
        {isLoading && displayActivities.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
            <p className="text-sm text-gray-600">Loading activity...</p>
          </div>
        ) : displayActivities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Activity Yet</h3>
            <p className="text-sm text-gray-600">
              Start tipping creators or claim your daily CHEER tokens
            </p>
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      {activity.recipientName && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {activity.recipientName}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    {activity.amount && activity.token && (
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatAmount(activity.amount, activity.token)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Time and Status */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                    
                    {/* Status indicator */}
                    {activity.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700">
                        <FiClock className="w-2.5 h-2.5" />
                        Pending
                      </span>
                    )}
                    
                    {activity.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      {displayActivities.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => navigate('/transactions')}
            className="w-full text-center text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            View All Transactions →
          </button>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && displayActivities.length > 0 && (
        <div className="px-6 py-2 bg-green-50 border-t border-green-100">
          <p className="text-xs text-green-700 text-center flex items-center justify-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Auto-refreshing every 30 seconds
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
