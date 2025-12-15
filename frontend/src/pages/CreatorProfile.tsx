import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiGift,
  FiHeart,
  FiShare2,
  FiTwitter,
  FiGithub,
  FiGlobe,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiAward,
  FiExternalLink,
} from 'react-icons/fi';
import { useCreators } from '../hooks/useCreators';
import { useTipping } from '../hooks/useTipping';
import { ProfileImage } from '../components/common/ProfileImage';
import { Button } from '../components/common/Button';
import { Card, CardBody } from '../components/common/Card';
import TipModal from '../components/dashboard/TipModal';
import CheerModal from '../components/dashboard/CheerModal';
import SuccessModal from '../components/dashboard/SuccessModal';
import { useCreatorMetaTags } from '../hooks/useMetaTags';

export const CreatorProfile: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { getCreator } = useCreators();
  const [creator, setCreator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    modalType,
    isModalOpen,
    selectedCreator,
    amount,
    isProcessing,
    error: tippingError,
    showSuccess,
    transactionId,
    openTipModal,
    openCheerModal,
    closeModal,
    closeSuccess,
    updateAmount,
    executeTip,
    executeCheer,
    stxBalance,
    cheerBalance,
  } = useTipping();

  useEffect(() => {
    const fetchCreator = async () => {
      if (!address) return;
      setIsLoading(true);
      const data = await getCreator(address);
      setCreator(data);
      setIsLoading(false);
    };

    fetchCreator();
  }, [address, getCreator]);

  // Update meta tags when creator data loads
  useCreatorMetaTags(
    creator?.name || '',
    creator?.address || address || '',
    {
      tipsReceived: creator?.stats?.totalStxReceived || 0,
      cheersReceived: creator?.stats?.totalCheerReceived || 0,
      supporters: creator?.stats?.supportersCount || 0,
      rank: creator?.rank || 999,
    },
    creator?.metadata?.profileImage
  );

  const handleTip = () => {
    if (!creator) return;
    openTipModal({
      address: creator.address,
      name: creator.name,
      profileImage: creator.metadata?.profileImage,
      totalStxReceived: creator.stats.totalStxReceived,
    });
  };

  const handleCheer = () => {
    if (!creator) return;
    openCheerModal({
      address: creator.address,
      name: creator.name,
      profileImage: creator.metadata?.profileImage,
      totalCheerReceived: creator.stats.totalCheerReceived,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support ${creator?.name} on Tipz`,
          text: `Check out ${creator?.name}'s profile on Tipz!`,
          url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Profile link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B35] border-t-transparent"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardBody className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Creator Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              This creator profile doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/discover')}>
              Back to Discover
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const memberSince = new Date(creator.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/discover')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#FF6B35] mb-6 transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Discover</span>
        </button>

        {/* Hero Section */}
        <Card className="mb-6 overflow-hidden">
          {/* Banner Image */}
          {creator.metadata?.bannerImage && (
            <div className="h-48 bg-linear-to-r from-[#FF6B35] to-[#FF8C42] relative">
              <img
                src={`https://gateway.pinata.cloud/ipfs/${creator.metadata.bannerImage}`}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!creator.metadata?.bannerImage && (
            <div className="h-48 bg-linear-to-r from-[#FF6B35] to-[#FF8C42]" />
          )}

          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center -mt-20 md:-mt-16">
              {/* Profile Image */}
              <div className="relative">
                <ProfileImage
                  cid={creator.metadata?.profileImage}
                  alt={creator.name}
                  size="hero"
                />
                {creator.rank <= 3 && (
                  <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-linear-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center text-white font-bold shadow-lg">
                    #{creator.rank}
                  </div>
                )}
              </div>

              {/* Creator Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {creator.name}
                </h1>
                <p className="text-gray-600 mb-4 max-w-2xl">{creator.bio}</p>

                {/* Social Links */}
                {creator.metadata?.socialLinks && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {creator.metadata.socialLinks.twitter && (
                      <a
                        href={creator.metadata.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <FiTwitter />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    {creator.metadata.socialLinks.github && (
                      <a
                        href={creator.metadata.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <FiGithub />
                        <span className="text-sm">GitHub</span>
                      </a>
                    )}
                    {creator.metadata.socialLinks.website && (
                      <a
                        href={creator.metadata.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <FiGlobe />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Tags */}
                {creator.metadata?.tags && creator.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {creator.metadata.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-orange-50 text-[#FF6B35] text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#FF6B35] mb-1">
                    {creator.stats.totalStxReceived.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">STX Received</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#FF6B35] mb-1">
                    {creator.stats.totalCheerReceived}
                  </div>
                  <div className="text-xs text-gray-500">CHEER Received</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700 flex items-center justify-center gap-1">
                    <FiUsers className="text-lg" />
                    {creator.stats.supporterCount}
                  </div>
                  <div className="text-xs text-gray-500">Supporters</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700 flex items-center justify-center gap-1">
                    <FiAward className="text-lg" />
                    #{creator.rank}
                  </div>
                  <div className="text-xs text-gray-500">Rank</div>
                </CardBody>
              </Card>
            </div>

            {/* Portfolio */}
            {creator.metadata?.portfolio && creator.metadata.portfolio.length > 0 && (
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiTrendingUp />
                    Portfolio
                  </h2>
                  <div className="space-y-3">
                    {creator.metadata.portfolio.map((item: any, index: number) => (
                      <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-[#FF6B35]">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <FiExternalLink className="text-gray-400 group-hover:text-[#FF6B35]" />
                      </a>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Recent Supporters */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUsers />
                  Recent Supporters
                </h2>
                <div className="text-center text-gray-500 py-8">
                  <p>Supporter history coming soon!</p>
                  <p className="text-sm mt-2">
                    This will show recent tips and cheers
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardBody className="p-6 space-y-3">
                <Button
                  onClick={handleTip}
                  className="w-full bg-linear-to-r from-[#FF6B35] to-[#FF8C42] text-white flex items-center justify-center gap-2"
                >
                  <FiGift />
                  Tip with STX
                </Button>
                <Button
                  onClick={handleCheer}
                  variant="secondary"
                  className="w-full border-2 border-[#FF6B35] text-[#FF6B35] flex items-center justify-center gap-2"
                >
                  <FiHeart />
                  Cheer with CHEER
                </Button>
                <Button
                  onClick={handleShare}
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <FiShare2 />
                  Share Profile
                </Button>
              </CardBody>
            </Card>

            {/* Info Card */}
            <Card>
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <FiCalendar className="text-[#FF6B35]" />
                  <div>
                    <div className="text-xs text-gray-500">Member Since</div>
                    <div className="font-medium">{memberSince}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Wallet Address</div>
                  <div className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                    {creator.address}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {modalType === 'tip' && selectedCreator && (
        <TipModal
          isOpen={isModalOpen}
          onClose={closeModal}
          creator={selectedCreator}
          amount={amount}
          onAmountChange={updateAmount}
          onSubmit={executeTip}
          isProcessing={isProcessing}
          error={tippingError}
          userBalance={stxBalance}
        />
      )}

      {/* Cheer Modal */}
      {modalType === 'cheer' && selectedCreator && (
        <CheerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          creator={selectedCreator}
          amount={amount}
          onAmountChange={updateAmount}
          onSubmit={executeCheer}
          isProcessing={isProcessing}
          error={tippingError}
          userBalance={cheerBalance}
        />
      )}

      {/* Success Modal */}
      {showSuccess && selectedCreator && (
        <SuccessModal
          isOpen={showSuccess}
          onClose={closeSuccess}
          type={modalType || 'tip'}
          amount={amount}
          creatorName={selectedCreator.name}
          transactionId={transactionId}
        />
      )}
    </div>
  );
};

export default CreatorProfile;
