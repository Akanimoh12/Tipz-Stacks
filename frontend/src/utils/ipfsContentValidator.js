/**
 * IPFS Content Validator
 * Validate and sanitize content retrieved from IPFS
 */

// File size limits (in bytes)
const SIZE_LIMITS = {
  metadata: 100 * 1024, // 100KB
  image: 10 * 1024 * 1024, // 10MB
  json: 500 * 1024, // 500KB
  profile: 50 * 1024, // 50KB
};

// Required fields for different content types
const REQUIRED_FIELDS = {
  creatorMetadata: ['name', 'category'],
  profile: ['displayName'],
};

/**
 * Validate content based on type
 */
export async function validateContent(data, type = 'json') {
  switch (type) {
    case 'metadata':
    case 'profile':
      return validateMetadata(data, type);
    case 'image':
      return validateImage(data);
    case 'json':
      return validateJSON(data);
    default:
      return data; // No validation for unknown types
  }
}

/**
 * Validate creator metadata
 */
export function validateMetadata(data, type = 'metadata') {
  // Ensure data is an object
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid JSON in metadata');
    }
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('Metadata must be an object');
  }

  // Check size
  const size = JSON.stringify(data).length * 2;
  const limit = SIZE_LIMITS[type] || SIZE_LIMITS.metadata;
  
  if (size > limit) {
    throw new Error(`Metadata exceeds size limit of ${limit / 1024}KB`);
  }

  // Check required fields for creator metadata
  if (type === 'metadata' || type === 'profile') {
    const requiredFields = REQUIRED_FIELDS.creatorMetadata || [];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.warn(`Missing recommended fields: ${missingFields.join(', ')}`);
      // Don't throw, just warn - allow flexible metadata
    }
  }

  // Sanitize content
  const sanitized = sanitizeContent(data);

  return sanitized;
}

/**
 * Validate image data
 */
export function validateImage(data) {
  // Check if data is Blob or File
  if (!(data instanceof Blob)) {
    throw new Error('Image must be a Blob or File');
  }

  // Check size
  if (data.size > SIZE_LIMITS.image) {
    throw new Error(`Image exceeds size limit of ${SIZE_LIMITS.image / 1024 / 1024}MB`);
  }

  // Check MIME type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(data.type)) {
    throw new Error(`Invalid image type: ${data.type}. Allowed: ${validTypes.join(', ')}`);
  }

  return data;
}

/**
 * Validate JSON data
 */
export function validateJSON(data) {
  // Try to parse if string
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  // Check size
  const size = JSON.stringify(data).length * 2;
  if (size > SIZE_LIMITS.json) {
    throw new Error(`JSON exceeds size limit of ${SIZE_LIMITS.json / 1024}KB`);
  }

  return data;
}

/**
 * Sanitize content by removing dangerous fields
 */
export function sanitizeContent(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // Create a deep copy
  const sanitized = JSON.parse(JSON.stringify(data));

  // Remove potentially dangerous fields
  const dangerousFields = ['__proto__', 'constructor', 'prototype'];
  
  function removeDangerousFields(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    for (const field of dangerousFields) {
      delete obj[field];
    }

    // Recursively sanitize nested objects
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = removeDangerousFields(obj[key]);
      }
    }

    return obj;
  }

  return removeDangerousFields(sanitized);
}

/**
 * Validate CID format
 */
export function isValidCID(cid) {
  if (typeof cid !== 'string') {
    return false;
  }

  // Basic CID validation
  // CIDv0: starts with Qm, 46 characters
  // CIDv1: starts with b (base32) or z (base58), variable length
  const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidV1Regex = /^(b[a-z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,})$/;

  return cidV0Regex.test(cid) || cidV1Regex.test(cid);
}

/**
 * Validate wallet address format (Stacks)
 */
export function isValidStacksAddress(address) {
  if (typeof address !== 'string') {
    return false;
  }

  // Stacks addresses start with SP or SM (mainnet) or ST (testnet)
  const stacksAddressRegex = /^S[TPM][1-9A-HJ-NP-Za-km-z]{38,41}$/;
  return stacksAddressRegex.test(address);
}

