import { useState, useCallback, useEffect } from 'react';
import type { ShareData } from '../services/socialShareService';
import {
  generateShareableUrl,
  getShareCountByType,
  getTotalShareCount,
  storeReferralData,
} from '../services/socialShareService';

interface UseSocialShareReturn {
  isShareModalOpen: boolean;
  shareData: ShareData | null;
  selectedPlatform: string | null;
  shareCount: number;
  openShareModal: (data: ShareData) => void;
  closeShareModal: () => void;
  setSelectedPlatform: (platform: string | null) => void;
  getShareCountForType: (type: string) => number;
  totalShares: number;
}

export function useSocialShare(): UseSocialShareReturn {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState(0);
  const [totalShares, setTotalShares] = useState(0);

  // Load share counts on mount
  useEffect(() => {
    const total = getTotalShareCount();
    setTotalShares(total);
  }, []);

  // Store referral data on mount
  useEffect(() => {
    storeReferralData();
  }, []);

  const openShareModal = useCallback((data: ShareData) => {
    setShareData(data);
    setIsShareModalOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setSelectedPlatform(null);
    // Update share count after closing modal
    setTimeout(() => {
      const total = getTotalShareCount();
      setTotalShares(total);
      if (shareData) {
        const typeCount = getShareCountByType(shareData.type);
        setShareCount(typeCount);
      }
    }, 100);
  }, [shareData]);

  const getShareCountForType = useCallback((type: string): number => {
    return getShareCountByType(type);
  }, []);

  return {
    isShareModalOpen,
    shareData,
    selectedPlatform,
    shareCount,
    openShareModal,
    closeShareModal,
    setSelectedPlatform,
    getShareCountForType,
    totalShares,
  };
}

// Helper hook for creating shareable URLs with referral tracking
export function useShareableUrl() {
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    // Get user address from wallet context or localStorage
    const address = localStorage.getItem('currentUserAddress');
    if (address) {
      setUserAddress(address);
    }
  }, []);

  const createShareableUrl = useCallback((
    path: string,
    options?: {
      action?: string;
      creator?: string;
    }
  ): string => {
    return generateShareableUrl(
      path,
      userAddress || undefined,
      options?.action,
      options?.creator
    );
  }, [userAddress]);

  return { createShareableUrl, userAddress };
}
