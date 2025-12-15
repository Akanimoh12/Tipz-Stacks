/**
 * Pinata Service
 * Upload content to IPFS via Pinata API
 */

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// Pinata API endpoints
const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_PIN_FILE_URL = `${PINATA_API_URL}/pinning/pinFileToIPFS`;
const PINATA_PIN_JSON_URL = `${PINATA_API_URL}/pinning/pinJSONToIPFS`;

/**
 * Get Pinata authorization headers
 */
function getPinataHeaders() {
  if (PINATA_JWT) {
    return {
      'Authorization': `Bearer ${PINATA_JWT}`,
    };
  } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    return {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY,
    };
  } else {
    throw new Error('Pinata credentials not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in .env file');
  }
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadToPinata(file, metadata = {}) {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      const pinataMetadata = {
        name: metadata.name || file.name,
        keyvalues: metadata,
      };
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    }

    // Add pinata options (optional)
    const pinataOptions = {
      cidVersion: 1, // Use CIDv1
    };
    formData.append('pinataOptions', JSON.stringify(pinataOptions));

    const response = await fetch(PINATA_PIN_FILE_URL, {
      method: 'POST',
      headers: getPinataHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Pinata upload failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    return data.IpfsHash; // Return CID
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 */
export async function uploadJSONToPinata(jsonData, metadata = {}) {
  if (!jsonData) {
    throw new Error('No JSON data provided for upload');
  }

  try {
    const body = {
      pinataContent: jsonData,
      pinataMetadata: {
        name: metadata.name || 'metadata.json',
        keyvalues: metadata,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    const response = await fetch(PINATA_PIN_JSON_URL, {
      method: 'POST',
      headers: {
        ...getPinataHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Pinata JSON upload failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    return data.IpfsHash; // Return CID
  } catch (error) {
    console.error('Pinata JSON upload error:', error);
    throw error;
  }
}

/**
 * Upload creator metadata to IPFS
 */
export async function uploadCreatorMetadata(metadata) {
  try {
    const cid = await uploadJSONToPinata(metadata, {
      name: `creator-${metadata.name || 'profile'}.json`,
      type: 'creator-metadata',
    });

    return cid;
  } catch (error) {
    console.error('Creator metadata upload error:', error);
    throw error;
  }
}

/**
 * Alias for uploadCreatorMetadata (for compatibility)
 */
export const uploadMetadata = uploadCreatorMetadata;

/**
 * Fetch creator metadata from IPFS
 * Note: This uses the optimized IPFS fetcher for caching and fallback
 */
export async function fetchCreatorMetadata(cid) {
  // Import dynamically to avoid circular dependencies
  const { fetchIPFSContent } = await import('./optimizedIpfsFetcher.js');
  
  try {
    const metadata = await fetchIPFSContent(cid, 'profile');
    return metadata;
  } catch (error) {
    console.error('Failed to fetch creator metadata:', error);
    throw error;
  }
}

/**
 * Upload profile image to IPFS
 */
export async function uploadProfileImage(file) {
  try {
    const cid = await uploadToPinata(file, {
      name: `profile-${Date.now()}.${file.name.split('.').pop()}`,
      type: 'profile-image',
    });

    return cid;
  } catch (error) {
    console.error('Profile image upload error:', error);
    throw error;
  }
}

/**
 * Test Pinata connection
 */
export async function testPinataConnection() {
  try {
    const response = await fetch(`${PINATA_API_URL}/data/testAuthentication`, {
      method: 'GET',
      headers: getPinataHeaders(),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.message === 'Congratulations! You are communicating with the Pinata API!';
  } catch (error) {
    console.error('Pinata connection test failed:', error);
    return false;
  }
}

/**
 * Get Pinata gateway URL for CID
 */
export function getPinataGatewayUrl(cid) {
  if (!cid) return '';
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Unpin content from Pinata (optional - for cleanup)
 */
export async function unpinFromPinata(cid) {
  try {
    const response = await fetch(`${PINATA_API_URL}/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: getPinataHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to unpin: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Pinata unpin error:', error);
    throw error;
  }
}

export default {
  uploadToPinata,
  uploadJSONToPinata,
  uploadCreatorMetadata,
  uploadProfileImage,
  testPinataConnection,
  getPinataGatewayUrl,
  unpinFromPinata,
};
