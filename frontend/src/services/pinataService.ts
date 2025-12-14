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

/**
 * Upload profile image to Pinata IPFS
 * @param file - Image file to upload
 * @param onProgress - Progress callback (0-100)
 * @returns IPFS CID
 */
export const uploadProfileImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Note: In production, these API calls should go through a backend proxy
    // to avoid exposing Pinata API keys in the frontend
    const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
    const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET;

    if (!PINATA_API_KEY || !PINATA_SECRET) {
      throw new Error('Pinata API credentials not configured. Please set up environment variables.');
    }

    console.log('Uploading image to Pinata:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);

    const formData = new FormData();
    formData.append('file', file);

    // Optional: Add metadata
    const metadata = JSON.stringify({
      name: `profile-${Date.now()}.${file.name.split('.').pop()}`,
      keyvalues: {
        type: 'profile-image',
        uploadedAt: new Date().toISOString(),
      },
    });
    formData.append('pinataMetadata', metadata);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(Math.min(percentComplete, 50)); // Reserve 50-100 for metadata upload
          }
        },
      }
    );

    const cid = response.data.IpfsHash;
    console.log('Image uploaded successfully. CID:', cid);
    return cid;
  } catch (error: any) {
    console.error('Failed to upload image to Pinata:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Pinata API credentials');
    } else if (error.response?.status === 413) {
      throw new Error('Image file is too large');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error(error.message || 'Failed to upload image to IPFS');
  }
};

/**
 * Upload metadata JSON to Pinata IPFS
 * @param metadata - Metadata object
 * @returns IPFS CID
 */
export const uploadMetadata = async (metadata: any): Promise<string> => {
  try {
    const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
    const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET;

    if (!PINATA_API_KEY || !PINATA_SECRET) {
      throw new Error('Pinata API credentials not configured');
    }

    console.log('Uploading metadata to Pinata:', metadata);

    const data = {
      pinataContent: metadata,
      pinataMetadata: {
        name: `creator-metadata-${Date.now()}.json`,
        keyvalues: {
          type: 'creator-metadata',
          creator: metadata.name,
          uploadedAt: new Date().toISOString(),
        },
      },
    };

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET,
        },
      }
    );

    const cid = response.data.IpfsHash;
    console.log('Metadata uploaded successfully. CID:', cid);

    // Cache the metadata
    metadataCache.set(cid, {
      data: metadata,
      timestamp: Date.now(),
    });

    return cid;
  } catch (error: any) {
    console.error('Failed to upload metadata to Pinata:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Pinata API credentials');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error(error.message || 'Failed to upload metadata to IPFS');
  }
};
