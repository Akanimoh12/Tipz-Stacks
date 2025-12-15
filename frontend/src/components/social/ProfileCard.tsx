/**
 * ProfileCard Component
 * Generates beautiful 1200x630px cards for sharing creator/tipper profiles
 * Supports both creator and tipper variants
 */

import React, { useRef, useState } from 'react';
import { FiDownload, FiCopy, FiShare2, FiTrendingUp, FiUsers, FiAward, FiHeart } from 'react-icons/fi';
import {
  generateAndCacheImage,
  downloadImage,
  copyImageToClipboard,
  generateCacheKey,
} from '../../utils/ogImageGenerator';

interface ProfileStats {
  primary: { label: string; value: string | number; icon: React.ReactNode };
  secondary: { label: string; value: string | number; icon: React.ReactNode };
  tertiary: { label: string; value: string | number; icon: React.ReactNode };
  quaternary: { label: string; value: string | number; icon: React.ReactNode };
}

interface ProfileCardProps {
  type: 'creator' | 'tipper';
  name: string;
  address: string;
  profileImage?: string;
  rank: number;
  stats: ProfileStats;
  bio?: string;
  onExport?: (dataUrl: string) => void;
}

export default function ProfileCard({
  type,
  name,
  address,
  profileImage,
  rank,
  stats,
  bio,
  onExport,
}: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleExportAsImage = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const cacheKey = generateCacheKey(
        `profile_${type}`,
        address
      );

      const dataUrl = await generateAndCacheImage(cardRef.current, cacheKey);

      if (onExport) {
        onExport(dataUrl);
      }

      return dataUrl;
    } catch (error) {
      console.error('Error exporting profile card:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await handleExportAsImage();
    if (dataUrl) {
      const filename = `tipz-${type}-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadImage(dataUrl, filename);
    }
  };

  const handleCopyImage = async () => {
    const dataUrl = await handleExportAsImage();
    if (dataUrl) {
      try {
        await copyImageToClipboard(dataUrl);
        alert('Image copied to clipboard!');
      } catch (error) {
        alert('Failed to copy image. Try downloading instead.');
      }
    }
  };

  const displayName = name || `${address.slice(0, 10)}...`;
  const rankBadge = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`;
  const typeLabel = type === 'creator' ? 'Creator' : 'Supporter';
  const ctaText = type === 'creator' ? 'Support This Creator' : 'Join the Community';

  return (
    <div className="space-y-4">
      {/* Actual OG Image Card */}
      <div
        ref={cardRef}
        className="relative bg-white"
        style={{
          width: '1200px',
          height: '630px',
          transformOrigin: 'top left',
        }}
      >
        {/* Orange Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-500 to-orange-600" />

        {/* Content Container */}
        <div className="h-full flex p-16 gap-12">
          {/* Left Side - Profile */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            {/* Profile Image */}
            <div className="relative mb-8">
              {/* Rank Badge */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl z-10 border-4 border-white">
                {rankBadge}
              </div>

              {/* Profile Picture */}
              <div className="w-80 h-80 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-2xl border-8 border-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-9xl">
                    {type === 'creator' ? '🎨' : '💝'}
                  </span>
                )}
              </div>
            </div>

            {/* Type Badge */}
            <div className="bg-gray-100 px-6 py-3 rounded-full">
              <span className="text-2xl font-semibold text-gray-700 uppercase tracking-wider">
                {typeLabel}
              </span>
            </div>
          </div>

          {/* Right Side - Info */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Name */}
            <h1 className="text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {displayName}
            </h1>

            {/* Address */}
            <p className="text-2xl text-gray-500 font-mono mb-8">
              {address.slice(0, 12)}...{address.slice(-8)}
            </p>

            {/* Bio (if provided) */}
            {bio && (
              <p className="text-2xl text-gray-700 mb-10 leading-relaxed line-clamp-2">
                {bio}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              {/* Primary Stat */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-orange-600">
                  {stats.primary.icon}
                  <span className="text-xl font-semibold">{stats.primary.label}</span>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.primary.value}
                </div>
              </div>

              {/* Secondary Stat */}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-gray-600">
                  {stats.secondary.icon}
                  <span className="text-xl font-semibold">{stats.secondary.label}</span>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.secondary.value}
                </div>
              </div>

              {/* Tertiary Stat */}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-gray-600">
                  {stats.tertiary.icon}
                  <span className="text-xl font-semibold">{stats.tertiary.label}</span>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.tertiary.value}
                </div>
              </div>

              {/* Quaternary Stat */}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-gray-600">
                  {stats.quaternary.icon}
                  <span className="text-xl font-semibold">{stats.quaternary.label}</span>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.quaternary.value}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-orange-500 text-white px-8 py-5 rounded-2xl inline-flex items-center gap-3 self-start shadow-lg">
              <span className="text-3xl font-bold">{ctaText}</span>
              <FiTrendingUp className="text-3xl" />
            </div>
          </div>
        </div>

        {/* Platform Branding - Bottom */}
        <div className="absolute bottom-8 left-16 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">Tipz Stacks</div>
            <div className="text-lg text-gray-600">tipz-stacks.com</div>
          </div>
        </div>
      </div>

      {/* Scaled Preview */}
      <div className="relative">
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div
            style={{
              transform: 'scale(0.4)',
              transformOrigin: 'top left',
              width: '1200px',
              height: '630px',
            }}
          >
            <div className="bg-white w-full h-full relative">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-500 to-orange-600" />
              <div className="h-full flex items-center justify-center p-16">
                <div className="text-center">
                  <div className="text-9xl mb-8">
                    {type === 'creator' ? '🎨' : '💝'}
                  </div>
                  <h1 className="text-6xl font-bold mb-4">{displayName}</h1>
                  <div className="text-3xl text-orange-600 font-bold">{rankBadge} {typeLabel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Controls */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="bg-white border-2 border-orange-500 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 font-semibold shadow-lg"
            disabled={isGenerating}
          >
            <FiShare2 />
            {isGenerating ? 'Generating...' : 'Export'}
          </button>

          {showExportOptions && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[200px]">
              <button
                onClick={handleDownload}
                className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                disabled={isGenerating}
              >
                <FiDownload className="text-orange-600" />
                <span className="font-medium">Download PNG</span>
              </button>
              <button
                onClick={handleCopyImage}
                className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100 text-left"
                disabled={isGenerating}
              >
                <FiCopy className="text-orange-600" />
                <span className="font-medium">Copy Image</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <p className="font-semibold mb-2">Share your profile:</p>
        <ul className="space-y-1 ml-4">
          <li>• Download and post on your social media</li>
          <li>• Attract supporters to your Tipz Stacks profile</li>
          <li>• Show off your rank and achievements</li>
        </ul>
      </div>
    </div>
  );
}

// Helper component for creating proper stat objects
export function createCreatorStats(
  tipsReceived: number,
  cheersReceived: number,
  supporters: number,
  rank: number
): ProfileStats {
  return {
    primary: {
      label: 'Tips Received',
      value: `${tipsReceived} STX`,
      icon: <FiTrendingUp className="text-2xl" />,
    },
    secondary: {
      label: 'Cheers',
      value: cheersReceived.toLocaleString(),
      icon: <FiHeart className="text-2xl" />,
    },
    tertiary: {
      label: 'Supporters',
      value: supporters.toLocaleString(),
      icon: <FiUsers className="text-2xl" />,
    },
    quaternary: {
      label: 'Rank',
      value: `#${rank}`,
      icon: <FiAward className="text-2xl" />,
    },
  };
}

export function createTipperStats(
  tipsGiven: number,
  cheersGiven: number,
  creatorsSupported: number,
  achievements: number
): ProfileStats {
  return {
    primary: {
      label: 'Tips Given',
      value: `${tipsGiven} STX`,
      icon: <FiHeart className="text-2xl" />,
    },
    secondary: {
      label: 'Cheers',
      value: cheersGiven.toLocaleString(),
      icon: <FiTrendingUp className="text-2xl" />,
    },
    tertiary: {
      label: 'Creators',
      value: creatorsSupported.toLocaleString(),
      icon: <FiUsers className="text-2xl" />,
    },
    quaternary: {
      label: 'Achievements',
      value: achievements.toLocaleString(),
      icon: <FiAward className="text-2xl" />,
    },
  };
}
