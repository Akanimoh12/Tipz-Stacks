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
  const fetchCreators = useCallback(async (forceRefresh = false) => {
    // Check cache
    const now = Date.now();
    if (!forceRefresh && now - lastFetch.current < CACHE_DURATION && creators.length > 0) {
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

      console.log(`Found ${creatorAddresses.length} creator addresses:`, creatorAddresses);

      // Fetch detailed info for each creator (with progress logging)
      const creatorsData: (Creator | null)[] = [];
      
      for (let i = 0; i < creatorAddresses.length; i++) {
        const address = creatorAddresses[i];
        console.log(`Fetching creator ${i + 1}/${creatorAddresses.length}: ${address}`);
        
        try {
          const info = await getCreatorInfo(address);
          
          if (!info) {
            console.warn(`No info found for ${address}`);
            continue;
          }

          console.log(`Creator info for ${address}:`, info);

          // Fetch metadata from IPFS if available
          let metadata: any = {};
          if (info.metadataUri) {
            try {
              console.log(`Fetching metadata from IPFS: ${info.metadataUri}`);
              const ipfsData = await fetchCreatorMetadata(info.metadataUri);
              metadata = ipfsData;
            } catch (err) {
              console.warn(`Failed to fetch metadata for ${address}:`, err);
              // Continue without metadata
            }
          }

          const creatorData: Creator = {
            address,
            name: info.name,
            bio: metadata.bio || 'No bio provided',
            rank: 0, // Will be calculated later
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

          creatorsData.push(creatorData);
        } catch (err) {
          console.error(`Error fetching creator ${address}:`, err);
        }
      }

      // Filter out nulls
      const validCreators = creatorsData.filter((c): c is Creator => c !== null);
      
      console.log(`Successfully loaded ${validCreators.length} creators with full data`);
      
      // Sort by total value (STX + CHEER)
      validCreators.sort((a, b) => {
        const aTotal = a.stats.totalStxReceived + (a.stats.totalCheerReceived / 100); // Weight CHEER less
        const bTotal = b.stats.totalStxReceived + (b.stats.totalCheerReceived / 100);
        return bTotal - aTotal;
      });

      // Assign ranks
      validCreators.forEach((creator, index) => {
        creator.rank = index + 1;
      });

      setCreators(validCreators);
      setFilteredCreators(validCreators);
      lastFetch.current = now;
      
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError(err instanceof Error ? err.message : 'Failed to load creators');
    } finally {
      setIsLoading(false);
    }
  }, [creators.length]);

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
   * Initial fetch and auto-refresh setup
   */
  useEffect(() => {
    // Initial fetch
    fetchCreators();

    // Set up auto-refresh every 2 minutes
    const interval = setInterval(() => {
      console.log('Auto-refreshing creators...');
      fetchCreators(true); // Force refresh
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
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
