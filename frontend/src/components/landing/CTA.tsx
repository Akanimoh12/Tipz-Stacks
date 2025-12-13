import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../common/Button';

const CTA: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, connectWallet, isLoading } = useWallet();

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const handleBecomeCreator = () => {
    if (isConnected) {
      navigate('/register-creator');
    } else {
      connectWallet();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Orange Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42]"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - CTA Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Start Supporting Creators Today
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Join the fair, transparent creator economy on the Stacks blockchain.
              Every tip matters, every cheer counts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!isConnected ? (
                <>
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={handleConnectWallet}
                    loading={isLoading}
                    className="bg-white text-[#FF6B35] hover:bg-gray-100 border-none shadow-xl group"
                  >
                    Connect Wallet
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <button
                    onClick={handleBecomeCreator}
                    className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Become a Creator
                  </button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    className="bg-white text-[#FF6B35] hover:bg-gray-100 border-none shadow-xl group"
                  >
                    Go to Dashboard
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <button
                    onClick={handleBecomeCreator}
                    className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Become a Creator
                  </button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-10 sm:mt-12 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-2xl">🔒</span>
                <span className="text-sm font-medium">Bitcoin Secured</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-2xl">⚡</span>
                <span className="text-sm font-medium">Instant Transactions</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-2xl">🌍</span>
                <span className="text-sm font-medium">Global Platform</span>
              </div>
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="lg:block">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
                Platform Impact
              </h3>
              
              {/* Mini Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    12.5K+
                  </div>
                  <div className="text-sm text-white/80">STX Tipped</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    523+
                  </div>
                  <div className="text-sm text-white/80">Active Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    2.5M+
                  </div>
                  <div className="text-sm text-white/80">CHEER Claimed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    10.2K+
                  </div>
                  <div className="text-sm text-white/80">Community</div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-center text-white/90 text-sm">
                  <span className="font-semibold">Join thousands</span> of creators and supporters
                  building the future of the creator economy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
