/**
 * TransactionCard Component
 * Generates beautiful 1200x630px cards for sharing tips/cheers
 * Perfect for celebrating support given to creators
 */

import { useRef, useState } from 'react';
import { FiDownload, FiCopy, FiShare2, FiHeart, FiDollarSign, FiZap } from 'react-icons/fi';
import {
  generateAndCacheImage,
  downloadImage,
  copyImageToClipboard,
  generateCacheKey,
} from '../../utils/ogImageGenerator';

interface TransactionCardProps {
  type: 'tip' | 'cheer';
  creatorName: string;
  creatorAddress: string;
  creatorImage?: string;
  amount: number;
  tipperName?: string;
  timestamp?: Date;
  message?: string;
  onExport?: (dataUrl: string) => void;
}

export default function TransactionCard({
  type,
  creatorName,
  creatorAddress,
  creatorImage,
  amount,
  tipperName,
  timestamp = new Date(),
  message,
  onExport,
}: TransactionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleExportAsImage = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const cacheKey = generateCacheKey(
        `transaction_${type}`,
        `${creatorAddress}_${timestamp.getTime()}`
      );

      const dataUrl = await generateAndCacheImage(cardRef.current, cacheKey);

      if (onExport) {
        onExport(dataUrl);
      }

      return dataUrl;
    } catch (error) {
      console.error('Error exporting transaction card:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await handleExportAsImage();
    if (dataUrl) {
      const filename = `tipz-${type}-${creatorName.replace(/\s+/g, '-').toLowerCase()}.png`;
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

  const displayCreatorName = creatorName || `${creatorAddress.slice(0, 10)}...`;
  const displayTipperName = tipperName || 'A supporter';
  const tokenType = type === 'tip' ? 'STX' : 'CHEER';
  const actionVerb = type === 'tip' ? 'tipped' : 'cheered';
  const emoji = type === 'tip' ? '💰' : '🎉';
  const accentColor = type === 'tip' ? 'from-orange-500 to-orange-600' : 'from-purple-500 to-pink-600';

  return (
    <div className="space-y-4">
      {/* Actual OG Image Card */}
      <div
        ref={cardRef}
        className="relative bg-white overflow-hidden"
        style={{
          width: '1200px',
          height: '630px',
          transformOrigin: 'top left',
        }}
      >
        {/* Split Background */}
        <div className="absolute inset-0 flex">
          {/* Left Side - Gradient */}
          <div className={`w-1/2 bg-gradient-to-br ${accentColor}`}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
          </div>
          {/* Right Side - White */}
          <div className="w-1/2 bg-white" />
        </div>

        {/* Content */}
        <div className="relative h-full flex">
          {/* Left Side - Creator Profile */}
          <div className="w-1/2 flex flex-col items-center justify-center p-16 text-white">
            {/* Creator Image */}
            <div className="w-72 h-72 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl mb-8 border-8 border-white/40">
              {creatorImage ? (
                <img
                  src={creatorImage}
                  alt={displayCreatorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">🎨</span>
              )}
            </div>

            {/* Creator Name */}
            <h2 className="text-5xl font-bold text-center mb-4 leading-tight">
              {displayCreatorName}
            </h2>

            {/* Creator Address */}
            <p className="text-2xl text-white/80 font-mono">
              {creatorAddress.slice(0, 8)}...{creatorAddress.slice(-6)}
            </p>
          </div>

          {/* Right Side - Transaction Info */}
          <div className="w-1/2 flex flex-col justify-center p-16">
            {/* Celebration Icon */}
            <div className="text-9xl mb-8">{emoji}</div>

            {/* Action Headline */}
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Just {actionVerb}
              <br />
              <span className="text-orange-600">{displayCreatorName}!</span>
            </h1>

            {/* Amount Display */}
            <div className={`bg-gradient-to-r ${accentColor} text-white p-8 rounded-3xl mb-8 shadow-xl`}>
              <div className="flex items-center gap-4 mb-2">
                {type === 'tip' ? (
                  <FiDollarSign className="text-5xl" />
                ) : (
                  <FiZap className="text-5xl" />
                )}
                <span className="text-3xl font-semibold uppercase tracking-wider">
                  {tokenType}
                </span>
              </div>
              <div className="text-7xl font-bold">{amount.toLocaleString()}</div>
            </div>

            {/* Tipper Info */}
            {tipperName && (
              <div className="flex items-center gap-3 mb-6">
                <FiHeart className="text-3xl text-orange-600" />
                <span className="text-2xl text-gray-700">
                  From <span className="font-bold">{displayTipperName}</span>
                </span>
              </div>
            )}

            {/* Message (if provided) */}
            {message && (
              <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                <p className="text-2xl text-gray-700 italic leading-relaxed">
                  "{message}"
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xl text-gray-500">
              {timestamp.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>

            {/* CTA */}
            <div className="mt-8 inline-flex items-center gap-3 text-orange-600">
              <span className="text-3xl font-bold">Support creators on Tipz Stacks</span>
            </div>
          </div>
        </div>

        {/* Platform Branding - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-xl">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">Tipz Stacks</div>
            <div className="text-lg text-gray-600">Empowering Creators</div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-12 right-12 text-6xl opacity-20 rotate-12">💫</div>
        <div className="absolute bottom-32 right-32 text-4xl opacity-20 -rotate-12">✨</div>
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
            <div className="bg-white w-full h-full relative overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className={`w-1/2 bg-gradient-to-br ${accentColor}`} />
                <div className="w-1/2 bg-white" />
              </div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-9xl mb-8">{emoji}</div>
                  <h1 className="text-5xl font-bold mb-4">
                    Just {actionVerb} {displayCreatorName}!
                  </h1>
                  <div className="text-6xl font-bold text-orange-600">
                    {amount} {tokenType}
                  </div>
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
        <p className="font-semibold mb-2">Share your support:</p>
        <ul className="space-y-1 ml-4">
          <li>• Post on social media to inspire others</li>
          <li>• Help creators gain visibility</li>
          <li>• Show your support for the creator economy</li>
        </ul>
      </div>
    </div>
  );
}
