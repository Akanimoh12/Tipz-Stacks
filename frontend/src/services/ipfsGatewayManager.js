/**
 * IPFS Gateway Manager
 * Handles multiple IPFS gateways with automatic fallback and performance tracking
 */

// Available IPFS gateways in priority order
const GATEWAYS = [
  {
    name: 'Pinata',
    url: 'https://gateway.pinata.cloud/ipfs/',
    priority: 1,
  },
  {
    name: 'IPFS.io',
    url: 'https://ipfs.io/ipfs/',
    priority: 2,
  },
  {
    name: 'Cloudflare',
    url: 'https://cloudflare-ipfs.com/ipfs/',
    priority: 3,
  },
  {
    name: 'Dweb',
    url: 'https://dweb.link/ipfs/',
    priority: 4,
  },
];

const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

class IPFSGatewayManager {
  constructor() {
    // Gateway performance tracking
    this.gatewayStats = new Map();
    
    // Initialize stats for each gateway
    GATEWAYS.forEach(gateway => {
      this.gatewayStats.set(gateway.name, {
        successCount: 0,
        failureCount: 0,
        totalLatency: 0,
        averageLatency: 0,
        lastUsed: null,
        isHealthy: true,
      });
    });

    // Health check interval
    this.healthCheckInterval = null;
    this.startHealthChecks();
  }

