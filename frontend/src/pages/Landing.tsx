import React from 'react';
import { Link } from 'react-router-dom';
import { Hero, Features, Stats, HowItWorks, CTA } from '../components/landing';
import { Footer, ConnectWallet, BalanceDisplay } from '../components/common';
import { Heading } from '../components/common/Typography';
import { useWallet } from '../hooks/useWallet';
import { useMetaTags } from '../hooks/useMetaTags';

const Landing: React.FC = () => {
  const { isConnected } = useWallet();
  
  // Set landing page meta tags
  useMetaTags({ type: 'landing', autoUpdate: true });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/">
            <Heading level={3} className="text-gradient cursor-pointer">Tipz Stacks</Heading>
          </Link>
          <div className="flex items-center gap-4">
            {isConnected && <BalanceDisplay variant="horizontal" />}
            <ConnectWallet />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative">
        <Hero />
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <Stats />
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-16 sm:py-20 md:py-24 bg-white">
        <Features />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <HowItWorks />
      </section>

      {/* Final CTA Section */}
      <section id="cta" className="relative">
        <CTA />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
