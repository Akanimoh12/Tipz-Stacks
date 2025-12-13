import axios from 'axios';

const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Cache for IPFS metadata to reduce fetches
const metadataCache = new Map<string, any>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface CreatorMetadata {
  name: string;
  bio: string;
  profileImage?: string; // IPFS CID
  bannerImage?: string; // IPFS CID
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    github?: string;
  };
  portfolio?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  tags?: string[];
  category?: string;
}

interface CachedData {
  data: any;
  timestamp: number;
}

/**
 * Fetch creator metadata from IPFS via Pinata gateway
 */
export const fetchCreatorMetadata = async (cid: string): Promise<CreatorMetadata> => {
  if (!cid || cid === 'none') {
    console.log('No CID provided, returning default metadata');
    return getDefaultMetadata();
  }

  // Check cache first
  const cached = metadataCache.get(cid) as CachedData | undefined;
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached metadata for CID:', cid);
    return cached.data;
  }

  try {
    console.log('Fetching metadata from IPFS:', cid);
    const url = `${PINATA_GATEWAY}${cid}`;
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
    });

    const metadata = response.data as CreatorMetadata;
    
    // Validate metadata structure
    if (!metadata.name || !metadata.bio) {
      console.warn('Invalid metadata structure, using defaults');
      return getDefaultMetadata();
    }

    // Cache the result
    metadataCache.set(cid, {
      data: metadata,
      timestamp: Date.now(),
    });

    console.log('Successfully fetched metadata:', metadata.name);
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    return getDefaultMetadata();
  }
};

/**
 * Get IPFS image URL from CID
 */
export const getIpfsImageUrl = (cid: string | undefined): string | null => {
  if (!cid || cid === 'none') return null;
  return `${PINATA_GATEWAY}${cid}`;
};

/**
 * Default metadata for creators without IPFS data
 */
const getDefaultMetadata = (): CreatorMetadata => {
  return {
    name: 'Anonymous Creator',
    bio: 'This creator hasn\'t set up their profile yet.',
    tags: [],
    portfolio: [],
  };
};

/**
 * Upload image to Pinata (for creator registration)
 * Note: This requires Pinata API key which should be on backend
 */
export const uploadImageToPinata = async (file: File): Promise<string> => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET;

  if (!apiKey || !secretKey) {
    throw new Error('Pinata API credentials not configured');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error('Failed to upload image to IPFS');
  }
};

/**
 * Upload JSON metadata to Pinata
 */
export const uploadMetadataToPinata = async (
  metadata: CreatorMetadata
): Promise<string> => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET;

  if (!apiKey || !secretKey) {
    throw new Error('Pinata API credentials not configured');
  }

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
};

/**
 * Clear metadata cache
 */
export const clearMetadataCache = () => {
  metadataCache.clear();
};
