import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiSearch, FiAward, FiUser, FiGift, FiX, FiList, FiTrendingUp } from 'react-icons/fi';
import { useWallet } from '../../hooks/useWallet';
import { useSidebar } from '../../contexts/SidebarContext';
import { BalanceDisplay } from '../common/BalanceDisplay';

const Sidebar: React.FC = () => {
  const { walletAddress, isConnected } = useWallet();
  const { isOpen, close } = useSidebar();

  const navigationItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiSearch, label: 'Discover Creators', path: '/discover' },
    { icon: FiAward, label: 'Leaderboards', path: '/leaderboards' },
    { icon: FiUser, label: 'My Profile', path: '/my-profile' },
    { icon: FiList, label: 'Transactions', path: '/transactions' },
    { icon: FiTrendingUp, label: 'Achievements', path: '/achievements' },
    { icon: FiGift, label: 'Claim CHEER', path: '/claim' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">
              Tipz <span className="text-[#FF6B35]">Stacks</span>
            </h2>
            <button
              onClick={close}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            {isConnected ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center">
                    <FiUser className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
                    <p className="text-sm font-mono font-medium text-gray-900 truncate">
                      {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                    </p>
                  </div>
                </div>
                
                {/* Quick Balance Display */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <BalanceDisplay variant="vertical" className="text-sm" />
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiUser className="text-gray-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 mb-3">Connect your wallet to start tipping creators</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={close}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-[#FF6B35] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="text-xl shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <p>Built on <span className="text-[#FF6B35] font-semibold">Stacks</span></p>
              <p className="mt-1">Secured by Bitcoin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
