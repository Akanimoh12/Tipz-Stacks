/**
 * useIPFS Hook
 * Simplified hook for IPFS operations with automatic caching and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import ipfsFetcher from '../services/optimizedIpfsFetcher';
import cacheManager from '../services/ipfsCacheManager';
import { uploadToPinata } from '../services/pinataService';
import { optimizeForUpload } from '../utils/ipfsImageOptimizer';

export function useIPFS() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetch content from IPFS
   */
  const fetchContent = useCallback(async (cid, type = 'json', options = {}) => {
    if (!cid) {
      setError('No CID provided');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await ipfsFetcher.fetchContent(cid, type, options);
      
      if (isMountedRef.current) {
        setData(result);
        setProgress(100);
        setIsLoading(false);
      }
      
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch content');
        setIsLoading(false);
        setProgress(0);
      }
      return null;
    }
  }, []);

  /**
   * Upload content to IPFS via Pinata
   */
  const uploadContent = useCallback(async (file, metadata = {}) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      let uploadFile = file;
      let additionalMetadata = { ...metadata };

      // Optimize images before upload
      if (file.type.startsWith('image/')) {
        setProgress(10);
        const optimized = await optimizeForUpload(file);
        
        setProgress(30);
        
        // Upload all versions
        const [originalCID, thumbnailCID, mediumCID] = await Promise.all([
          uploadToPinata(optimized.original, { ...metadata, version: 'original' }),
          uploadToPinata(optimized.thumbnail, { ...metadata, version: 'thumbnail' }),
          uploadToPinata(optimized.medium, { ...metadata, version: 'medium' }),
        ]);

        setProgress(80);

        const result = {
          original: originalCID,
          thumbnail: thumbnailCID,
          medium: mediumCID,
          metadata: optimized.metadata,
        };

        if (isMountedRef.current) {
          setData(result);
          setProgress(100);
          setIsLoading(false);
        }

        return result;
      } else {
        // Upload non-image files directly
        setProgress(50);
        const cid = await uploadToPinata(file, metadata);
        
        if (isMountedRef.current) {
          setData({ cid });
          setProgress(100);
          setIsLoading(false);
        }

        return { cid };
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to upload content');
        setIsLoading(false);
        setProgress(0);
      }
      throw err;
    }
  }, []);

  /**
   * Clear cache for specific CID
   */
  const clearCache = useCallback(async (cid = null) => {
    if (cid) {
      await cacheManager.invalidate(cid);
    } else {
      await cacheManager.clear(0);
    }
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return cacheManager.getStats();
  }, []);

  return {
    data,
    isLoading,
    error,
    progress,
    fetchContent,
    uploadContent,
    clearCache,
    getCacheStats,
  };
}

/**
 * Hook for fetching single IPFS content on mount
 */
export function useIPFSContent(cid, type = 'json', options = {}) {
  const { autoFetch = true, dependencies = [] } = options;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cid || !autoFetch) return;

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await ipfsFetcher.fetchContent(cid, type);
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch content');
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [cid, type, autoFetch, ...dependencies]);

  return { data, isLoading, error };
}

/**
 * Hook for batch fetching multiple CIDs
 */
export function useIPFSBatch(cidConfigs, options = {}) {
  const { autoFetch = true } = options;
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchBatch = useCallback(async () => {
    if (!cidConfigs || cidConfigs.length === 0) return;

    setIsLoading(true);
    setErrors({});
    setProgress(0);

    try {
      const result = await ipfsFetcher.fetchMultiple(cidConfigs, {
        onProgress: (prog) => setProgress(prog),
      });

      setResults(result.results);
      setErrors(result.errors);
      setIsLoading(false);
    } catch (err) {
      setErrors({ _general: err.message });
      setIsLoading(false);
    }
  }, [cidConfigs]);

  useEffect(() => {
    if (autoFetch) {
      fetchBatch();
    }
  }, [autoFetch, fetchBatch]);

  return {
    results,
    errors,
    isLoading,
    progress,
    refetch: fetchBatch,
  };
}

/**
 * Hook for uploading with progress tracking
 */
export function useIPFSUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const upload = useCallback(async (file, metadata = {}) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      let result;

      // Optimize images before upload
      if (file.type.startsWith('image/')) {
        setUploadProgress(10);
        const optimized = await optimizeForUpload(file);
        
        setUploadProgress(30);
        
        // Upload all versions
        const [originalCID, thumbnailCID, mediumCID] = await Promise.all([
          uploadToPinata(optimized.original, { ...metadata, version: 'original' }),
          uploadToPinata(optimized.thumbnail, { ...metadata, version: 'thumbnail' }),
          uploadToPinata(optimized.medium, { ...metadata, version: 'medium' }),
        ]);

        setUploadProgress(90);

        result = {
          original: originalCID,
          thumbnail: thumbnailCID,
          medium: mediumCID,
          metadata: optimized.metadata,
        };
      } else {
        setUploadProgress(50);
        const cid = await uploadToPinata(file, metadata);
        result = { cid };
      }

      setUploadProgress(100);
      setUploadResult(result);
      setIsUploading(false);

      return result;
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploadResult(null);
  }, []);

  return {
    upload,
    reset,
    isUploading,
    uploadProgress,
    uploadError,
    uploadResult,
  };
}

/**
 * Hook for prefetching content
 */
export function useIPFSPrefetch() {
  const prefetch = useCallback((cid, type = 'json') => {
    ipfsFetcher.prefetch(cid, type);
  }, []);

  const prefetchMultiple = useCallback((cidConfigs) => {
    ipfsFetcher.prefetchMultiple(cidConfigs);
  }, []);

  return {
    prefetch,
    prefetchMultiple,
  };
}

/**
 * Hook for IPFS statistics
 */
export function useIPFSStats() {
  const [stats, setStats] = useState(null);

  const refreshStats = useCallback(() => {
    const ipfsStats = ipfsFetcher.getStats();
    setStats(ipfsStats);
  }, []);

  useEffect(() => {
    refreshStats();
    
    // Refresh every 5 seconds
    const interval = setInterval(refreshStats, 5000);
    
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
  };
}

export default useIPFS;
