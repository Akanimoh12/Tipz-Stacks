import React, { useEffect, useState } from 'react';
import { FiX, FiUsers } from 'react-icons/fi';
import { getStoredReferralData } from '../../services/socialShareService';

const ReferralBanner: React.FC = () => {
  const [referralData, setReferralData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const data = getStoredReferralData();
    if (data && data.ref) {
      setReferralData(data);
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || !referralData) {
    return null;
  }

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <FiUsers className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm sm:text-base">
              Welcome! You were referred by {formatAddress(referralData.ref)}
            </p>
            <p className="text-xs sm:text-sm text-white text-opacity-90">
              Support creators and earn rewards together! 🎉
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ReferralBanner;
