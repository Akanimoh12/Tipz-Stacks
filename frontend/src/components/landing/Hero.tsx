import React, { useEffect, useState } from 'react';
import { FiArrowRight, FiZap, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../common/Button';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, connectWallet, isLoading } = useWallet();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const handleConnectWallet = async () => {
    await connectWallet();
    // User stays on landing page - no auto-navigation
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#FF6B35]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#FF8C42]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div
            className={`space-y-6 sm:space-y-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/10 rounded-full border border-[#FF6B35]/20">
              <FiZap className="text-[#FF6B35]" />
              <span className="text-sm font-medium text-[#FF6B35]">
                Built on Stacks Blockchain
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Empower Your{' '}
              <span className="text-[#FF6B35] relative inline-block">
                Favorite Creators
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 2 150 2 198 10"
                    stroke="#FF6B35"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
              Tip with STX or Cheer with CHEER tokens. Support creators on the
              Bitcoin-secured Stacks blockchain.
            </p>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl">
              Join a decentralized platform where every tip matters, every cheer
              counts, and transparency is built into the blockchain. No middlemen,
              no hidden fees—just direct support for the creators you love.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!isConnected ? (
                <>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleConnectWallet}
                    loading={isLoading}
                    className="group"
                  >
                    Connect Wallet
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Learn More
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleGoToDashboard}
                    className="group"
                  >
                    Go to Dashboard
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Learn More
                  </Button>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <FiAward className="text-[#FF6B35] text-xl" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Bitcoin Secured</p>
                  <p className="text-xs text-gray-500">Built on Stacks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiZap className="text-[#FF6B35] text-xl" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free Daily CHEER</p>
                  <p className="text-xs text-gray-500">100 tokens/24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative">
              {/* Hero Illustration Placeholder */}
              <div className="relative bg-linear-to-br from-[#FF6B35]/10 to-[#FF8C42]/10 rounded-3xl p-8 sm:p-12 backdrop-blur-sm border border-[#FF6B35]/20">
                {/* Decorative cards */}
                <div className="space-y-6">
                  {/* Card 1 - Creator Profile */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#FF6B35] to-[#FF8C42]"></div>
                      <div>
                        <p className="font-semibold text-gray-900">Jane Artist</p>
                        <p className="text-sm text-gray-500">Digital Creator</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-[#FF6B35]">1,234</p>
                        <p className="text-xs text-gray-500">STX Received</p>
                      </div>
                      <div className="px-4 py-2 bg-[#FF6B35]/10 rounded-lg">
                        <p className="text-sm font-semibold text-[#FF6B35]">#3 Creator</p>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 - Tip Action */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold text-gray-900">Send a Tip</p>
                      <FiZap className="text-[#FF6B35] text-xl" />
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-linear-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg transition-shadow">
                        STX
                      </button>
                      <button className="flex-1 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-xl font-semibold hover:bg-[#FF6B35]/5 transition-colors">
                        CHEER
                      </button>
                    </div>
                  </div>

                  {/* Card 3 - Stats */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">500+</p>
                        <p className="text-sm text-gray-500">Creators</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#FF6B35]">10K+</p>
                        <p className="text-sm text-gray-500">Community</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#FF6B35] rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#FF8C42] rounded-full opacity-20 blur-xl animate-pulse delay-700"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
