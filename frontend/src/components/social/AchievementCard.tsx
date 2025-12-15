/**
 * AchievementCard Component
 * Generates a beautiful 1200x630px card for sharing achievement unlocks
 * Exportable as PNG image for social media
 */

import { useRef, useState } from 'react';
import { FiDownload, FiCopy, FiShare2, FiAward } from 'react-icons/fi';
import {
  generateAndCacheImage,
  downloadImage,
  copyImageToClipboard,
  generateCacheKey,
} from '../../utils/ogImageGenerator';

interface AchievementCardProps {
  achievementName: string;
  achievementDescription: string;
  achievementIcon?: string;
  userName: string;
  userAddress: string;
  unlockedByPercent?: number;
  category?: string;
  timestamp?: Date;
  onExport?: (dataUrl: string) => void;
}

export default function AchievementCard({
  achievementName,
  achievementDescription,
  achievementIcon = '🏆',
  userName,
  userAddress,
  unlockedByPercent = 5,
  category = 'Achievement',
  timestamp = new Date(),
  onExport,
}: AchievementCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleExportAsImage = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const cacheKey = generateCacheKey(
        'achievement',
        `${userAddress}_${achievementName.replace(/\s+/g, '_')}`
      );

      const dataUrl = await generateAndCacheImage(cardRef.current, cacheKey);

      if (onExport) {
        onExport(dataUrl);
      }

      return dataUrl;
    } catch (error) {
      console.error('Error exporting achievement card:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await handleExportAsImage();
    if (dataUrl) {
      const filename = `tipz-achievement-${achievementName.replace(/\s+/g, '-').toLowerCase()}.png`;
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

  const displayName = userName || `${userAddress.slice(0, 8)}...`;

  return (
    <div className="space-y-4">
      {/* Preview Card (actual OG image) */}
      <div
        ref={cardRef}
        className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white"
        style={{
          width: '1200px',
          height: '630px',
          transformOrigin: 'top left',
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">
          {/* Achievement Icon with Shimmer */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-white rounded-full blur-2xl animate-pulse" />
            <div className="relative text-[180px] leading-none">
              {achievementIcon}
            </div>
          </div>

          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <FiAward className="text-2xl" />
            <span className="text-2xl font-semibold uppercase tracking-wider">
              {category}
            </span>
          </div>

          {/* Achievement Name */}
          <h1 className="text-7xl font-bold mb-6 leading-tight max-w-4xl">
            {achievementName}
          </h1>

          {/* Description */}
          <p className="text-3xl font-medium text-white/90 mb-10 max-w-3xl leading-relaxed">
            {achievementDescription}
          </p>

          {/* User Info */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-2xl mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">{displayName}</div>
              <div className="text-xl text-white/80">
                {timestamp.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Rarity Badge */}
          <div className="text-2xl font-semibold text-white/90">
            Unlocked by only <span className="text-3xl font-bold">{unlockedByPercent}%</span> of users
          </div>

          {/* Platform Branding */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold">Tipz Stacks</div>
                <div className="text-xl text-white/80">Empowering Creators</div>
              </div>
            </div>
          </div>
        </div>

        {/* Confetti Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scaled Preview for Display */}
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
            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white w-full h-full relative">
              {/* Simplified version for preview */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              </div>
              <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">
                <div className="text-[180px] mb-12">{achievementIcon}</div>
                <h1 className="text-7xl font-bold mb-6">{achievementName}</h1>
                <p className="text-3xl mb-10">{achievementDescription}</p>
                <div className="text-2xl">Unlocked by {unlockedByPercent}% of users</div>
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
        <p className="font-semibold mb-2">Share your achievement:</p>
        <ul className="space-y-1 ml-4">
          <li>• Download and share on social media</li>
          <li>• Copy image and paste directly into posts</li>
          <li>• Perfect for Twitter, Facebook, LinkedIn, and Instagram</li>
        </ul>
      </div>
    </div>
  );
}
