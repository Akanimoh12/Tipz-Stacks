import React, { useEffect, useState } from 'react';
import { FiTwitter, FiFacebook, FiLinkedin, FiLink, FiShare2, FiTrendingUp } from 'react-icons/fi';
import {
  getShareAnalytics,
  getTotalShareCount,
  getShareCountByPlatform,
} from '../../services/socialShareService';

interface ShareStats {
  totalShares: number;
  byPlatform: {
    twitter: number;
    facebook: number;
    linkedin: number;
    copy: number;
  };
  byType: {
    [key: string]: number;
  };
  recentShares: Array<{
    platform: string;
    type: string;
    timestamp: number;
  }>;
}

const ShareAnalytics: React.FC = () => {
  const [stats, setStats] = useState<ShareStats>({
    totalShares: 0,
    byPlatform: {
      twitter: 0,
      facebook: 0,
      linkedin: 0,
      copy: 0,
    },
    byType: {},
    recentShares: [],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const analytics = getShareAnalytics();
    const totalShares = getTotalShareCount();

    // Calculate platform breakdown
    const byPlatform = {
      twitter: getShareCountByPlatform('twitter'),
      facebook: getShareCountByPlatform('facebook'),
      linkedin: getShareCountByPlatform('linkedin'),
      copy: getShareCountByPlatform('copy'),
    };

    // Calculate type breakdown
    const byType: { [key: string]: number } = {};
    analytics.forEach(share => {
      byType[share.type] = (byType[share.type] || 0) + 1;
    });

    // Get recent shares (last 10)
    const recentShares = analytics.slice(-10).reverse();

    setStats({
      totalShares,
      byPlatform,
      byType,
      recentShares,
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <FiTwitter className="w-5 h-5" />;
      case 'facebook': return <FiFacebook className="w-5 h-5" />;
      case 'linkedin': return <FiLinkedin className="w-5 h-5" />;
      case 'copy': return <FiLink className="w-5 h-5" />;
      default: return <FiShare2 className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'text-[#1DA1F2]';
      case 'facebook': return 'text-[#1877F2]';
      case 'linkedin': return 'text-[#0A66C2]';
      case 'copy': return 'text-gray-600';
      default: return 'text-orange-500';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Share Analytics</h2>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
        >
          <FiTrendingUp className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          You've shared {stats.totalShares} times! 🎉
        </h3>
        <p className="text-gray-600">
          Thank you for helping grow the Tipz Stacks community. Every share helps creators get discovered!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Shares */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiShare2 className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Shares</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalShares}</div>
        </div>

        {/* Twitter */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiTwitter className="w-5 h-5 text-[#1DA1F2]" />
            </div>
            <span className="text-sm font-medium text-gray-600">X (Twitter)</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.byPlatform.twitter}</div>
        </div>

        {/* Facebook */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFacebook className="w-5 h-5 text-[#1877F2]" />
            </div>
            <span className="text-sm font-medium text-gray-600">Facebook</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.byPlatform.facebook}</div>
        </div>

        {/* LinkedIn */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiLinkedin className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <span className="text-sm font-medium text-gray-600">LinkedIn</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.byPlatform.linkedin}</div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shares by Platform</h3>
        <div className="space-y-3">
          {Object.entries(stats.byPlatform).map(([platform, count]) => {
            const percentage = stats.totalShares > 0 ? (count / stats.totalShares) * 100 : 0;
            return (
              <div key={platform}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={getPlatformColor(platform)}>
                      {getPlatformIcon(platform)}
                    </span>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {platform === 'copy' ? 'Link Copied' : platform}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Type Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shares by Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500 mb-1">{count}</div>
              <div className="text-sm text-gray-600">{getTypeLabel(type)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shares</h3>
        {stats.recentShares.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No shares yet. Start sharing to see your activity!</p>
        ) : (
          <div className="space-y-3">
            {stats.recentShares.map((share, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={getPlatformColor(share.platform)}>
                    {getPlatformIcon(share.platform)}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    Shared {getTypeLabel(share.type)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatTimestamp(share.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareAnalytics;
