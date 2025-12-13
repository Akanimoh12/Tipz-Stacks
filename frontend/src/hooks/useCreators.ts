import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCreatorMetadata } from '@services/pinataService';

// Mock creator data for development (until contract is deployed)
interface Creator {
  address: string;
  name: string;
  bio: string;
  rank: number;
  createdAt: Date;
  metadataUri?: string;
  metadata?: {
    profileImage?: string;
    bannerImage?: string;
    tags?: string[];
    socialLinks?: {
      twitter?: string;
      github?: string;
      website?: string;
    };
    portfolio?: Array<{
      title: string;
      description?: string;
      url: string;
    }>;
  };
  stats: {
    totalStxReceived: number;
    totalCheerReceived: number;
    supporterCount: number;
  };
}

export const useCreators = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tips' | 'cheers' | 'newest' | 'name'>('tips');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const lastFetch = useRef<number>(0);
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  /**
   * Fetch creators from contract
   * TODO: Replace with actual contract call when deployed
   */
  const fetchCreators = useCallback(async () => {
    // Check cache
    const now = Date.now();
    if (now - lastFetch.current < CACHE_DURATION && creators.length > 0) {
      console.log('Using cached creators data');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching creators from contract...');
      
      // TODO: Replace with actual contract call
      // const result = await fetchCallReadOnlyFunction({
      //   network: getNetwork(),
      //   contractAddress: TIPZ_CORE_ADDRESS,
      //   contractName: TIPZ_CORE_NAME,
      //   functionName: 'get-all-creators',
      //   functionArgs: [],
      //   senderAddress: 'SP000000000000000000002Q6VF78',
      // });

      // Mock data for development
      const mockCreators: Creator[] = [
        {
          address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          name: 'Digital Artist',
          bio: 'Creating stunning digital art and NFTs on the blockchain. Passionate about decentralized creativity.',
          rank: 1,
          createdAt: new Date('2024-01-15'),
          metadata: {
            tags: ['Art & Design', 'Photography'],
            socialLinks: {
              twitter: 'https://twitter.com/digitalartist',
              website: 'https://example.com/artist',
            },
            portfolio: [
              {
                title: 'NFT Collection 2024',
                description: 'My latest collection of digital art NFTs',
                url: 'https://example.com/portfolio',
              },
            ],
          },
          stats: {
            totalStxReceived: 50.5,
            totalCheerReceived: 1000,
            supporterCount: 25,
          },
        },
        {
          address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          name: 'Indie Musician',
          bio: 'Independent musician sharing original songs. Support my journey to create more music!',
          rank: 2,
          createdAt: new Date('2024-02-20'),
          metadata: {
            tags: ['Music'],
            socialLinks: {
              twitter: 'https://twitter.com/indiemusician',
              website: 'https://example.com/music',
            },
            portfolio: [
              {
                title: 'Latest Album',
                description: 'My newest indie album',
                url: 'https://example.com/album',
              },
            ],
          },
          stats: {
            totalStxReceived: 30.2,
            totalCheerReceived: 750,
            supporterCount: 18,
          },
        },
        {
          address: 'ST2JHG321N2SXQNQDQD4C3G3F8Q6RQW5TTPVVFNG',
          name: 'Tech Writer',
          bio: 'Writing about blockchain, Web3, and decentralized technologies. Tips help me create more content.',
          rank: 3,
          createdAt: new Date('2024-03-10'),
          metadata: {
            tags: ['Technology', 'Writing'],
            socialLinks: {
              twitter: 'https://twitter.com/techwriter',
              github: 'https://github.com/techwriter',
              website: 'https://example.com/blog',
            },
            portfolio: [
              {
                title: 'Web3 Blog Series',
                description: 'Comprehensive guide to Web3 development',
                url: 'https://example.com/web3-guide',
              },
            ],
          },
          stats: {
            totalStxReceived: 25.8,
            totalCheerReceived: 500,
            supporterCount: 15,
          },
        },
      ];

      // If creators have metadata URIs, fetch from IPFS
      const creatorsWithMetadata = await Promise.all(
        mockCreators.map(async (creator) => {
          if (creator.metadataUri) {
            try {
              const metadata = await fetchCreatorMetadata(creator.metadataUri);
              return {
                ...creator,
                name: metadata.name || creator.name,
                bio: metadata.bio || creator.bio,
                metadata: {
                  ...creator.metadata,
                  profileImage: metadata.profileImage,
                  bannerImage: metadata.bannerImage,
                  socialLinks: metadata.socialLinks,
                  tags: metadata.tags || creator.metadata?.tags,
                  portfolio: metadata.portfolio || creator.metadata?.portfolio,
                },
              };
            } catch (err) {
              console.error('Error fetching metadata for creator:', creator.address, err);
              return creator;
            }
          }
          return creator;
        })
      );

      setCreators(creatorsWithMetadata);
      setFilteredCreators(creatorsWithMetadata);
      lastFetch.current = now;
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError('Failed to load creators. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [creators.length]);

  /**
   * Search creators by name
   */
  const searchCreators = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredCreators(creators);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = creators.filter((creator) =>
      creator.name.toLowerCase().includes(lowercaseQuery) ||
      creator.bio.toLowerCase().includes(lowercaseQuery) ||
      creator.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );

    setFilteredCreators(filtered);
  }, [creators]);

  /**
   * Sort creators
   */
  const sortCreators = useCallback((by: 'tips' | 'cheers' | 'newest' | 'name') => {
    setSortBy(by);
    
    const sorted = [...filteredCreators].sort((a, b) => {
      switch (by) {
        case 'tips':
          return b.stats.totalStxReceived - a.stats.totalStxReceived;
        case 'cheers':
          return b.stats.totalCheerReceived - a.stats.totalCheerReceived;
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredCreators(sorted);
  }, [filteredCreators]);

  /**
   * Filter by category
   */
  const filterByCategory = useCallback((category?: string) => {
    setFilterCategory(category || '');
    
    if (!category || category === 'all') {
      setFilteredCreators(creators);
      return;
    }

    const filtered = creators.filter((creator) =>
      creator.metadata?.tags?.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
    );

    setFilteredCreators(filtered);
  }, [creators]);

  /**
   * Get single creator info
   */
  const getCreator = useCallback((address: string): Creator | undefined => {
    return creators.find((c) => c.address === address);
  }, [creators]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchCreators();
  }, []);

  /**
   * Apply search when query changes
   */
  useEffect(() => {
    searchCreators(searchQuery);
  }, [searchQuery, searchCreators]);

  /**
   * Apply sort when sort option changes
   */
  useEffect(() => {
    sortCreators(sortBy);
  }, [sortBy]);

  /**
   * Apply filter when category changes
   */
  useEffect(() => {
    filterByCategory(filterCategory);
  }, [filterCategory]);

  return {
    creators: filteredCreators,
    filteredCreators,
    allCreators: creators,
    isLoading,
    error,
    searchQuery,
    sortBy,
    filterCategory,
    setSearchQuery,
    setSortBy,
    setFilterCategory,
    searchCreators: (query: string) => setSearchQuery(query),
    sortCreators: (by: 'tips' | 'cheers' | 'newest' | 'name') => setSortBy(by),
    filterByCategory,
    fetchCreators,
    getCreator,
    totalCount: creators.length,
    filteredCount: filteredCreators.length,
  };
};
