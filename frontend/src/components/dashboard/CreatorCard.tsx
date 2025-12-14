import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';
import { ProfileImage } from '../common/ProfileImage';
import { Button } from '../common/Button';
import { Card, CardBody } from '../common/Card';

interface CreatorCardProps {
  address: string;
  name: string;
  bio: string;
  profileImage?: string;
  totalStxReceived: number;
  totalCheerReceived: number;
  supporterCount: number;
  rank: number;
  tags?: string[];
  onTip?: () => void;
  onCheer?: () => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  address,
  name,
  bio,
  profileImage,
  totalStxReceived,
  totalCheerReceived,
  supporterCount,
  rank,
  tags = [],
  onTip,
  onCheer,
}) => {
  const truncatedBio = bio.length > 100 ? `${bio.substring(0, 100)}...` : bio;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-t-4 border-[#FF6B35] h-full">
      <CardBody className="p-6 flex flex-col h-full">
        {/* Rank Badge */}
        {rank <= 3 && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center text-white font-bold text-sm shadow-md">
              #{rank}
            </div>
          </div>
        )}

        {/* Profile Image */}
        <Link to={`/creator/${address}`} className="block">
          <div className="flex justify-center mb-4">
            <ProfileImage cid={profileImage} alt={name} size="large" />
          </div>
        </Link>

        {/* Creator Info */}
        <Link to={`/creator/${address}`} className="block mb-auto">
          <h3 className="text-xl font-bold text-gray-800 text-center mb-2 group-hover:text-[#FF6B35] transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
            {truncatedBio}
          </p>
        </Link>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-orange-50 text-[#FF6B35] text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-[#FF6B35]">
              {totalStxReceived.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">STX</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#FF6B35]">
              {totalCheerReceived}
            </p>
            <p className="text-xs text-gray-500">CHEER</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700 flex items-center justify-center gap-1">
              <FiUsers className="text-sm" />
              {supporterCount}
            </p>
            <p className="text-xs text-gray-500">Supporters</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button
            onClick={onTip}
            className="flex-1 bg-linear-to-r from-[#FF6B35] to-[#FF8C42] text-white hover:shadow-lg"
            size="small"
          >
            Tip
          </Button>
          <Button
            onClick={onCheer}
            variant="secondary"
            className="flex-1 border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/5"
            size="small"
          >
            Cheer
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
