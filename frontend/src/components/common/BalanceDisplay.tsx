import React, { memo } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { SiStackbit } from 'react-icons/si';
import { useWallet } from '@hooks/useWallet';
import { formatStxBalance, formatTokenAmount } from '@services/stacksService';

interface BalanceDisplayProps {
  variant?: 'horizontal' | 'vertical';
  showRefresh?: boolean;
  className?: string;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = memo(({
  variant = 'horizontal',
  showRefresh = true,
  className = '',
}) => {
  const { stxBalance, cheerBalance, isLoading, refreshBalances, error } = useWallet();

  const handleRefresh = async () => {
    await refreshBalances();
  };

  if (error) {
    return (
      <div className={`text-error text-sm ${className}`}>
        Failed to load balances
      </div>
    );
  }

  const isVertical = variant === 'vertical';

  return (
    <div
      className={`flex ${
        isVertical ? 'flex-col' : 'flex-row items-center'
      } gap-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <SiStackbit className="text-accent" size={16} />
        </div>
        <div>
          <p className="text-xs text-text-light">STX Balance</p>
          {isLoading ? (
            <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-sm font-semibold text-text">
              {formatStxBalance(stxBalance)} STX
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <span className="text-accent font-bold text-sm">C</span>
        </div>
        <div>
          <p className="text-xs text-text-light">CHEER Balance</p>
          {isLoading ? (
            <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-sm font-semibold text-text">
              {formatTokenAmount(cheerBalance, 0)} CHEER
            </p>
          )}
        </div>
      </div>

      {showRefresh && (
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh balances"
        >
          <FiRefreshCw
            className={`text-text-light ${isLoading ? 'animate-spin' : ''}`}
            size={18}
          />
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if variant or className changed
  // Balance changes are handled by the hook internally
  return (
    prevProps.variant === nextProps.variant &&
    prevProps.showRefresh === nextProps.showRefresh &&
    prevProps.className === nextProps.className
  );
});

BalanceDisplay.displayName = 'BalanceDisplay';

export const BalanceCard: React.FC = () => {
  const { stxBalance, cheerBalance, isLoading } = useWallet();

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Your Balances</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <SiStackbit className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-text-light">STX Balance</p>
              {isLoading ? (
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-xl font-bold text-text">
                  {formatStxBalance(stxBalance)}
                </p>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-text-light">STX</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <p className="text-xs text-text-light">CHEER Balance</p>
              {isLoading ? (
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-xl font-bold text-text">
                  {formatTokenAmount(cheerBalance, 0)}
                </p>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-text-light">CHEER</span>
        </div>
      </div>
    </div>
  );
};

