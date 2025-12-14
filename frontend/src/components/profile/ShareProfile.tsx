import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { FaXTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa6';

interface ShareProfileProps {
  profileUrl: string;
  displayName?: string;
  creatorsSupported: number;
  totalTips: number;
  rank?: number;
  achievements?: string[];
}

const ShareProfile: React.FC<ShareProfileProps> = ({
  profileUrl,
  displayName,
  creatorsSupported,
  totalTips,
  rank,
  achievements = [],
}) => {
  const [copied, setCopied] = useState(false);

  const shareMessage = `Check out my profile on @TipzStacks! I've supported ${creatorsSupported} ${creatorsSupported === 1 ? 'creator' : 'creators'} with ${totalTips} ${totalTips === 1 ? 'tip' : 'tips'}.${rank && rank <= 50 ? ` Ranked #${rank} on the leaderboard! 🏆` : ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Profile</h2>
      
      {/* Preview Card */}
      <div className="bg-linear-to-br from-orange-50 to-white border-2 border-orange-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl shrink-0">
            👤
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {displayName || 'Tipz Supporter'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {shareMessage}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{creatorsSupported}</div>
            <div className="text-xs text-gray-600">Creators</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{totalTips}</div>
            <div className="text-xs text-gray-600">Tips</div>
          </div>
          {rank && rank <= 50 && (
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-500">#{rank}</div>
              <div className="text-xs text-gray-600">Rank</div>
            </div>
          )}
        </div>

        {/* Achievement Badges */}
        {achievements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Achievements:</span>
              {achievements.slice(0, 3).map((achievement, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                >
                  {achievement}
                </span>
              ))}
              {achievements.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{achievements.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Copy Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={profileUrl}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm font-mono"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {copied ? (
              <>
                <FiCheck />
                Copied!
              </>
            ) : (
              <>
                <FiCopy />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Share on Social Media
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* Twitter/X */}
          <button
            onClick={handleShareTwitter}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            <FaXTwitter className="text-xl" />
            <span className="hidden sm:inline">X</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleShareFacebook}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <FaFacebook className="text-xl" />
            <span className="hidden sm:inline">Facebook</span>
          </button>

          {/* LinkedIn */}
          <button
            onClick={handleShareLinkedIn}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition font-medium"
          >
            <FaLinkedin className="text-xl" />
            <span className="hidden sm:inline">LinkedIn</span>
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Share your profile to inspire others to support creators on Tipz Stacks!
        </p>
      </div>
    </div>
  );
};

export default ShareProfile;
