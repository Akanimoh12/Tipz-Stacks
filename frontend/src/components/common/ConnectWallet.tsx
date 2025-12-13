import React, { useState } from 'react';
import { FiUser, FiLogOut, FiExternalLink, FiCopy, FiCheck } from 'react-icons/fi';
import { useWallet } from '@hooks/useWallet';
import { Button } from '@components/common/Button';
import { formatAddress, getAddressExplorerUrl } from '@services/stacksService';

export const ConnectWallet: React.FC = () => {
  const { 
    walletAddress, 
    isConnected, 
    isLoading, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewExplorer = () => {
    if (walletAddress) {
      window.open(getAddressExplorerUrl(walletAddress), '_blank');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  };

  if (!isConnected) {
    return (
      <Button
        variant="primary"
        onClick={connectWallet}
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-accent rounded-lg hover:bg-orange-50 transition-colors"
      >
        <FiUser className="text-accent" size={18} />
        <span className="font-medium text-text">
          {formatAddress(walletAddress || '')}
        </span>
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-medium border border-gray-200 py-2 z-20">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-xs text-text-light">Connected Wallet</p>
              <p className="text-sm font-medium text-text truncate">
                {walletAddress}
              </p>
            </div>

            <button
              onClick={handleCopyAddress}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              {copied ? (
                <FiCheck className="text-success" size={16} />
              ) : (
                <FiCopy className="text-text-light" size={16} />
              )}
              <span className="text-sm text-text">
                {copied ? 'Copied!' : 'Copy Address'}
              </span>
            </button>

            <button
              onClick={handleViewExplorer}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <FiExternalLink className="text-text-light" size={16} />
              <span className="text-sm text-text">View on Explorer</span>
            </button>

            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
              >
                <FiLogOut className="text-error" size={16} />
                <span className="text-sm text-error">Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
