import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { useSidebar } from '../../contexts/SidebarContext';
import { ConnectWallet } from '../common/ConnectWallet';
import { BalanceDisplay } from '../common/BalanceDisplay';
import { useWallet } from '../../hooks/useWallet';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { toggle } = useSidebar();
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            {/* Left: Mobile Menu + Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggle}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open sidebar"
              >
                <FiMenu className="text-2xl text-gray-700" />
              </button>
              
              <div className="lg:hidden">
                <h1 className="text-lg font-bold">
                  Tipz <span className="text-[#FF6B35]">Stacks</span>
                </h1>
              </div>
            </div>

            {/* Right: Balance + Connect Wallet */}
            <div className="flex items-center gap-4">
              {isConnected && (
                <div className="hidden sm:block">
                  <BalanceDisplay variant="horizontal" />
                </div>
              )}
              <ConnectWallet />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
