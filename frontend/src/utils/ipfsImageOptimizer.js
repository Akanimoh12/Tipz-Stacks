/**
 * IPFS Image Optimizer
 * Resize, compress, and optimize images for IPFS upload and display
 */

/**
 * Optimize image before IPFS upload
 */
export async function optimizeImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    convertToWebP = false,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = async () => {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to desired format
          const mimeType = convertToWebP ? 'image/webp' : file.type;
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to optimize image'));
                return;
              }

              // Create File from Blob
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, convertToWebP ? '.webp' : ''),
                { type: mimeType }
              );

              resolve({
                file: optimizedFile,
                originalSize: file.size,
                optimizedSize: optimizedFile.size,
                compressionRatio: ((1 - optimizedFile.size / file.size) * 100).toFixed(2),
                dimensions: { width, height },
              });
            },
            mimeType,
            quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(imageData, size = 150) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > size) {
          height = Math.round(height * (size / width));
          width = size;
        }
      } else {
        if (height > size) {
          width = Math.round(width * (size / height));
          height = size;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate thumbnail'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.8
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Handle different input types
    if (imageData instanceof Blob) {
      img.src = URL.createObjectURL(imageData);
    } else if (typeof imageData === 'string') {
      img.src = imageData;
    } else {
      reject(new Error('Invalid image data type'));
    }
  });
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(imageData, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert to WebP'));
            return;
          }
          resolve(blob);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    if (imageData instanceof Blob) {
      img.src = URL.createObjectURL(imageData);
    } else if (typeof imageData === 'string') {
      img.src = imageData;
    } else {
      reject(new Error('Invalid image data type'));
    }
  });
}

/**
 * Compress image with specified quality
 */
export async function compressImage(imageData, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    if (imageData instanceof Blob) {
      img.src = URL.createObjectURL(imageData);
    } else if (typeof imageData === 'string') {
      img.src = imageData;
    } else {
      reject(new Error('Invalid image data type'));
    }
  });
}

/**
 * Optimize image for upload with multiple sizes
 */
export async function optimizeForUpload(file) {
  try {
    // Generate optimized versions
    const [original, thumbnail, medium] = await Promise.all([
      optimizeImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 }),
      optimizeImage(file, { maxWidth: 150, maxHeight: 150, quality: 0.8 }),
      optimizeImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 }),
    ]);

    return {
      original: original.file,
      thumbnail: thumbnail.file,
      medium: medium.file,
      metadata: {
        originalSize: file.size,
        optimizedSize: original.optimizedSize,
        thumbnailSize: thumbnail.optimizedSize,
        mediumSize: medium.optimizedSize,
        totalSavings: file.size - (original.optimizedSize + thumbnail.optimizedSize + medium.optimizedSize),
      },
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw error;
  }
}

/**
 * Create responsive image srcset
 */
export function createResponsiveImageSrcSet(cids, gatewayUrl = 'https://gateway.pinata.cloud/ipfs/') {
  if (!cids || typeof cids !== 'object') {
    return '';
  }

  const srcSet = [];

  if (cids.thumbnail) {
    srcSet.push(`${gatewayUrl}${cids.thumbnail} 150w`);
  }
  if (cids.medium) {
    srcSet.push(`${gatewayUrl}${cids.medium} 400w`);
  }
  if (cids.original) {
    srcSet.push(`${gatewayUrl}${cids.original} 1200w`);
  }

  return srcSet.join(', ');
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(imageData) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    if (imageData instanceof Blob) {
      img.src = URL.createObjectURL(imageData);
    } else if (typeof imageData === 'string') {
      img.src = imageData;
    } else {
      reject(new Error('Invalid image data type'));
    }
  });
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

/**
 * Lazy load image with IntersectionObserver
 */
export function setupLazyLoading(imageElement, options = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.01,
  } = options;

  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    if (imageElement.dataset.src) {
      imageElement.src = imageElement.dataset.src;
    }
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }

          obs.unobserve(img);
        }
      });
    },
    { rootMargin, threshold }
  );

  observer.observe(imageElement);

  return () => observer.disconnect();
}

/**
 * Preload image
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Batch preload images
 */
export async function preloadImages(srcArray) {
  const promises = srcArray.map(src => preloadImage(src));
  return Promise.allSettled(promises);
}

/**
 * Convert blob to data URL
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert data URL to blob
 */
export function dataURLToBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Calculate image file size reduction
 */
export function calculateSizeReduction(originalSize, optimizedSize) {
  const reduction = originalSize - optimizedSize;
  const percentage = ((reduction / originalSize) * 100).toFixed(2);
  
  return {
    reduction,
    percentage,
    readable: `${(reduction / 1024).toFixed(2)} KB (${percentage}%)`,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
