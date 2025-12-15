/**
 * useMetaTags Hook
 * Custom React hook for managing dynamic meta tags
 * Automatically updates Open Graph and Twitter Card tags on route changes
 */

import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  updateMetaTags,
  resetMetaTags,
  generateLandingMetaTags,
  generateCreatorProfileMetaTags,
  generateTipperProfileMetaTags,
  generateAchievementMetaTags,
  generateLeaderboardMetaTags,
  generateTransactionMetaTags,
} from '../utils/metaTags';
import { generateAndCacheImage } from '../utils/ogImageGenerator';

interface UseMetaTagsOptions {
  type?:
    | 'landing'
    | 'creator-profile'
    | 'tipper-profile'
    | 'achievement'
    | 'leaderboard'
    | 'transaction'
    | 'custom';
  data?: Record<string, any>;
  autoUpdate?: boolean;
}

interface UseMetaTagsReturn {
  setMetaTags: (type: string, data?: Record<string, any>) => void;
  resetMetaTags: () => void;
  generateShareImage: (
    element: HTMLElement,
    cacheKey: string
  ) => Promise<string>;
  isGenerating: boolean;
}

/**
 * Main hook for managing meta tags
 */
export function useMetaTags(
  options: UseMetaTagsOptions = {}
): UseMetaTagsReturn {
  const { type, data, autoUpdate = true } = options;
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Set meta tags based on type and data
   */
  const setMetaTags = useCallback(
    (metaType: string, metaData?: Record<string, any>) => {
      const finalData = metaData || data || {};

      try {
        switch (metaType) {
          case 'landing':
            updateMetaTags(generateLandingMetaTags());
            break;

          case 'creator-profile':
            if (
              finalData.creatorName &&
              finalData.creatorAddress &&
              finalData.stats
            ) {
              updateMetaTags(
                generateCreatorProfileMetaTags(
                  finalData.creatorName,
                  finalData.creatorAddress,
                  finalData.stats,
                  finalData.profileImage
                )
              );
            }
            break;

          case 'tipper-profile':
            if (
              finalData.tipperName &&
              finalData.tipperAddress &&
              finalData.stats
            ) {
              updateMetaTags(
                generateTipperProfileMetaTags(
                  finalData.tipperName,
                  finalData.tipperAddress,
                  finalData.stats
                )
              );
            }
            break;

          case 'achievement':
            if (
              finalData.achievementName &&
              finalData.achievementDescription &&
              finalData.userName &&
              finalData.userAddress
            ) {
              updateMetaTags(
                generateAchievementMetaTags(
                  finalData.achievementName,
                  finalData.achievementDescription,
                  finalData.userName,
                  finalData.userAddress,
                  finalData.achievementImage
                )
              );
            }
            break;

          case 'leaderboard':
            updateMetaTags(
              generateLeaderboardMetaTags(finalData.leaderboardType)
            );
            break;

          case 'transaction':
            if (
              finalData.creatorName &&
              finalData.amount &&
              finalData.tokenType
            ) {
              updateMetaTags(
                generateTransactionMetaTags(
                  finalData.creatorName,
                  finalData.amount,
                  finalData.tokenType,
                  finalData.tipperName
                )
              );
            }
            break;

          case 'custom':
            if (finalData.title || finalData.description || finalData.image) {
              updateMetaTags(finalData);
            }
            break;

          default:
            console.warn(`Unknown meta tag type: ${metaType}`);
            resetMetaTags();
        }
      } catch (error) {
        console.error('Error setting meta tags:', error);
        resetMetaTags();
      }
    },
    [data]
  );

  /**
   * Generate share image from HTML element
   */
  const generateShareImage = useCallback(
    async (element: HTMLElement, cacheKey: string): Promise<string> => {
      setIsGenerating(true);
      try {
        const dataUrl = await generateAndCacheImage(element, cacheKey);
        return dataUrl;
      } catch (error) {
        console.error('Error generating share image:', error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  /**
   * Auto-update meta tags on route change
   */
  useEffect(() => {
    if (autoUpdate && type) {
      setMetaTags(type, data);
    }

    // Cleanup on unmount
    return () => {
      if (autoUpdate) {
        resetMetaTags();
      }
    };
  }, [location.pathname, type, data, autoUpdate, setMetaTags]);

  return {
    setMetaTags,
    resetMetaTags,
    generateShareImage,
    isGenerating,
  };
}

/**
 * Hook for automatically setting meta tags based on route
 * Detects page type from URL and sets appropriate tags
 */
export function useAutoMetaTags(data?: Record<string, any>) {
  const location = useLocation();
  const { setMetaTags } = useMetaTags({ autoUpdate: false });

  useEffect(() => {
    const path = location.pathname;

    // Detect page type from URL
    if (path === '/' || path === '/landing') {
      setMetaTags('landing');
    } else if (path.startsWith('/creator/')) {
      if (data?.creatorName && data?.stats) {
        setMetaTags('creator-profile', data);
      }
    } else if (path.startsWith('/tipper/') || path.startsWith('/profile/')) {
      if (data?.tipperName && data?.stats) {
        setMetaTags('tipper-profile', data);
      }
    } else if (path.startsWith('/leaderboard')) {
      const searchParams = new URLSearchParams(location.search);
      const leaderboardType = searchParams.get('type') || 'creator';
      setMetaTags('leaderboard', { leaderboardType });
    } else if (path.startsWith('/achievement')) {
      if (data?.achievementName) {
        setMetaTags('achievement', data);
      }
    } else {
      // Default fallback
      setMetaTags('landing');
    }

    return () => {
      resetMetaTags();
    };
  }, [location.pathname, location.search, data, setMetaTags]);
}

/**
 * Hook for creator profile pages
 */
export function useCreatorMetaTags(
  creatorName: string,
  creatorAddress: string,
  stats: {
    tipsReceived: number;
    cheersReceived: number;
    supporters: number;
    rank: number;
  },
  profileImage?: string
) {
  const { setMetaTags } = useMetaTags();

  useEffect(() => {
    if (creatorName && creatorAddress && stats) {
      setMetaTags('creator-profile', {
        creatorName,
        creatorAddress,
        stats,
        profileImage,
      });
    }

    return () => {
      resetMetaTags();
    };
  }, [creatorName, creatorAddress, stats, profileImage, setMetaTags]);
}

/**
 * Hook for tipper profile pages
 */
export function useTipperMetaTags(
  tipperName: string,
  tipperAddress: string,
  stats: {
    tipsGiven: number;
    cheersGiven: number;
    creatorsSupported: number;
    rank: number;
    achievements: number;
  }
) {
  const { setMetaTags } = useMetaTags();

  useEffect(() => {
    if (tipperAddress && stats) {
      setMetaTags('tipper-profile', {
        tipperName,
        tipperAddress,
        stats,
      });
    }

    return () => {
      resetMetaTags();
    };
  }, [tipperName, tipperAddress, stats, setMetaTags]);
}

/**
 * Hook for achievement pages
 */
export function useAchievementMetaTags(
  achievementName: string,
  achievementDescription: string,
  userName: string,
  userAddress: string,
  achievementImage?: string
) {
  const { setMetaTags } = useMetaTags();

  useEffect(() => {
    if (achievementName && achievementDescription && userAddress) {
      setMetaTags('achievement', {
        achievementName,
        achievementDescription,
        userName,
        userAddress,
        achievementImage,
      });
    }

    return () => {
      resetMetaTags();
    };
  }, [
    achievementName,
    achievementDescription,
    userName,
    userAddress,
    achievementImage,
    setMetaTags,
  ]);
}

/**
 * Hook for leaderboard pages
 */
export function useLeaderboardMetaTags(type: 'creator' | 'tipper' = 'creator') {
  const { setMetaTags } = useMetaTags();

  useEffect(() => {
    setMetaTags('leaderboard', { leaderboardType: type });

    return () => {
      resetMetaTags();
    };
  }, [type, setMetaTags]);
}

export default useMetaTags;
