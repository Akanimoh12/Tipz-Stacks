import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

/**
 * MyProfile Component
 * Redirects to the user's tipper profile page
 * This component acts as a convenience route that automatically
 * navigates to /tipper/{walletAddress}
 */
const MyProfile: React.FC = () => {
  const { walletAddress, isConnected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && walletAddress) {
      // Redirect to user's tipper profile
      navigate(`/tipper/${walletAddress}`, { replace: true });
    } else if (!isConnected) {
      // If not connected, redirect to landing page
      navigate('/', { replace: true });
    }
  }, [walletAddress, isConnected, navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading your profile...</p>
      </div>
    </div>
  );
};

export default MyProfile;
