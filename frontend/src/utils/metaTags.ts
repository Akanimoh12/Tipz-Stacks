/**
 * Meta Tags Manager
 * Handles dynamic Open Graph and Twitter Card meta tag generation
 * for rich social media previews
 */

interface MetaTagData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  creatorName?: string;
  creatorHandle?: string;
  stats?: Record<string, string | number>;
  achievementName?: string;
  amount?: string;
  rank?: number;
}

interface MetaTag {
  property?: string;
  name?: string;
  content: string;
}

/**
 * Default meta tags for the platform
 */
const DEFAULT_META = {
  title: "Tipz Stacks - Empower Your Favorite Creators",
  description:
    "Support creators with STX or CHEER tokens on the Stacks blockchain. Claim 100 free CHEER daily. Join the decentralized creator economy.",
  image: "/og-image-default.png", // Default platform image
  url: "https://tipz-stacks.vercel.app",
  type: "website",
  twitterSite: "@TipzStacks",
};

/**
 * Update meta tags in document head
 */
export function updateMetaTags(data: MetaTagData): void {
  const metaTags = generateAllMetaTags(data);

  metaTags.forEach((tag) => {
    const selector = tag.property
      ? `meta[property="${tag.property}"]`
      : `meta[name="${tag.name}"]`;

    let element = document.querySelector(selector) as HTMLMetaElement;

    if (!element) {
      element = document.createElement("meta");
      if (tag.property) {
        element.setAttribute("property", tag.property);
      } else if (tag.name) {
        element.setAttribute("name", tag.name);
      }
      document.head.appendChild(element);
    }

    element.setAttribute("content", tag.content);
  });

  // Update document title
  if (data.title) {
    document.title = data.title;
  }
}

/**
 * Generate all meta tags (Open Graph + Twitter Card)
 */
function generateAllMetaTags(data: MetaTagData): MetaTag[] {
  const ogTags = generateOGTags(data);
  const twitterTags = generateTwitterCardTags(data);
  return [...ogTags, ...twitterTags];
}

/**
 * Generate Open Graph meta tags
 */
export function generateOGTags(data: MetaTagData): MetaTag[] {
  const title = data.title || DEFAULT_META.title;
  const description = data.description || DEFAULT_META.description;
  const image = data.image || DEFAULT_META.image;
  const url = data.url || DEFAULT_META.url;
  const type = data.type || DEFAULT_META.type;

  return [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: "Tipz Stacks" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: title },
  ];
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(data: MetaTagData): MetaTag[] {
  const title = data.title || DEFAULT_META.title;
  const description = data.description || DEFAULT_META.description;
  const image = data.image || DEFAULT_META.image;
  const creator = data.creatorHandle || DEFAULT_META.twitterSite;

  return [
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: DEFAULT_META.twitterSite },
    { name: "twitter:creator", content: creator },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: title },
  ];
}

/**
 * Generate meta tags for Landing Page
 */
export function generateLandingMetaTags(): MetaTagData {
  return {
    title: DEFAULT_META.title,
    description: DEFAULT_META.description,
    image: `${DEFAULT_META.url}/og-landing.png`,
    url: DEFAULT_META.url,
    type: "website",
  };
}

/**
 * Generate meta tags for Creator Profile
 */
export function generateCreatorProfileMetaTags(
  creatorName: string,
  creatorAddress: string,
  stats: {
    tipsReceived: number;
    cheersReceived: number;
    supporters: number;
    rank: number;
  },
  profileImage?: string
): MetaTagData {
  const title = `Support ${creatorName} on Tipz Stacks`;
  const description = `${creatorName} is ranked #${stats.rank} with ${stats.supporters} supporters. Tip with STX or cheer with CHEER tokens!`;
  const url = `${DEFAULT_META.url}/creator/${creatorAddress}`;

  return {
    title,
    description,
    image: profileImage || `${url}/og-image`, // Dynamic OG image endpoint
    url,
    type: "profile",
    creatorName,
    stats: {
      tipsReceived: stats.tipsReceived,
      cheersReceived: stats.cheersReceived,
      supporters: stats.supporters,
      rank: stats.rank,
    },
  };
}

/**
 * Generate meta tags for Tipper Profile
 */
