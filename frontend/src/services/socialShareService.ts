// Social Share Service
// Handles URL generation, message templates, and analytics for social sharing

export interface ShareData {
  type: 'tip' | 'cheer' | 'claim' | 'achievement' | 'registration' | 'leaderboard';
  url: string;
  creatorName?: string;
  amount?: number;
  achievementName?: string;
  rank?: number;
  leaderboardType?: string;
  progress?: string;
}

interface ShareAnalytics {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'copy';
  type: string;
  timestamp: number;
}

const BASE_URL = window.location.origin;
const PLATFORM_HANDLE = '@TipzStacks';

// Default hashtags
const DEFAULT_HASHTAGS = ['TipzStacks', 'StacksBlockchain', 'Bitcoin'];
const CREATOR_HASHTAGS = ['CreatorEconomy', 'SupportCreators'];
const ACHIEVEMENT_HASHTAGS = ['Milestone', 'Achievement'];

/**
 * Generate Twitter/X share URL
 */
export function generateTwitterShareUrl(text: string, url: string, hashtags: string[] = DEFAULT_HASHTAGS): string {
  const params = new URLSearchParams({
    text: text,
    url: url,
    hashtags: hashtags.join(','),
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate Facebook share URL
 */
export function generateFacebookShareUrl(url: string): string {
  const params = new URLSearchParams({
    u: url,
  });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Generate LinkedIn share URL
 */
export function generateLinkedInShareUrl(url: string, title?: string, summary?: string): string {
  const params = new URLSearchParams({
    url: url,
  });
  if (title) params.append('title', title);
  if (summary) params.append('summary', summary);
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Generate pre-filled message for sharing
 */
export function generateShareMessage(data: ShareData): string {
  const { type, creatorName, amount, achievementName, rank, leaderboardType, progress } = data;

  switch (type) {
    case 'tip':
      return `Just tipped ${creatorName ? '@' + creatorName : 'a creator'} ${amount} STX on ${PLATFORM_HANDLE}! 🎉 Support amazing creators: ${data.url}`;
    
    case 'cheer':
      return `Cheered ${creatorName ? '@' + creatorName : 'a creator'} with ${amount} CHEER tokens on ${PLATFORM_HANDLE}! 🎊`;
    
    case 'claim':
      return `Claimed my daily 100 CHEER tokens on ${PLATFORM_HANDLE}! Free tokens every 24 hours 🎁 ${data.url}`;
    
    case 'achievement':
      return `🏆 Unlocked '${achievementName}' on ${PLATFORM_HANDLE}! ${progress || ''} ${data.url}`;
    
    case 'registration':
      return `🎨 Just joined ${PLATFORM_HANDLE} as a creator! Support me at ${data.url}`;
    
    case 'leaderboard':
      return `Ranked #${rank} on ${PLATFORM_HANDLE} ${leaderboardType || 'leaderboard'}! 🏅 ${data.url}`;
    
    default:
      return `Check out ${PLATFORM_HANDLE} - Support creators on the Stacks blockchain! ${data.url}`;
  }
}

/**
 * Get appropriate hashtags for share type
 */
export function getHashtagsForType(type: ShareData['type']): string[] {
  switch (type) {
    case 'tip':
    case 'cheer':
    case 'registration':
      return [...DEFAULT_HASHTAGS, ...CREATOR_HASHTAGS];
    
    case 'achievement':
      return [...DEFAULT_HASHTAGS, ...ACHIEVEMENT_HASHTAGS];
    
    case 'claim':
    case 'leaderboard':
    default:
      return DEFAULT_HASHTAGS;
  }
}

/**
 * URL encode text for sharing
 */
export function encodeShareText(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Generate shareable URL with UTM parameters
 */
export function generateShareableUrl(
  path: string,
  refAddress?: string,
  action?: string,
  creator?: string
): string {
  const url = new URL(path, BASE_URL);
  
  if (refAddress) {
    url.searchParams.set('ref', refAddress);
  }
  if (action) {
    url.searchParams.set('action', action);
  }
  if (creator) {
    url.searchParams.set('creator', creator);
  }
  
  // Add UTM parameters for tracking
  url.searchParams.set('utm_source', 'social_share');
  url.searchParams.set('utm_medium', 'social');
  
  return url.toString();
}

/**
 * Track share event in localStorage
 */
export function trackShare(platform: ShareAnalytics['platform'], type: string): void {
  try {
    const key = 'tipz_share_analytics';
    const existing = localStorage.getItem(key);
    const analytics: ShareAnalytics[] = existing ? JSON.parse(existing) : [];
    
    analytics.push({
      platform,
      type,
      timestamp: Date.now(),
    });
    
    // Keep only last 500 shares
    if (analytics.length > 500) {
      analytics.splice(0, analytics.length - 500);
    }
    
    localStorage.setItem(key, JSON.stringify(analytics));
  } catch (error) {
    console.error('Error tracking share:', error);
  }
}

/**
 * Get share analytics from localStorage
 */
export function getShareAnalytics(): ShareAnalytics[] {
  try {
    const key = 'tipz_share_analytics';
    const existing = localStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error getting share analytics:', error);
    return [];
  }
}

/**
 * Get share count by type
 */
export function getShareCountByType(type: string): number {
  const analytics = getShareAnalytics();
  return analytics.filter(a => a.type === type).length;
}

/**
 * Get share count by platform
 */
export function getShareCountByPlatform(platform: ShareAnalytics['platform']): number {
  const analytics = getShareAnalytics();
  return analytics.filter(a => a.platform === platform).length;
}

/**
 * Get total share count
 */
export function getTotalShareCount(): number {
  return getShareAnalytics().length;
}

/**
 * Open share window
 */
export function openShareWindow(url: string, width: number = 600, height: number = 400): void {
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1`
  );
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      console.error('Failed to copy text:', err);
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Parse referral data from URL
 */
export function parseReferralData(): {
  ref?: string;
  action?: string;
  creator?: string;
} {
  const params = new URLSearchParams(window.location.search);
  
  return {
    ref: params.get('ref') || undefined,
    action: params.get('action') || undefined,
    creator: params.get('creator') || undefined,
  };
}

/**
 * Store referral data in localStorage
 */
export function storeReferralData(): void {
  const referralData = parseReferralData();
  
  if (referralData.ref) {
    try {
      localStorage.setItem('tipz_referral', JSON.stringify({
        ...referralData,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error storing referral data:', error);
    }
  }
}

/**
 * Get stored referral data
 */
export function getStoredReferralData(): any {
  try {
    const data = localStorage.getItem('tipz_referral');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting referral data:', error);
    return null;
  }
}

/**
 * Shorten URL (placeholder for future URL shortener integration)
 */
export async function shortenUrl(url: string): Promise<string> {
  // TODO: Integrate with URL shortener service (bit.ly, tinyurl, etc.)
  // For now, return the original URL
  return url;
}
