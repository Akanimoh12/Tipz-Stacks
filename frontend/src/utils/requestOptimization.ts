/**
 * Request Batching and Deduplication Utilities
 * Optimizes network requests by batching and preventing duplicate calls
 */

type RequestKey = string;
type RequestCallback<T> = () => Promise<T>;

interface BatchConfig {
  maxBatchSize?: number;
  batchDelay?: number;
  maxWaitTime?: number;
}

interface CacheEntry<T> {
  promise: Promise<T>;
  timestamp: number;
  data?: T;
}

/**
 * Request Deduplicator
 * Prevents duplicate identical requests from being made simultaneously
 */
class RequestDeduplicator {
  private cache = new Map<RequestKey, CacheEntry<any>>();
  private cacheTimeout = 60000; // 1 minute default

  /**
   * Execute request with deduplication
   */
  async dedupe<T>(key: RequestKey, callback: RequestCallback<T>, ttl?: number): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached promise if still valid
    if (cached && now - cached.timestamp < (ttl || this.cacheTimeout)) {
      return cached.promise;
    }

    // Create new request
    const promise = callback()
      .then(data => {
        // Update cache with data
        const entry = this.cache.get(key);
        if (entry) {
          entry.data = data;
        }
        return data;
      })
      .catch(error => {
        // Remove from cache on error
        this.cache.delete(key);
        throw error;
      });

    // Store in cache
    this.cache.set(key, { promise, timestamp: now });

    return promise;
  }

  /**
   * Clear specific cache entry
   */
  clear(key: RequestKey): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries
   */
  prune(): void {
    const now = Date.now();
    const expired: RequestKey[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.cacheTimeout) {
        expired.push(key);
      }
    });

    expired.forEach(key => this.cache.delete(key));
  }
}

/**
 * Request Batcher
 * Batches multiple requests together to reduce network overhead
 */
class RequestBatcher<R> {
  private queue: Array<{
    key: string;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private config: Required<BatchConfig>;

  private batchHandler: (keys: string[]) => Promise<Map<string, R>>;

  constructor(
    batchHandler: (keys: string[]) => Promise<Map<string, R>>,
    config: BatchConfig = {}
  ) {
    this.batchHandler = batchHandler;
    this.config = {
      maxBatchSize: config.maxBatchSize || 50,
      batchDelay: config.batchDelay || 50,
      maxWaitTime: config.maxWaitTime || 1000,
    };
  }

  /**
   * Add request to batch queue
   */
  async add(key: string): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      // Process immediately if batch is full
      if (this.queue.length >= this.config.maxBatchSize) {
        this.processBatch();
        return;
      }

      // Schedule batch processing
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(
          () => this.processBatch(),
          this.config.batchDelay
        );
      }
    });
  }

  /**
   * Process current batch
   */
  private async processBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const batch = this.queue.splice(0, this.config.maxBatchSize);
    if (batch.length === 0) return;

    const keys = batch.map(item => item.key);

    try {
      const results = await this.batchHandler(keys);

      // Resolve individual promises
      batch.forEach(item => {
        const result = results.get(item.key);
        if (result !== undefined) {
          item.resolve(result);
        } else {
          item.reject(new Error(`No result for key: ${item.key}`));
        }
      });
    } catch (error) {
      // Reject all on batch error
      batch.forEach(item => item.reject(error));
    }

    // Process remaining items
    if (this.queue.length > 0) {
      this.processBatch();
    }
  }

  /**
   * Get queue size
   */
  queueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clear(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.queue = [];
  }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastResult: ReturnType<T>;

  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(this, args);
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Rate limiter
 */
class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private maxPerInterval: number;
  private interval: number;

  constructor(
    maxPerInterval: number,
    interval: number
  ) {
    this.maxPerInterval = maxPerInterval;
    this.interval = interval;
  }

  /**
   * Execute function with rate limiting
   */
  async execute<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await callback();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  /**
   * Process queue
   */
  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxPerInterval);
      
      // Execute batch in parallel
      await Promise.all(batch.map(fn => fn()));

      // Wait for interval before next batch
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.interval));
      }
    }

    this.processing = false;
  }

  /**
   * Get queue size
   */
  queueSize(): number {
    return this.queue.length;
  }
}

// Create singleton instances
export const requestDeduplicator = new RequestDeduplicator();

// Example batch handler for creator metadata
export const creatorMetadataBatcher = new RequestBatcher<any>(
  async (cids: string[]) => {
    // Fetch multiple CIDs in parallel
    const results = await Promise.allSettled(
      cids.map(async (cid) => {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        const data = await response.json();
        return { cid, data };
      })
    );

    // Convert to Map
    const resultMap = new Map<string, any>();
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        resultMap.set(cids[index], result.value.data);
      }
    });

    return resultMap;
  },
  { maxBatchSize: 20, batchDelay: 100 }
);

// Rate limiter for API calls (10 requests per second)
export const apiRateLimiter = new RateLimiter(10, 1000);

// Export utilities
export {
  RequestDeduplicator,
  RequestBatcher,
  RateLimiter,
};

// Export types
export type { RequestKey, RequestCallback, BatchConfig };
