import React, { useState, useEffect } from 'react';
import { FiX, FiTwitter, FiFacebook, FiLinkedin, FiLink, FiCheck } from 'react-icons/fi';
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

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareData }) => {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const defaultMessage = generateShareMessage(shareData);
      setMessage(defaultMessage);
      setCharCount(defaultMessage.length);
    }
  }, [isOpen, shareData]);

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  if (!isOpen) return null;

  const handleTwitterShare = () => {
    const hashtags = getHashtagsForType(shareData.type);
    const url = generateTwitterShareUrl(message, shareData.url, hashtags);
    openShareWindow(url);
    trackShare('twitter', shareData.type);
    onClose();
  };

  const handleFacebookShare = () => {
    const url = generateFacebookShareUrl(shareData.url);
    openShareWindow(url);
    trackShare('facebook', shareData.type);
    onClose();
  };

  const handleLinkedInShare = () => {
    const url = generateLinkedInShareUrl(shareData.url, 'Tipz Stacks', message);
    openShareWindow(url);
    trackShare('linkedin', shareData.type);
    onClose();
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareData.url);
    if (success) {
      setCopied(true);
      trackShare('copy', shareData.type);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getActionLabel = () => {
    switch (shareData.type) {
      case 'tip': return 'Tip';
      case 'cheer': return 'Cheer';
      case 'claim': return 'Claim';
      case 'achievement': return 'Achievement';
      case 'registration': return 'Registration';
      case 'leaderboard': return 'Rank';
      default: return 'Activity';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Share Your {getActionLabel()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message Preview/Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={280}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">
                Edit your message before sharing
              </span>
              <span className={`text-sm font-medium ${charCount > 280 ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount}/280
              </span>
            </div>
          </div>

          {/* Preview Card */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Preview</div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 text-sm">{message}</p>
              <a
                href={shareData.url}
                className="text-orange-500 hover:text-orange-600 text-sm mt-2 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {shareData.url}
              </a>
            </div>
          </div>

          {/* Platform Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share on
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Twitter/X */}
              <button
                onClick={handleTwitterShare}
                disabled={charCount > 280}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTwitter className="w-5 h-5" />
                <span>Share on X</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg font-medium transition-colors"
              >
                <FiFacebook className="w-5 h-5" />
                <span>Share on Facebook</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleLinkedInShare}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-[#0A66C2] hover:bg-[#095ba8] text-white rounded-lg font-medium transition-colors"
              >
                <FiLinkedin className="w-5 h-5" />
                <span>Share on LinkedIn</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FiLink className="w-5 h-5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hashtags Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-800">
              <span className="font-medium">Suggested hashtags: </span>
              {getHashtagsForType(shareData.type).map((tag, index) => (
                <span key={tag}>
                  #{tag}
                  {index < getHashtagsForType(shareData.type).length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
