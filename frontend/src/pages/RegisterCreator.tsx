import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { isCreatorRegistered } from '../services/contractService';
import CreatorRegistrationForm from '../components/dashboard/CreatorRegistrationForm';
import { useRegistration } from '../hooks/useRegistration';
import { FiArrowLeft } from 'react-icons/fi';

export default function RegisterCreator() {
  const navigate = useNavigate();
  const { walletAddress, isConnected } = useWallet();
  const { isSuccess, reset } = useRegistration();

  // Check if wallet is connected
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  // Check if already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (!walletAddress) return;

      try {
        const registered = await isCreatorRegistered(walletAddress);
        if (registered) {
          navigate('/my-profile');
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    };

    checkRegistration();
  }, [walletAddress, navigate]);

  const handleSuccessClose = () => {
    reset();
    navigate('/my-profile');
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Become a Creator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community of creators and start receiving tips and support from your fans
          </p>
        </div>

        {/* Registration Form */}
        <CreatorRegistrationForm />

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Showcase Your Work</h3>
            <p className="text-gray-600 text-sm">
              Create a beautiful profile to display your portfolio and connect with supporters
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Receive Tips</h3>
            <p className="text-gray-600 text-sm">
              Get support from your community through STX tips and CHEER tokens
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Climb Leaderboards</h3>
            <p className="text-gray-600 text-sm">
              Compete with other creators and gain visibility as you receive more support
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-linear-to-r from-orange-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Join Tipz?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Decentralized & Transparent</h4>
                <p className="text-white/90 text-sm">
                  Built on Stacks blockchain for secure, transparent transactions
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">No Platform Fees</h4>
                <p className="text-white/90 text-sm">
                  Keep 100% of your tips - we only charge minimal gas fees
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">IPFS Storage</h4>
                <p className="text-white/90 text-sm">
                  Your profile is stored on IPFS - permanent and censorship-resistant
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Community Rewards</h4>
                <p className="text-white/90 text-sm">
                  Earn CHEER tokens as you receive tips and support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
            <p className="text-gray-600 mb-6">Welcome to Tipz! Your creator profile is now live.</p>
            <button
              onClick={handleSuccessClose}
              className="w-full bg-linear-to-r from-orange-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              View My Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
