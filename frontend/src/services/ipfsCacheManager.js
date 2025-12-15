/**
 * Advanced IPFS Cache Manager
 * Multi-level caching: Memory -> localStorage -> IndexedDB
 * Handles TTL, LRU eviction, and cache statistics
 */

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  metadata: 60 * 60 * 1000, // 1 hour
  image: 24 * 60 * 60 * 1000, // 24 hours
  json: 60 * 60 * 1000, // 1 hour
  profile: 30 * 60 * 1000, // 30 minutes
};

// Storage limits
const STORAGE_LIMITS = {
  memory: 50 * 1024 * 1024, // 50MB
  localStorage: 5 * 1024 * 1024, // 5MB
  indexedDB: 100 * 1024 * 1024, // 100MB
};

class IPFSCacheManager {
  constructor() {
    // Level 1: Memory cache (fastest)
    this.memoryCache = new Map();
    this.memoryCacheSize = 0;

    // LRU tracking
    this.accessOrder = new Map(); // cid -> timestamp
    
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      memoryHits: 0,
      localStorageHits: 0,
      indexedDBHits: 0,
    };

    // Initialize IndexedDB
    this.initIndexedDB();
    
    // Cleanup expired entries on initialization
    this.cleanupExpired();
  }

  /**
   * Initialize IndexedDB for large file storage
   */
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TipzIPFSCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          const objectStore = db.createObjectStore('cache', { keyPath: 'cid' });
          objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Get cache entry from all levels
   */
  async get(cid) {
    // Level 1: Check memory cache
    if (this.memoryCache.has(cid)) {
      const entry = this.memoryCache.get(cid);
      if (!this.isExpired(entry)) {
        this.stats.hits++;
        this.stats.memoryHits++;
        this.updateAccessOrder(cid);
        return entry;
      } else {
        this.memoryCache.delete(cid);
      }
    }

    // Level 2: Check localStorage
    try {
      const stored = localStorage.getItem(`ipfs_cache_${cid}`);
      if (stored) {
        const entry = JSON.parse(stored);
        if (!this.isExpired(entry)) {
          this.stats.hits++;
          this.stats.localStorageHits++;
          // Promote to memory cache
          this.setMemoryCache(cid, entry);
          this.updateAccessOrder(cid);
          return entry;
        } else {
          localStorage.removeItem(`ipfs_cache_${cid}`);
        }
      }
    } catch (error) {
      console.warn('localStorage cache read error:', error);
    }

    // Level 3: Check IndexedDB
    try {
      const entry = await this.getFromIndexedDB(cid);
      if (entry && !this.isExpired(entry)) {
        this.stats.hits++;
        this.stats.indexedDBHits++;
        // Promote to memory cache
        this.setMemoryCache(cid, entry);
        this.updateAccessOrder(cid);
        return entry;
      } else if (entry) {
        await this.removeFromIndexedDB(cid);
      }
    } catch (error) {
      console.warn('IndexedDB cache read error:', error);
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set cache entry with automatic level selection
   */
  async set(cid, data, type = 'json', customTTL = null) {
    const ttl = customTTL || CACHE_TTL[type] || CACHE_TTL.json;
    const size = this.estimateSize(data);
    
    const entry = {
      cid,
      data,
      type,
      timestamp: Date.now(),
      size,
      expiresAt: Date.now() + ttl,
    };

    // Always set in memory cache
    this.setMemoryCache(cid, entry);

    // Set in localStorage for small data
    if (size < STORAGE_LIMITS.localStorage) {
      try {
        localStorage.setItem(`ipfs_cache_${cid}`, JSON.stringify(entry));
      } catch (error) {
        // localStorage full, clean up old entries
        this.cleanupLocalStorage();
        try {
          localStorage.setItem(`ipfs_cache_${cid}`, JSON.stringify(entry));
        } catch (e) {
          console.warn('localStorage cache write failed:', e);
        }
      }
    }

    // Set in IndexedDB for larger data (images)
    if (type === 'image' || size > STORAGE_LIMITS.localStorage) {
      try {
        await this.setInIndexedDB(entry);
      } catch (error) {
        console.warn('IndexedDB cache write error:', error);
      }
    }

    this.updateAccessOrder(cid);
  }

  /**
   * Check if CID is cached
   */
  async has(cid) {
    return (await this.get(cid)) !== null;
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(cid) {
    this.memoryCache.delete(cid);
    this.accessOrder.delete(cid);
    
    try {
      localStorage.removeItem(`ipfs_cache_${cid}`);
    } catch (error) {
      console.warn('localStorage invalidate error:', error);
    }

    try {
      await this.removeFromIndexedDB(cid);
    } catch (error) {
      console.warn('IndexedDB invalidate error:', error);
    }
  }

  /**
   * Clear cache entries older than specified time
   */
  async clear(olderThan = 0) {
    const cutoffTime = Date.now() - olderThan;

    // Clear memory cache
    for (const [cid, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < cutoffTime) {
        this.memoryCache.delete(cid);
        this.accessOrder.delete(cid);
      }
    }

    // Clear localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ipfs_cache_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored);
            if (entry.timestamp < cutoffTime) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('localStorage clear error:', error);
    }

    // Clear IndexedDB
    try {
      await this.clearIndexedDB(cutoffTime);
    } catch (error) {
      console.warn('IndexedDB clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      ...this.stats,
      totalRequests,
      hitRate: hitRate.toFixed(2),
      memoryCacheSize: this.memoryCacheSize,
      memoryCacheEntries: this.memoryCache.size,
      localStorageSize: this.getLocalStorageSize(),
      indexedDBSize: 'calculating...', // Would need async operation
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      memoryHits: 0,
      localStorageHits: 0,
      indexedDBHits: 0,
    };
  }

  // ===== Private Helper Methods =====

  /**
   * Set entry in memory cache with LRU eviction
   */
  setMemoryCache(cid, entry) {
    const entrySize = this.estimateSize(entry.data);

    // Check if we need to evict entries
    while (this.memoryCacheSize + entrySize > STORAGE_LIMITS.memory && this.memoryCache.size > 0) {
      this.evictLRU();
    }

    this.memoryCache.set(cid, entry);
    this.memoryCacheSize += entrySize;
  }

  /**
   * Evict least recently used entry from memory cache
   */
  evictLRU() {
    let oldestCid = null;
    let oldestTime = Infinity;

    for (const [cid, timestamp] of this.accessOrder.entries()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestCid = cid;
      }
    }

    if (oldestCid) {
      const entry = this.memoryCache.get(oldestCid);
      if (entry) {
        this.memoryCacheSize -= this.estimateSize(entry.data);
      }
      this.memoryCache.delete(oldestCid);
      this.accessOrder.delete(oldestCid);
    }
  }

  /**
   * Update access order for LRU tracking
   */
  updateAccessOrder(cid) {
    this.accessOrder.set(cid, Date.now());
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(entry) {
    return entry.expiresAt < Date.now();
  }

  /**
   * Estimate size of data in bytes
   */
  estimateSize(data) {
    if (typeof data === 'string') {
      return data.length * 2; // Rough estimate for UTF-16
    }
    if (data instanceof Blob) {
      return data.size;
    }
    // For objects, use JSON string length
    try {
      return JSON.stringify(data).length * 2;
    } catch {
      return 1024; // Default 1KB if can't estimate
    }
  }

  /**
   * Get localStorage size usage
   */
  getLocalStorageSize() {
    let size = 0;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ipfs_cache_')) {
          const item = localStorage.getItem(key);
          size += item ? item.length * 2 : 0;
        }
      });
    } catch (error) {
      console.warn('localStorage size calculation error:', error);
    }
    return size;
  }

  /**
   * Cleanup localStorage when full
   */
  cleanupLocalStorage() {
    try {
      const entries = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('ipfs_cache_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored);
            entries.push({ key, timestamp: entry.timestamp });
          }
        }
      });

      // Sort by timestamp and remove oldest 25%
      entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.ceil(entries.length * 0.25);
      
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(entries[i].key);
      }
    } catch (error) {
      console.warn('localStorage cleanup error:', error);
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanupExpired() {
    await this.clear(0); // Remove entries older than now (expired)
  }

  // ===== IndexedDB Operations =====

  async getFromIndexedDB(cid) {
    if (!this.db) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const objectStore = transaction.objectStore('cache');
      const request = objectStore.get(cid);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async setInIndexedDB(entry) {
    if (!this.db) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const objectStore = transaction.objectStore('cache');
      const request = objectStore.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromIndexedDB(cid) {
    if (!this.db) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const objectStore = transaction.objectStore('cache');
      const request = objectStore.delete(cid);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearIndexedDB(cutoffTime) {
    if (!this.db) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const objectStore = transaction.objectStore('cache');
      const index = objectStore.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.timestamp < cutoffTime) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
const cacheManager = new IPFSCacheManager();
export default cacheManager;
