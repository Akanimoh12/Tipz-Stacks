import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useProfile } from '../hooks/useProfile';
import TipperProfileHeader from '../components/profile/TipperProfileHeader';
import AchievementBadges from '../components/profile/AchievementBadges';
import TippingHistory from '../components/profile/TippingHistory';
import SupportedCreators from '../components/profile/SupportedCreators';
import EditProfileModal from '../components/profile/EditProfileModal';
import ShareProfile from '../components/profile/ShareProfile';

const TipperProfile: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const {
    profileData,
    tippingHistory,
    achievements,
    supportedCreators,
    isLoading,
    error,
    refreshProfile,
  } = useProfile(address);

  const isOwnProfile = walletAddress && address?.toLowerCase() === walletAddress.toLowerCase();

  useEffect(() => {
    if (!address) {
      navigate('/');
    }
  }, [address, navigate]);

  const handleSaveProfile = async (_data: any) => {
    // Profile save implementation:
    // Image upload is handled in EditProfileModal via Pinata service
    // Metadata is constructed with user's preferences
    // Contract update would require a write function (future enhancement)
    // For now, this refreshes the local profile state
    await refreshProfile();
  };

  const handleTipAgain = (creatorAddress: string) => {
    navigate(`/creator/${creatorAddress}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">This tipper profile doesn't exist or hasn't been created yet.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/tipper/${address}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <TipperProfileHeader
            address={profileData.address}
            displayName={profileData.displayName}
            bio={profileData.bio}
            profileImage={profileData.profileImage}
            memberSince={profileData.memberSince}
            totalStxGiven={profileData.totalStxGiven}
            totalCheerGiven={profileData.totalCheerGiven}
            creatorsSupported={profileData.creatorsSupported}
            totalTips={profileData.totalTips}
            rank={profileData.rank}
            rankMovement={profileData.rankMovement}
            streak={profileData.streak}
            isOwnProfile={isOwnProfile || false}
            onEdit={() => setIsEditModalOpen(true)}
            onShare={() => setIsShareModalOpen(true)}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Achievement Badges */}
            <AchievementBadges achievements={achievements} showProgress />

            {/* Tipping History */}
            <TippingHistory transactions={tippingHistory} isLoading={isLoading} />
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-8">
            {/* Share Profile */}
            {!isShareModalOpen && (
              <ShareProfile
                profileUrl={profileUrl}
                displayName={profileData.displayName}
                creatorsSupported={profileData.creatorsSupported}
                totalTips={profileData.totalTips}
                rank={profileData.rank}
                achievements={achievements
                  .filter(a => a.unlocked)
                  .map(a => a.name)
                  .slice(0, 5)}
              />
            )}
          </div>
        </div>

        {/* Supported Creators - Full Width */}
        <div className="mt-8">
          <SupportedCreators
            creators={supportedCreators}
            isLoading={isLoading}
            onTipAgain={handleTipAgain}
          />
        </div>

        {/* Edit Profile Modal */}
        {isOwnProfile && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            currentData={{
              displayName: profileData.displayName,
              bio: profileData.bio,
              profileImage: profileData.profileImage,
            }}
            onSave={handleSaveProfile}
          />
        )}
      </div>
    </div>
  );
};

export default TipperProfile;
