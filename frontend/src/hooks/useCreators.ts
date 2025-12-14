import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCreatorMetadata } from '@services/pinataService';
import { getAllCreators, getCreatorInfo } from '@services/contractService';

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
   * Fetch all registered creators from the contract
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
      console.log('Fetching creators from blockchain...');
      
      // Get all creator addresses from contract events
      const creatorAddresses = await getAllCreators();
      
      if (creatorAddresses.length === 0) {
        console.log('No creators registered yet');
        setCreators([]);
        setFilteredCreators([]);
        lastFetch.current = now;
        setIsLoading(false);
        return;
      }

      console.log(`Found ${creatorAddresses.length} creators`);

      // Fetch detailed info for each creator
      const creatorsData = await Promise.all(
        creatorAddresses.map(async (address) => {
          try {
            const info = await getCreatorInfo(address);
            if (!info) return null;

            // Fetch metadata from IPFS if available
            let metadata: any = {};
            if (info.metadataUri) {
              try {
                const ipfsData = await fetchCreatorMetadata(info.metadataUri);
                metadata = ipfsData;
              } catch (err) {
                console.warn(`Failed to fetch metadata for ${address}:`, err);
              }
            }

            return {
              address,
              name: info.name,
              bio: metadata.bio || '',
              rank: 0, // Will be calculated by sort
              createdAt: new Date(info.createdAt * 1000),
              metadataUri: info.metadataUri,
              metadata: {
                profileImage: metadata.profileImage,
                bannerImage: metadata.bannerImage,
                tags: metadata.tags || [],
                socialLinks: metadata.socialLinks || {},
                portfolio: metadata.portfolio || [],
              },
              stats: {
                totalStxReceived: info.totalStxReceived / 1_000_000, // Convert from micro-STX
                totalCheerReceived: info.totalCheerReceived,
                supporterCount: info.supportersCount,
              },
            };
          } catch (err) {
            console.error(`Error fetching creator ${address}:`, err);
            return null;
          }
        })
      );

      // Filter out null results
      const validCreators: Creator[] = creatorsData.filter((c): c is NonNullable<typeof c> => c !== null);
      
      // Sort by total value (STX + CHEER)
      validCreators.sort((a, b) => {
        const aTotal = (a?.stats?.totalStxReceived || 0) + (a?.stats?.totalCheerReceived || 0);
        const bTotal = (b?.stats?.totalStxReceived || 0) + (b?.stats?.totalCheerReceived || 0);
        return bTotal - aTotal;
      });

      // Assign ranks
      validCreators.forEach((creator) => {
        if (creator) {
          creator.rank = validCreators.indexOf(creator) + 1;
        }
      });

      setCreators(validCreators);
      setFilteredCreators(validCreators);
      lastFetch.current = now;
      
      console.log(`Successfully loaded ${validCreators.length} creators`);
    } catch (err) {
      console.error('Error fetching creators:', err);
      // Don't show error if contract isn't deployed yet
      if (err instanceof Error && (err.message.includes('contract') || err.message.includes('404'))) {
        console.log('Contract not deployed yet - showing empty state');
        setCreators([]);
        setFilteredCreators([]);
      } else {
        setError('Failed to load creators. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Filter by category
   */
  const filterByCategory = useCallback((category?: string) => {
    setFilterCategory(category || '');
  }, []);

  /**
   * Get single creator info
   */
  const getCreator = useCallback((address: string): Creator | undefined => {
    return creators.find((c) => c.address === address);
  }, [creators]);

  /**
   * Initial fetch - only once on mount
   */
  useEffect(() => {
    fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run once on mount

  /**
   * Apply filters when data or filter criteria changes
   */
  useEffect(() => {
    let result = [...creators];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((creator) =>
        creator.name.toLowerCase().includes(query) ||
        creator.bio.toLowerCase().includes(query) ||
        creator.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterCategory && filterCategory !== 'all') {
      result = result.filter((creator) =>
        creator.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(filterCategory.toLowerCase())
        )
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'tips':
        result.sort((a, b) => b.stats.totalStxReceived - a.stats.totalStxReceived);
        break;
      case 'cheers':
        result.sort((a, b) => b.stats.totalCheerReceived - a.stats.totalCheerReceived);
        break;
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredCreators(result);
  }, [creators, searchQuery, filterCategory, sortBy]);

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