/**
 * Validate URL format
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string (remove HTML, scripts, etc.)
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') {
    return str;
  }

  // Remove HTML tags
  let sanitized = str.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validate and sanitize creator metadata specifically
 */
export function validateCreatorMetadata(metadata) {
  const validated = {
    name: '',
    category: '',
    bio: '',
    avatar: '',
    social: {},
  };

  // Name (required)
  if (metadata.name && typeof metadata.name === 'string') {
    validated.name = sanitizeString(metadata.name).substring(0, 50);
  } else {
    throw new Error('Creator name is required');
  }

  // Category (required)
  const validCategories = [
    'Artist',
    'Musician',
    'Writer',
    'Streamer',
    'Developer',
    'Educator',
    'Other',
  ];
  
  if (metadata.category && validCategories.includes(metadata.category)) {
    validated.category = metadata.category;
  } else {
    validated.category = 'Other';
  }

  // Bio (optional)
  if (metadata.bio && typeof metadata.bio === 'string') {
    validated.bio = sanitizeString(metadata.bio).substring(0, 500);
  }

  // Avatar (optional, must be valid CID)
  if (metadata.avatar && isValidCID(metadata.avatar)) {
    validated.avatar = metadata.avatar;
  }

  // Social links (optional)
  if (metadata.social && typeof metadata.social === 'object') {
    const socialFields = ['twitter', 'github', 'website', 'discord'];
    
    for (const field of socialFields) {
      if (metadata.social[field] && typeof metadata.social[field] === 'string') {
        const url = metadata.social[field];
        
        // Validate URL format
        if (isValidURL(url) || field === 'discord') {
          validated.social[field] = sanitizeString(url).substring(0, 200);
        }
      }
    }
  }

  return validated;
}

/**
 * Create default metadata if validation fails
 */
export function getDefaultMetadata(address) {
  return {
    name: `Creator ${address.substring(0, 8)}`,
    category: 'Other',
    bio: '',
    avatar: '',
    social: {},
  };
}

/**
 * Validate file before upload
 */
export function validateFileForUpload(file) {
  if (!(file instanceof File)) {
    throw new Error('Must be a File object');
  }

  // Check file size
  if (file.size > SIZE_LIMITS.image) {
    throw new Error(`File size exceeds ${SIZE_LIMITS.image / 1024 / 1024}MB limit`);
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${validTypes.join(', ')}`);
  }

  return true;
}

/**
 * Check for malicious content patterns (basic)
 */
export function scanForMaliciousContent(data) {
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  
  // Check for common malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /eval\(/i,
    /expression\(/i,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(dataStr)) {
      console.warn('Potentially malicious content detected:', pattern);
      return true;
    }
  }

  return false;
}

/**
 * Validate content type header
 */
export function validateContentType(contentType, expectedType) {
  if (!contentType) {
    return false;
  }

  const type = contentType.toLowerCase();

  switch (expectedType) {
    case 'json':
      return type.includes('application/json') || type.includes('text/plain');
    case 'image':
      return type.startsWith('image/');
    case 'metadata':
    case 'profile':
      return type.includes('application/json') || type.includes('text/plain');
    default:
      return true;
  }
}

/**
 * Log validation errors for monitoring
 */
export function logValidationError(cid, error, type) {
  console.error('IPFS Content Validation Error:', {
    cid,
    type,
    error: error.message,
    timestamp: new Date().toISOString(),
  });

  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { extra: { cid, type } });
}

/**
 * Get validation statistics
 */
const validationStats = {
  totalValidations: 0,
  successfulValidations: 0,
  failedValidations: 0,
  maliciousContentDetected: 0,
};

export function recordValidation(success, malicious = false) {
  validationStats.totalValidations++;
  if (success) {
    validationStats.successfulValidations++;
  } else {
    validationStats.failedValidations++;
  }
  if (malicious) {
    validationStats.maliciousContentDetected++;
  }
}

export function getValidationStats() {
  return {
    ...validationStats,
    successRate: validationStats.totalValidations > 0
      ? ((validationStats.successfulValidations / validationStats.totalValidations) * 100).toFixed(2)
      : 0,
  };
}