export function generateTipperProfileMetaTags(
  tipperName: string,
  tipperAddress: string,
  stats: {
    tipsGiven: number;
    cheersGiven: number;
    creatorsSupported: number;
    rank: number;
    achievements: number;
  }
): MetaTagData {
  const displayName = tipperName || `Supporter ${tipperAddress.slice(0, 8)}`;
  const title = `${displayName}'s Profile - Rank #${stats.rank}`;
  const description = `Supporting ${stats.creatorsSupported} creators with ${stats.achievements} achievements unlocked. Join the creator economy on Tipz Stacks!`;
  const url = `${DEFAULT_META.url}/tipper/${tipperAddress}`;

  return {
    title,
    description,
    image: `${url}/og-image`,
    url,
    type: "profile",
    stats: {
      tipsGiven: stats.tipsGiven,
      cheersGiven: stats.cheersGiven,
      creatorsSupported: stats.creatorsSupported,
      rank: stats.rank,
      achievements: stats.achievements,
    },
  };
}

/**
 * Generate meta tags for Achievement
 */
export function generateAchievementMetaTags(
  achievementName: string,
  achievementDescription: string,
  userName: string,
  userAddress: string,
  achievementImage?: string
): MetaTagData {
  const title = `🎉 ${achievementName} Unlocked!`;
  const description = `${userName} just unlocked "${achievementName}" on Tipz Stacks! ${achievementDescription}`;
  const url = `${DEFAULT_META.url}/achievement/${userAddress}/${encodeURIComponent(
    achievementName
  )}`;

  return {
    title,
    description,
    image: achievementImage || `${url}/og-image`,
    url,
    type: "article",
    achievementName,
  };
}

/**
 * Generate meta tags for Leaderboards
 */
export function generateLeaderboardMetaTags(
  type: "creator" | "tipper" = "creator"
): MetaTagData {
  const title =
    type === "creator"
      ? "Top Creators on Tipz Stacks"
      : "Top Supporters on Tipz Stacks";
  const description =
    type === "creator"
      ? "Discover the most supported creators on the Stacks blockchain. Tip your favorites with STX or CHEER!"
      : "Meet the most generous supporters on Tipz Stacks. Join the community and support your favorite creators!";
  const url = `${DEFAULT_META.url}/leaderboards?type=${type}`;

  return {
    title,
    description,
    image: `${url}/og-image`,
    url,
    type: "website",
  };
}

/**
 * Generate meta tags for Transaction/Tip share
 */
export function generateTransactionMetaTags(
  creatorName: string,
  amount: string,
  tokenType: "STX" | "CHEER",
  tipperName?: string
): MetaTagData {
  const tipper = tipperName || "A supporter";
  const title = `${tipper} just tipped ${creatorName}!`;
  const description = `${amount} ${tokenType} sent to ${creatorName} on Tipz Stacks. Support your favorite creators today!`;

  return {
    title,
    description,
    image: `${DEFAULT_META.url}/og-transaction.png`,
    url: DEFAULT_META.url,
    type: "article",
    creatorName,
    amount: `${amount} ${tokenType}`,
  };
}

/**
 * Reset meta tags to default
 */
export function resetMetaTags(): void {
  updateMetaTags(generateLandingMetaTags());
}

/**
 * Get current page URL for sharing
 */
export function getCurrentPageUrl(): string {
  return window.location.href;
}

/**
 * Truncate text for meta descriptions (max 160 characters)
 */
export function truncateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format creator/tipper name for meta tags
 */
export function formatDisplayName(
  name: string | undefined,
  address: string
): string {
  if (name && name.trim()) return name;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Generate structured data (JSON-LD) for SEO
 */
export function generateStructuredData(
  type: "Person" | "Organization" | "Article",
  data: Record<string, unknown>
): void {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  });

  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  document.head.appendChild(script);
}

export default {
  updateMetaTags,
  generateOGTags,
  generateTwitterCardTags,
  generateLandingMetaTags,
  generateCreatorProfileMetaTags,
  generateTipperProfileMetaTags,
  generateAchievementMetaTags,
  generateLeaderboardMetaTags,
  generateTransactionMetaTags,
  resetMetaTags,
  getCurrentPageUrl,
  truncateDescription,
  formatDisplayName,
  generateStructuredData,
};
