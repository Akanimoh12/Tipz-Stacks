import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileCellProps {
  address: string;
  name: string;
  profileImage?: string;
  isCreator?: boolean;
}

export default function ProfileCell({ address, name, profileImage, isCreator = true }: ProfileCellProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (isCreator) {
      navigate(`/creator/${address}`);
    } else {
      navigate(`/tipper/${address}`);
    }
  };

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 cursor-pointer group"
      title={`View ${name}'s profile`}
    >
      {/* Profile Image */}
      <div className="relative shrink-0">
        {profileImage && !imageError ? (
          <img
            src={profileImage}
            alt={name}
            onError={() => setImageError(true)}
            className="w-10 h-10 rounded-full object-cover transition-transform group-hover:scale-110 border-2 border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110 border-2 border-gray-200">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name and Address */}
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-gray-900 truncate group-hover:text-orange-500 transition-colors">
          {name}
        </span>
        <span className="text-xs text-gray-500 truncate" title={address}>
          {truncatedAddress}
        </span>
      </div>
    </div>
  );
}
