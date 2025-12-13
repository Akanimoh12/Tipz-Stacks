import React from 'react';

interface ProfileImageProps {
  cid?: string | null;
  alt: string;
  size?: 'small' | 'medium' | 'large' | 'hero';
  className?: string;
}

const sizeClasses = {
  small: 'w-10 h-10',
  medium: 'w-20 h-20',
  large: 'w-32 h-32',
  hero: 'w-48 h-48',
};

export const ProfileImage: React.FC<ProfileImageProps> = ({
  cid,
  alt,
  size = 'medium',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const imageUrl = cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : null;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // Reset states when CID changes
  React.useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [cid]);

  const baseClasses = `${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 ${className}`;

  // Show skeleton while loading
  if (isLoading && imageUrl && !imageError) {
    return (
      <div className={`${baseClasses} animate-pulse bg-gray-200`}>
        <div className="w-full h-full rounded-full bg-gray-300"></div>
      </div>
    );
  }

  // Show default avatar if no image or error
  if (!imageUrl || imageError) {
    return (
      <div
        className={`${baseClasses} bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center`}
      >
        <span className="text-white font-bold text-xl">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={baseClasses}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading="lazy"
    />
  );
};
