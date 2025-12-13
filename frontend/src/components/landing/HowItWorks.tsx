import React from 'react';
import { FiLogIn, FiGift, FiSearch, FiHeart, FiTrendingUp } from 'react-icons/fi';
import StepCard from './StepCard';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: 'Connect Wallet',
      description: 'Connect your Hiro, Leather, or Xverse wallet in seconds. No signup required, just your Stacks wallet.',
      icon: FiLogIn,
    },
    {
      title: 'Claim CHEER',
      description: 'Get 100 free CHEER tokens every 24 hours—no cost, just claim. Support creators without spending money.',
      icon: FiGift,
    },
    {
      title: 'Discover Creators',
      description: 'Browse profiles, portfolios, and leaderboards. Find creators you love and want to support.',
      icon: FiSearch,
    },
    {
      title: 'Tip or Cheer',
      description: 'Support with STX (direct value) or CHEER (free engagement). Every contribution matters.',
      icon: FiHeart,
    },
    {
      title: 'Track Impact',
      description: 'Watch creators rise on transparent, blockchain-based leaderboards. See your support make a difference.',
      icon: FiTrendingUp,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
          Get Started in{' '}
          <span className="text-[#FF6B35]">Minutes</span>
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
          Join thousands of creators and supporters on the decentralized platform.
          It's simple, transparent, and built on Bitcoin-secured blockchain.
        </p>
      </div>

      {/* Steps Timeline - Desktop Horizontal */}
      <div className="hidden lg:block relative mb-20">
        {/* Connecting Line */}
        <div className="absolute top-10 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B35]/20 via-[#FF6B35]/40 to-[#FF6B35]/20"></div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-5 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="group">
              <StepCard
                stepNumber={index + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
                delay={index}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Steps Timeline - Mobile/Tablet Vertical */}
      <div className="lg:hidden space-y-12">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <StepCard
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
              delay={index}
            />
            
            {/* Connecting Line (Vertical) */}
            {index < steps.length - 1 && (
              <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-[#FF6B35]/40 to-[#FF6B35]/20"></div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Context */}
      <div className="mt-16 sm:mt-20 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35]/10 rounded-full border border-[#FF6B35]/20">
          <span className="text-[#FF6B35] text-2xl">⚡</span>
          <p className="text-sm sm:text-base text-gray-700 font-medium">
            Average setup time: <span className="text-[#FF6B35] font-bold">Less than 2 minutes</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
