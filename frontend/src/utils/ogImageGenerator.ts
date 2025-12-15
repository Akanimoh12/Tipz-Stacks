/**
 * Open Graph Image Generator
 * Generates 1200x630px images for social media previews
 * Uses html-to-image for converting React components to images
 */

import { toPng, toJpeg } from 'html-to-image';

interface OGImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  cacheDuration?: number; // in milliseconds
}

const DEFAULT_OPTIONS: OGImageOptions = {
  width: 1200,
  height: 630,
  quality: 0.95,
  cacheDuration: 1000 * 60 * 60 * 24, // 24 hours
};

/**
 * Generate image from HTML element
 */
export async function generateImageFromElement(
  element: HTMLElement,
  options: OGImageOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const dataUrl = await toPng(element, {
      width: opts.width,
      height: opts.height,
      quality: opts.quality,
      pixelRatio: 2, // High DPI for better quality
      cacheBust: true,
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Generate JPEG image (smaller file size)
 */
export async function generateJpegFromElement(
  element: HTMLElement,
  options: OGImageOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const dataUrl = await toJpeg(element, {
      width: opts.width,
      height: opts.height,
      quality: opts.quality,
      pixelRatio: 2,
      cacheBust: true,
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating JPEG:', error);
    throw error;
  }
}

/**
 * Cache management for generated images
 */
class ImageCache {
  private cacheKey = 'tipz_og_images';

  /**
   * Get cached image
   */
  get(key: string): string | null {
    try {
      const cache = this.getCache();
      const item = cache[key];

      if (!item) return null;

      // Check if expired
      if (Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }

      return item.dataUrl;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Set cached image
   */
  set(key: string, dataUrl: string, duration = DEFAULT_OPTIONS.cacheDuration!): void {
    try {
      const cache = this.getCache();
      cache[key] = {
        dataUrl,
        expiry: Date.now() + duration,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Error writing to cache:', error);
      // If localStorage is full, clear old entries
      this.clearExpired();
    }
  }

  /**
   * Remove cached image
   */
  remove(key: string): void {
    try {
      const cache = this.getCache();
      delete cache[key];
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    try {
      const cache = this.getCache();
      const now = Date.now();
      const cleaned: Record<string, any> = {};

      Object.keys(cache).forEach((key) => {
        if (cache[key].expiry > now) {
          cleaned[key] = cache[key];
        }
      });

      localStorage.setItem(this.cacheKey, JSON.stringify(cleaned));
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.cacheKey);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache object
   */
  private getCache(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.cacheKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { count: number; size: number } {
    try {
      const data = localStorage.getItem(this.cacheKey);
      return {
        count: data ? Object.keys(JSON.parse(data)).length : 0,
        size: data ? new Blob([data]).size : 0,
      };
    } catch (error) {
      return { count: 0, size: 0 };
    }
  }
}

export const imageCache = new ImageCache();

/**
 * Generate and cache OG image
 */
export async function generateAndCacheImage(
  element: HTMLElement,
  cacheKey: string,
  options: OGImageOptions = {}
): Promise<string> {
  // Check cache first
  const cached = imageCache.get(cacheKey);
  if (cached) {
    console.log('Using cached OG image:', cacheKey);
    return cached;
  }

  // Generate new image
  console.log('Generating new OG image:', cacheKey);
  const dataUrl = await generateImageFromElement(element, options);

  // Cache the result
  imageCache.set(cacheKey, dataUrl, options.cacheDuration);

  return dataUrl;
}

/**
 * Download image to user's device
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy image to clipboard
 */
export async function copyImageToClipboard(dataUrl: string): Promise<void> {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);

    console.log('Image copied to clipboard');
  } catch (error) {
    console.error('Error copying image to clipboard:', error);
    throw error;
  }
}

/**
 * Generate cache key for specific content
 */
export function generateCacheKey(
  type: string,
  identifier: string,
  version = '1'
): string {
  return `og_${type}_${identifier}_v${version}`;
}

/**
 * Compress image data URL
 */
export function compressImage(dataUrl: string, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Get image dimensions
 */
export function getImageDimensions(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Validate image aspect ratio for OG images
 */
export function isValidOGImageRatio(
  width: number,
  height: number,
  tolerance = 0.05
): boolean {
  const expectedRatio = 1200 / 630; // 1.905
  const actualRatio = width / height;
  const difference = Math.abs(expectedRatio - actualRatio);

  return difference <= tolerance;
}

/**
 * Upload image to IPFS (optional, for permanent URLs)
 */
export async function uploadImageToIPFS(
  dataUrl: string,
  filename: string
): Promise<string> {
  try {
    // Convert data URL to file
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: 'image/png' });

    // Upload to Pinata (reuse existing service)
    const formData = new FormData();
    formData.append('file', file);

    const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
    const pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY;

    const uploadResponse = await fetch(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      {
        method: 'POST',
        headers: {
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretKey,
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    const data = await uploadResponse.json();
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;

    console.log('Image uploaded to IPFS:', ipfsUrl);
    return ipfsUrl;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Preload fonts for image generation
 */
export async function preloadFonts(): Promise<void> {
  try {
    const fonts = [
      new FontFace('Inter', 'url(https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap)'),
      new FontFace('Poppins', 'url(https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap)'),
    ];

    await Promise.all(fonts.map(font => font.load()));
    fonts.forEach(font => document.fonts.add(font));

    console.log('Fonts preloaded for image generation');
  } catch (error) {
    console.error('Error preloading fonts:', error);
  }
}

export default {
  generateImageFromElement,
  generateJpegFromElement,
  generateAndCacheImage,
  downloadImage,
  copyImageToClipboard,
  generateCacheKey,
  compressImage,
  getImageDimensions,
  isValidOGImageRatio,
  uploadImageToIPFS,
  preloadFonts,
  imageCache,
};
