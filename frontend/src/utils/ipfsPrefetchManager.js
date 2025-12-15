/**
 * IPFS Prefetching Strategies
 * Proactive content loading for improved performance
 */

import ipfsFetcher from '../services/optimizedIpfsFetcher';

class IPFSPrefetchManager {
  constructor() {
    this.prefetchQueue = new Set();
    this.maxConcurrentPrefetch = 3;
    this.activePrefetch = 0;
    this.intersectionObserver = null;
    this.hoverTimeout = null;
    this.prefetchedCIDs = new Set();
    
    // Initialize intersection observer for scroll-based prefetch
    this.initIntersectionObserver();
  }

  /**
   * Initialize Intersection Observer for viewport detection
   */
  initIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const cid = element.dataset.prefetchCid;
            const type = element.dataset.prefetchType || 'json';
            
            if (cid && !this.prefetchedCIDs.has(cid)) {
              this.prefetch(cid, type, 'scroll');
            }
          }
        });
      },
      {
        rootMargin: '200px', // Start prefetch 200px before entering viewport
        threshold: 0.01,
      }
    );
  }

  /**
   * Prefetch content with priority queue
   */
  async prefetch(cid, type = 'json', trigger = 'manual') {
    if (!cid || this.prefetchedCIDs.has(cid)) {
      return;
    }

    // Add to queue
    this.prefetchQueue.add({ cid, type, trigger, timestamp: Date.now() });
    this.prefetchedCIDs.add(cid);

    // Process queue
    this.processQueue();
  }

  /**
   * Process prefetch queue
   */
  async processQueue() {
    if (this.activePrefetch >= this.maxConcurrentPrefetch || this.prefetchQueue.size === 0) {
      return;
    }

    // Get next item from queue
    const items = Array.from(this.prefetchQueue);
    const nextItem = items[0];
    this.prefetchQueue.delete(nextItem);

    this.activePrefetch++;

    try {
      await ipfsFetcher.prefetch(nextItem.cid, nextItem.type);
      console.log(`✓ Prefetched ${nextItem.cid} (trigger: ${nextItem.trigger})`);
    } catch (error) {
      console.warn(`✗ Failed to prefetch ${nextItem.cid}:`, error.message);
    } finally {
      this.activePrefetch--;
      
      // Process next in queue
      if (this.prefetchQueue.size > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Setup hover-based prefetch for an element
   */
  setupHoverPrefetch(element, cid, type = 'json') {
    if (!element || !cid) return;

    const handleMouseEnter = () => {
      // Delay prefetch slightly to avoid prefetching on accidental hovers
      this.hoverTimeout = setTimeout(() => {
        if (!this.prefetchedCIDs.has(cid)) {
          this.prefetch(cid, type, 'hover');
        }
      }, 100);
    };

    const handleMouseLeave = () => {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Return cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
    };
  }

  /**
   * Setup scroll-based prefetch for an element
   */
  setupScrollPrefetch(element, cid, type = 'json') {
    if (!element || !cid || !this.intersectionObserver) return;

    element.dataset.prefetchCid = cid;
    element.dataset.prefetchType = type;
    
    this.intersectionObserver.observe(element);

    // Return cleanup function
    return () => {
      this.intersectionObserver.unobserve(element);
      delete element.dataset.prefetchCid;
      delete element.dataset.prefetchType;
    };
  }

  /**
   * Prefetch popular/top content
   */
  async prefetchPopularContent(cidConfigs) {
    // Limit to top 10 to avoid excessive prefetching
    const limited = cidConfigs.slice(0, 10);

    for (const { cid, type } of limited) {
      await this.prefetch(cid, type, 'popular');
      
      // Small delay between prefetches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Prefetch creator profiles from leaderboard
   */
  async prefetchLeaderboardCreators(creators) {
    const cidConfigs = creators
      .filter(creator => creator.metadataCID)
      .slice(0, 10) // Top 10 creators
      .map(creator => ({
        cid: creator.metadataCID,
        type: 'profile',
      }));

    await this.prefetchPopularContent(cidConfigs);
  }

  /**
   * Prefetch on route change (e.g., when navigating to Discover page)
   */
  async prefetchForRoute(route, data = {}) {
    switch (route) {
      case '/discover':
        // Prefetch top creators
        if (data.creators && Array.isArray(data.creators)) {
          const cidConfigs = data.creators
            .slice(0, 5)
            .filter(c => c.metadataCID)
            .map(c => ({ cid: c.metadataCID, type: 'profile' }));
          
          await this.prefetchPopularContent(cidConfigs);
        }
        break;

      case '/leaderboards':
        // Prefetch top leaderboard profiles
        if (data.topCreators && Array.isArray(data.topCreators)) {
          await this.prefetchLeaderboardCreators(data.topCreators);
        }
        break;

      default:
        // No prefetch for other routes
        break;
    }
  }

  /**
   * Clear prefetch cache
   */
  clearPrefetchCache() {
    this.prefetchedCIDs.clear();
    this.prefetchQueue.clear();
  }

  /**
   * Get prefetch statistics
   */
  getStats() {
    return {
      prefetchedCount: this.prefetchedCIDs.size,
      queueSize: this.prefetchQueue.size,
      activePrefetch: this.activePrefetch,
      maxConcurrent: this.maxConcurrentPrefetch,
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.clearPrefetchCache();
  }
}

// Export singleton instance
const prefetchManager = new IPFSPrefetchManager();

// Export convenience functions
export const prefetchIPFS = (cid, type, trigger) => 
  prefetchManager.prefetch(cid, type, trigger);

export const setupHoverPrefetch = (element, cid, type) => 
  prefetchManager.setupHoverPrefetch(element, cid, type);

export const setupScrollPrefetch = (element, cid, type) => 
  prefetchManager.setupScrollPrefetch(element, cid, type);

export const prefetchPopularContent = (cidConfigs) => 
  prefetchManager.prefetchPopularContent(cidConfigs);

export const prefetchLeaderboardCreators = (creators) => 
  prefetchManager.prefetchLeaderboardCreators(creators);

export const prefetchForRoute = (route, data) => 
  prefetchManager.prefetchForRoute(route, data);

export const getPrefetchStats = () => 
  prefetchManager.getStats();

export default prefetchManager;
