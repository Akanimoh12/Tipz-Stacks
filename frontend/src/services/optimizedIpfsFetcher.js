/**
 * Optimized IPFS Fetcher
 * Smart fetching with caching, validation, and batch operations
 */

import cacheManager from './ipfsCacheManager.js';
import gatewayManager from './ipfsGatewayManager.js';
import { validateContent, isValidCID } from '../utils/ipfsContentValidator.js';

// EventEmitter for progress tracking
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

class OptimizedIPFSFetcher extends EventEmitter {
  constructor() {
    super();
    this.inFlightRequests = new Map();
    this.maxConcurrent = 5;
    this.activeRequests = 0;
  }

  /**
   * Fetch single IPFS content with full caching and validation
   */
  async fetchContent(cid, type = 'json', options = {}) {
    // Validate CID format
    if (!isValidCID(cid)) {
      throw new Error(`Invalid CID format: ${cid}`);
    }

    // Check if request is already in flight
    if (this.inFlightRequests.has(cid)) {
      return this.inFlightRequests.get(cid);
    }

    // Create fetch promise
    const fetchPromise = this._fetchWithCache(cid, type, options);
    
    // Store in-flight request
    this.inFlightRequests.set(cid, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      // Remove from in-flight after completion
      this.inFlightRequests.delete(cid);
    }
  }

  /**
   * Internal fetch with cache check
   */
  async _fetchWithCache(cid, type, options = {}) {
    const { skipCache = false, customTTL = null } = options;

    // Step 1: Check cache first (unless skipCache is true)
    if (!skipCache) {
      const cached = await cacheManager.get(cid);
      if (cached && !this._isExpired(cached)) {
        this.emit('cache-hit', { cid, type });
        return cached.data;
      }
    }

    this.emit('cache-miss', { cid, type });

    // Step 2: Fetch from IPFS with gateway fallback
    this.emit('fetch-start', { cid, type });
    
    try {
      const data = await gatewayManager.retryWithFallback(cid);
      
      // Step 3: Validate content
      const validated = await validateContent(data, type);
      
      // Step 4: Store in cache
      await cacheManager.set(cid, validated, type, customTTL);
      
      this.emit('fetch-success', { cid, type });
      
      return validated;
    } catch (error) {
      this.emit('fetch-error', { cid, type, error: error.message });
      throw error;
    }
  }

  /**
   * Fetch multiple CIDs efficiently with batching
   */
  async fetchMultiple(cidConfigs, options = {}) {
    const { onProgress = null, maxConcurrent = this.maxConcurrent } = options;

    // cidConfigs: Array of { cid, type }
    const total = cidConfigs.length;
    let completed = 0;
    const results = new Map();
    const errors = new Map();

    // Process in batches
    const batches = this._createBatches(cidConfigs, maxConcurrent);

    for (const batch of batches) {
      const promises = batch.map(async ({ cid, type }) => {
        try {
          const data = await this.fetchContent(cid, type);
          results.set(cid, data);
        } catch (error) {
          errors.set(cid, error);
        } finally {
          completed++;
          
          // Report progress
          if (onProgress) {
            const progress = Math.round((completed / total) * 100);
            onProgress(progress, completed, total);
          }

          this.emit('batch-progress', {
            completed,
            total,
            progress: (completed / total) * 100,
          });
        }
      });

      // Wait for current batch to complete
      await Promise.all(promises);
    }

    return {
      results: Object.fromEntries(results),
      errors: Object.fromEntries(errors),
      successCount: results.size,
      errorCount: errors.size,
    };
  }

  /**
   * Prefetch content (fetch in background without returning)
   */
  async prefetch(cid, type = 'json') {
    try {
      await this.fetchContent(cid, type);
      this.emit('prefetch-success', { cid, type });
    } catch (error) {
      this.emit('prefetch-error', { cid, type, error: error.message });
      // Silently fail for prefetch
    }
  }

  /**
   * Prefetch multiple CIDs in background
   */
  async prefetchMultiple(cidConfigs) {
    const promises = cidConfigs.map(({ cid, type }) => 
      this.prefetch(cid, type)
    );
    
    // Don't wait for all to complete, fire and forget
    Promise.all(promises).catch(() => {
      // Silently handle errors for prefetch
    });
  }

  /**
   * Cancel in-flight request
   */
  cancelRequest(cid) {
    if (this.inFlightRequests.has(cid)) {
      // Note: Actual fetch cancellation would require AbortController
      // This just removes from tracking
      this.inFlightRequests.delete(cid);
      this.emit('request-cancelled', { cid });
    }
  }

  /**
   * Cancel all in-flight requests
   */
  cancelAllRequests() {
    const cancelled = Array.from(this.inFlightRequests.keys());
    this.inFlightRequests.clear();
    this.emit('all-requests-cancelled', { count: cancelled.length });
  }

  /**
   * Get fetch statistics
   */
  getStats() {
    return {
      inFlightRequests: this.inFlightRequests.size,
      activeRequests: this.activeRequests,
      cacheStats: cacheManager.getStats(),
      gatewayStats: gatewayManager.getStats(),
    };
  }

  // ===== Private Helper Methods =====

  /**
   * Check if cache entry is expired
   */
  _isExpired(entry) {
    return entry.expiresAt < Date.now();
  }

  /**
   * Create batches for concurrent processing
   */
  _createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}

// Export singleton instance
const ipfsFetcher = new OptimizedIPFSFetcher();

// Export convenience functions
export const fetchIPFSContent = (cid, type, options) => 
  ipfsFetcher.fetchContent(cid, type, options);

export const fetchMultipleIPFS = (cidConfigs, options) => 
  ipfsFetcher.fetchMultiple(cidConfigs, options);

export const prefetchIPFS = (cid, type) => 
  ipfsFetcher.prefetch(cid, type);

export const prefetchMultipleIPFS = (cidConfigs) => 
  ipfsFetcher.prefetchMultiple(cidConfigs);

export const cancelIPFSRequest = (cid) => 
  ipfsFetcher.cancelRequest(cid);

export const getIPFSStats = () => 
  ipfsFetcher.getStats();

export default ipfsFetcher;
