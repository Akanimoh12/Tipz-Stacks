import React from 'react';
import { Link } from 'react-router-dom';
import { FiTwitter, FiGithub, FiMessageCircle } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const navigation = {
    platform: [
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Features', href: '#features' },
      { name: 'Leaderboard', href: '/leaderboard' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
    creators: [
      { name: 'Become a Creator', href: '/register-creator' },
      { name: 'Creator Guide', href: '/guide' },
      { name: 'Success Stories', href: '/stories' },
      { name: 'FAQ', href: '/faq' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Community Guidelines', href: '/guidelines' },
      { name: 'Contact', href: '/contact' },
    ],
  };

  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/tipzstacks',
      icon: FiTwitter,
      hoverColor: 'hover:text-[#1DA1F2]',
    },
    {
      name: 'Discord',
      href: 'https://discord.gg/tipzstacks',
      icon: FiMessageCircle,
      hoverColor: 'hover:text-[#5865F2]',
    },
    {
      name: 'GitHub',
      href: 'https://github.com/tipzstacks',
      icon: FiGithub,
      hoverColor: 'hover:text-gray-900',
    },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              Tipz <span className="text-[#FF6B35]">Stacks</span>
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              Empowering creators on the Stacks blockchain. A fair, transparent
              platform where every tip matters and every supporter is valued.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center transition-all duration-300 hover:bg-gray-700 ${social.hoverColor}`}
                  aria-label={social.name}
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {navigation.platform.map((item) => (
                <li key={item.name}>
                  {item.href.startsWith('#') ? (
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="text-gray-400 hover:text-[#FF6B35] transition-colors duration-200"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-400 hover:text-[#FF6B35] transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Creators Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Creators</h4>
            <ul className="space-y-3">
              {navigation.creators.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-[#FF6B35] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-[#FF6B35] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-500">
              © {currentYear} Tipz Stacks. All rights reserved.
            </p>

            {/* Built on Stacks Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Built on</span>
              <span className="text-[#FF6B35] font-semibold">Stacks</span>
              <span>•</span>
              <span>Secured by</span>
              <span className="text-[#F7931A] font-semibold">Bitcoin</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
