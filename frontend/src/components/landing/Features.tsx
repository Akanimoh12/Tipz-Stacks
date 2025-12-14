import React from 'react';
import { FiDollarSign, FiZap, FiTrendingUp, FiShield } from 'react-icons/fi';
import FeatureCard from './FeatureCard';

const Features: React.FC = () => {
  const features = [
    {
      icon: FiDollarSign,
      title: 'Tip with STX',
      description:
        'Send direct payments to creators using STX tokens, secured by Bitcoin through the Stacks blockchain. Every tip goes straight to the creator—no middlemen, no hidden fees.',
    },
    {
      icon: FiZap,
      title: 'Cheer with CHEER',
      description:
        'Use CHEER tokens to show support without spending money. Claim 100 free CHEER tokens every 24 hours and spread the love to your favorite creators.',
    },
    {
      icon: FiTrendingUp,
      title: 'Fair Leaderboards',
      description:
        'Discover top creators through transparent, blockchain-based rankings. No algorithms, no manipulation—just honest support from real fans driving creator visibility.',
    },
    {
      icon: FiShield,
      title: 'Decentralized Profiles',
      description:
        'Creator profiles are stored on IPFS, ensuring permanent, censorship-resistant content. Your data belongs to you, not to a platform that can change the rules.',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
          Why Creators Choose{' '}
          <span className="text-[#FF6B35]">Tipz</span>
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
          A fair, transparent platform built on Bitcoin-secured blockchain technology.
          Support creators directly and watch them thrive.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={index}
          />
        ))}
      </div>

      {/* Additional Benefits Section */}
      <div className="mt-16 sm:mt-20 md:mt-24">
        <div className="bg-linear-to-br from-gray-50 to-white rounded-3xl p-8 sm:p-12 border border-gray-200">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF6B35]/10 mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Bitcoin Security
              </h3>
              <p className="text-gray-600">
                Built on Stacks, inheriting Bitcoin's unmatched security and decentralization.
              </p>
            </div>

            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF6B35]/10 mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Instant Transactions
              </h3>
              <p className="text-gray-600">
                Fast confirmation times with low fees, making micro-tipping economical.
              </p>
            </div>

            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF6B35]/10 mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Global Access
              </h3>
              <p className="text-gray-600">
                No geographic restrictions. Support creators anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