  /**
   * Fetch content from IPFS with automatic gateway fallback
   */
  async retryWithFallback(cid, maxRetries = MAX_RETRIES) {
    let lastError = null;
    let attemptCount = 0;

    // Try each gateway in order
    for (const gateway of this.getSortedGateways()) {
      for (let retry = 0; retry < maxRetries; retry++) {
        attemptCount++;
        
        try {
          const data = await this.fetchFromGateway(cid, gateway.url);
          
          // Success - update stats
          this.recordSuccess(gateway.name);
          
          return data;
        } catch (error) {
          lastError = error;
          this.recordFailure(gateway.name);
          
          console.warn(
            `Failed to fetch from ${gateway.name} (attempt ${retry + 1}/${maxRetries}):`,
            error.message
          );

          // Wait before retry (exponential backoff)
          if (retry < maxRetries - 1) {
            await this.sleep(Math.pow(2, retry) * 1000);
          }
        }
      }
    }

    // All gateways failed
    throw new Error(
      `Failed to fetch CID ${cid} from all gateways after ${attemptCount} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Fetch content from specific gateway with timeout
   */
  async fetchFromGateway(cid, gatewayUrl) {
    const startTime = Date.now();
    const url = `${gatewayUrl}${cid}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, image/*, */*',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Determine content type and parse accordingly
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('image/')) {
        data = await response.blob();
      } else {
        data = await response.text();
        // Try to parse as JSON if it looks like JSON
        try {
          data = JSON.parse(data);
        } catch {
          // Keep as text if not JSON
        }
      }

      const latency = Date.now() - startTime;
      this.recordLatency(this.getGatewayNameFromUrl(gatewayUrl), latency);

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${FETCH_TIMEOUT}ms`);
      }
      throw error;
    }
  }

  /**
   * Select best gateway based on performance
   */
  selectBestGateway() {
    const healthyGateways = GATEWAYS.filter(gateway => {
      const stats = this.gatewayStats.get(gateway.name);
      return stats.isHealthy;
    });

    if (healthyGateways.length === 0) {
      // All gateways unhealthy, return primary
      return GATEWAYS[0];
    }

    // Sort by success rate and latency
    const sorted = healthyGateways.sort((a, b) => {
      const statsA = this.gatewayStats.get(a.name);
      const statsB = this.gatewayStats.get(b.name);

      const successRateA = this.getSuccessRate(statsA);
      const successRateB = this.getSuccessRate(statsB);

      // Prioritize success rate
      if (Math.abs(successRateA - successRateB) > 0.1) {
        return successRateB - successRateA;
      }

      // If success rates similar, prefer lower latency
      return statsA.averageLatency - statsB.averageLatency;
    });

    return sorted[0];
  }

  /**
   * Get gateways sorted by health and performance
   */
  getSortedGateways() {
    return [...GATEWAYS].sort((a, b) => {
      const statsA = this.gatewayStats.get(a.name);
      const statsB = this.gatewayStats.get(b.name);

      // Unhealthy gateways go last
      if (statsA.isHealthy !== statsB.isHealthy) {
        return statsA.isHealthy ? -1 : 1;
      }

      // Sort by success rate and latency
      const successRateA = this.getSuccessRate(statsA);
      const successRateB = this.getSuccessRate(statsB);

      if (Math.abs(successRateA - successRateB) > 0.1) {
        return successRateB - successRateA;
      }

      return statsA.averageLatency - statsB.averageLatency;
    });
  }

  /**
   * Test gateway health
   */
  async testGatewayHealth(gateway) {
    const testCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'; // Hello World test file
    
    try {
      await this.fetchFromGateway(testCID, gateway.url);
      return true;
    } catch (error) {
      console.warn(`Gateway ${gateway.name} health check failed:`, error.message);
      return false;
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    // Check health every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      for (const gateway of GATEWAYS) {
        const isHealthy = await this.testGatewayHealth(gateway);
        const stats = this.gatewayStats.get(gateway.name);
        stats.isHealthy = isHealthy;
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get all gateway statistics
   */
  getStats() {
    const stats = {};
    
    for (const gateway of GATEWAYS) {
      const gatewayStats = this.gatewayStats.get(gateway.name);
      stats[gateway.name] = {
        ...gatewayStats,
        successRate: this.getSuccessRate(gatewayStats),
        totalRequests: gatewayStats.successCount + gatewayStats.failureCount,
      };
    }

    return stats;
  }

  /**
   * Reset statistics
   */
  resetStats() {
    GATEWAYS.forEach(gateway => {
      this.gatewayStats.set(gateway.name, {
        successCount: 0,
        failureCount: 0,
        totalLatency: 0,
        averageLatency: 0,
        lastUsed: null,
        isHealthy: true,
      });
    });
  }

  // ===== Private Helper Methods =====

  /**
   * Record successful fetch
   */
  recordSuccess(gatewayName) {
    const stats = this.gatewayStats.get(gatewayName);
    if (stats) {
      stats.successCount++;
      stats.lastUsed = Date.now();
      stats.isHealthy = true;
    }
  }

  /**
   * Record failed fetch
   */
  recordFailure(gatewayName) {
    const stats = this.gatewayStats.get(gatewayName);
    if (stats) {
      stats.failureCount++;
      stats.lastUsed = Date.now();

      // Mark as unhealthy if failure rate > 50%
      const totalRequests = stats.successCount + stats.failureCount;
      if (totalRequests >= 5 && stats.failureCount / totalRequests > 0.5) {
        stats.isHealthy = false;
      }
    }
  }

  /**
   * Record fetch latency
   */
  recordLatency(gatewayName, latency) {
    const stats = this.gatewayStats.get(gatewayName);
    if (stats) {
      stats.totalLatency += latency;
      const totalRequests = stats.successCount + stats.failureCount;
      stats.averageLatency = stats.totalLatency / Math.max(1, totalRequests);
    }
  }

  /**
   * Get success rate for gateway
   */
  getSuccessRate(stats) {
    const total = stats.successCount + stats.failureCount;
    return total > 0 ? stats.successCount / total : 0;
  }

  /**
   * Get gateway name from URL
   */
  getGatewayNameFromUrl(url) {
    const gateway = GATEWAYS.find(g => url.includes(g.url));
    return gateway ? gateway.name : 'Unknown';
  }

  /**
   * Sleep helper for retry backoff
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
const gatewayManager = new IPFSGatewayManager();
export default gatewayManager;
