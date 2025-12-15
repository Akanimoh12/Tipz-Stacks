import React, { useState } from 'react';
import { FiTwitter, FiFacebook, FiLinkedin, FiLink, FiCheck } from 'react-icons/fi';
import type { ShareData } from '../../services/socialShareService';
import {
  generateTwitterShareUrl,
  generateFacebookShareUrl,
  generateLinkedInShareUrl,
  generateShareMessage,
  getHashtagsForType,
  openShareWindow,
  copyToClipboard,
  trackShare,
} from '../../services/socialShareService';

interface ShareButtonsProps {
  shareData: ShareData;
  variant?: 'compact' | 'full';
  className?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ 
  shareData, 
  variant = 'full',
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  const handleTwitterShare = () => {
    const message = generateShareMessage(shareData);
    const hashtags = getHashtagsForType(shareData.type);
    const url = generateTwitterShareUrl(message, shareData.url, hashtags);
    openShareWindow(url);
    trackShare('twitter', shareData.type);
  };

  const handleFacebookShare = () => {
    const url = generateFacebookShareUrl(shareData.url);
    openShareWindow(url);
    trackShare('facebook', shareData.type);
  };

  const handleLinkedInShare = () => {
    const message = generateShareMessage(shareData);
    const url = generateLinkedInShareUrl(shareData.url, 'Tipz Stacks', message);
    openShareWindow(url);
    trackShare('linkedin', shareData.type);
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareData.url);
    if (success) {
      setCopied(true);
      trackShare('copy', shareData.type);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleTwitterShare}
          className="p-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg transition-colors"
          title="Share on X"
        >
          <FiTwitter className="w-5 h-5" />
        </button>
        <button
          onClick={handleFacebookShare}
          className="p-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg transition-colors"
          title="Share on Facebook"
        >
          <FiFacebook className="w-5 h-5" />
        </button>
        <button
          onClick={handleLinkedInShare}
          className="p-2 bg-[#0A66C2] hover:bg-[#095ba8] text-white rounded-lg transition-colors"
          title="Share on LinkedIn"
        >
          <FiLinkedin className="w-5 h-5" />
        </button>
        <button
          onClick={handleCopyLink}
          className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          title="Copy Link"
        >
          {copied ? <FiCheck className="w-5 h-5" /> : <FiLink className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={handleTwitterShare}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg font-medium transition-colors"
      >
        <FiTwitter className="w-5 h-5" />
        <span className="hidden sm:inline">Share on X</span>
        <span className="sm:hidden">X</span>
      </button>
      <button
        onClick={handleFacebookShare}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg font-medium transition-colors"
      >
        <FiFacebook className="w-5 h-5" />
        <span className="hidden sm:inline">Share on Facebook</span>
        <span className="sm:hidden">Facebook</span>
      </button>
      <button
        onClick={handleLinkedInShare}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#0A66C2] hover:bg-[#095ba8] text-white rounded-lg font-medium transition-colors"
      >
        <FiLinkedin className="w-5 h-5" />
        <span className="hidden sm:inline">Share on LinkedIn</span>
        <span className="sm:hidden">LinkedIn</span>
      </button>
      <button
        onClick={handleCopyLink}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
      >
        {copied ? (
          <>
            <FiCheck className="w-5 h-5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <FiLink className="w-5 h-5" />
            <span className="hidden sm:inline">Copy Link</span>
            <span className="sm:hidden">Copy</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ShareButtons;
