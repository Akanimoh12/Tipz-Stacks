/**
 * IPFS Status Dashboard
 * Developer tool for monitoring IPFS cache and gateway health
 */

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiTrash2, FiDatabase, FiServer, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Card from '../common/Card';
import Button from '../common/Button';
import cacheManager from '../../services/ipfsCacheManager';
import gatewayManager from '../../services/ipfsGatewayManager';
import ipfsFetcher from '../../services/optimizedIpfsFetcher';
import prefetchManager from '../../utils/ipfsPrefetchManager';

function IpfsStatus() {
  const [cacheStats, setCacheStats] = useState(null);
  const [gatewayStats, setGatewayStats] = useState(null);
  const [fetcherStats, setFetcherStats] = useState(null);
  const [prefetchStats, setPrefetchStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = () => {
    setCacheStats(cacheManager.getStats());
    setGatewayStats(gatewayManager.getStats());
    setFetcherStats(ipfsFetcher.getStats());
    setPrefetchStats(prefetchManager.getStats());
  };

  useEffect(() => {
    refreshStats();

    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all IPFS cache?')) {
      await cacheManager.clear(0);
      cacheManager.resetStats();
      gatewayManager.resetStats();
      refreshStats();
    }
  };

  const handleResetStats = () => {
    cacheManager.resetStats();
    gatewayManager.resetStats();
    refreshStats();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IPFS Status Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor cache performance and gateway health</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing}
            >
              <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleResetStats} variant="outline">
              Reset Stats
            </Button>
            <Button onClick={handleClearCache} variant="danger">
              <FiTrash2 className="mr-2" />
              Clear Cache
            </Button>
          </div>
        </div>

        {/* Cache Statistics */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiDatabase className="mr-2" />
            Cache Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Hit Rate</div>
                <div className="text-3xl font-bold text-orange-600">
                  {cacheStats?.hitRate || 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {cacheStats?.hits || 0} hits / {cacheStats?.totalRequests || 0} requests
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Memory Cache</div>
                <div className="text-3xl font-bold text-blue-600">
                  {cacheStats?.memoryCacheEntries || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatBytes(cacheStats?.memoryCacheSize || 0)} used
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">localStorage</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatBytes(cacheStats?.localStorageSize || 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Persistent cache</div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Cache Breakdown</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-semibold">{cacheStats?.memoryHits || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">localStorage:</span>
                    <span className="font-semibold">{cacheStats?.localStorageHits || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IndexedDB:</span>
                    <span className="font-semibold">{cacheStats?.indexedDBHits || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Gateway Health */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiServer className="mr-2" />
            Gateway Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gatewayStats && Object.entries(gatewayStats).map(([name, stats]) => (
              <Card key={name}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{name}</h3>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.averageLatency.toFixed(0)}ms avg latency
                      </div>
                    </div>
                    <div className="flex items-center">
                      {stats.isHealthy ? (
                        <FiCheckCircle className="text-green-500 text-xl" />
                      ) : (
                        <FiAlertCircle className="text-red-500 text-xl" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Success Rate Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Success Rate</span>
                        <span>{(stats.successRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stats.successRate > 0.9
                              ? 'bg-green-500'
                              : stats.successRate > 0.7
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${stats.successRate * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Request Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <div className="text-gray-600">Success</div>
                        <div className="font-semibold text-green-600">{stats.successCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Failed</div>
                        <div className="font-semibold text-red-600">{stats.failureCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total</div>
                        <div className="font-semibold text-gray-900">{stats.totalRequests}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Fetcher Statistics */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fetcher Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">In-Flight Requests</div>
                <div className="text-3xl font-bold text-purple-600">
                  {fetcherStats?.inFlightRequests || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Currently fetching</div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Prefetch Queue</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {prefetchStats?.queueSize || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {prefetchStats?.activePrefetch || 0} active
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Prefetched</div>
                <div className="text-3xl font-bold text-teal-600">
                  {prefetchStats?.prefetchedCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Content cached proactively</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Developer Info */}
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">About This Dashboard</h3>
            <p className="text-sm text-gray-600 mb-3">
              This is a developer tool for monitoring IPFS performance. In production, this should only be accessible to admins.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <strong>Note:</strong> High hit rates indicate efficient caching. If hit rates are low, consider:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Implementing more aggressive prefetching</li>
                <li>Increasing cache TTLs</li>
                <li>Preloading popular content on app start</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default IpfsStatus;
