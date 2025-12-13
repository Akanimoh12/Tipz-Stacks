import React, { memo } from 'react';
import { FiGift, FiAlertCircle } from 'react-icons/fi';
import { useClaim } from '../../hooks/useClaim';
import { useWallet } from '../../hooks/useWallet';
import { Card, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import ClaimCountdown from './ClaimCountdown';
import SuccessAnimation from '../common/SuccessAnimation';

const ClaimWidget: React.FC = memo(() => {
  const { isConnected, connectWallet } = useWallet();
  const {
    canClaim,
    blocksUntilClaim,
    timeUntilClaim,
    isClaiming,
    isLoading,
    totalClaimed,
    error,
    claimSuccess,
    claimTxId,
    handleClaim,
    clearError,
    clearSuccess,
  } = useClaim();

  // Show loading state
  if (isLoading && isConnected) {
    return (
      <Card className="bg-gradient-to-r from-[#FF6B35]/5 to-[#FF8C42]/5 border-2 border-[#FF6B35]/20">
        <CardBody className="py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35] mb-3"></div>
            <p className="text-gray-600">Loading claim status...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Show connect wallet prompt if not connected
  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-r from-[#FF6B35]/5 to-[#FF8C42]/5 border-2 border-[#FF6B35]/20">
        <CardBody>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] rounded-2xl flex items-center justify-center">
              <FiGift className="text-white text-3xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Daily CHEER Tokens
              </h3>
              <p className="text-gray-600 mb-4">
                Connect your wallet to claim 100 free CHEER tokens every 24 hours!
              </p>
              <Button onClick={connectWallet} className="w-full sm:w-auto">
                Connect Wallet to Claim
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      {/* Success Animation Modal */}
      {claimSuccess && (
        <SuccessAnimation
          amount={100}
          txId={claimTxId}
          onDismiss={clearSuccess}
          autoDismiss={true}
          dismissDelay={5000}
        />
      )}

      {/* Main Claim Widget */}
      <Card className="bg-gradient-to-r from-[#FF6B35]/5 to-[#FF8C42]/5 border-2 border-[#FF6B35]/20 hover:shadow-xl transition-shadow">
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Icon Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] rounded-2xl flex items-center justify-center shadow-lg">
                  <FiGift className="text-white text-4xl" />
                </div>
                {canClaim && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse" />
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 w-full">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                  Daily CHEER Tokens
                  {canClaim && (
                    <span className="text-sm font-normal px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Available
                    </span>
                  )}
                </h3>
                <p className="text-gray-600">
                  Claim 100 free CHEER every 24 hours to tip creators
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={clearError}
                      className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Claim Button or Countdown */}
              {canClaim ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                  >
                    {isClaiming ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">🎁 Claim 100 CHEER Now!</span>
                        <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform"></div>
                      </>
                    )}
                  </Button>
                  {totalClaimed > 0 && (
                    <p className="text-sm text-gray-500 text-center">
                      You've claimed {totalClaimed.toLocaleString()} CHEER total
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/50 rounded-xl p-6">
                    <p className="text-sm text-gray-600 mb-4 text-center font-medium">
                      Next claim available in:
                    </p>
                    <ClaimCountdown
                      timeRemaining={timeUntilClaim}
                      blocksRemaining={blocksUntilClaim}
                    />
                  </div>
                  {totalClaimed > 0 && (
                    <div className="bg-white/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">
                        Total claimed:{' '}
                        <span className="font-bold text-[#FF6B35]">
                          {totalClaimed.toLocaleString()} CHEER
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Keep up your daily streak! 🔥
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats Section (Right side on desktop) */}
            {totalClaimed > 0 && (
              <div className="flex-shrink-0 w-full md:w-auto">
                <div className="bg-white/50 rounded-xl p-4 text-center md:min-w-[140px]">
                  <div className="text-3xl font-bold text-[#FF6B35] mb-1">
                    {Math.floor(totalClaimed / 100)}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">
                    Claims Made
                  </div>
                  {Math.floor(totalClaimed / 100) >= 7 && (
                    <div className="mt-2">
                      <span className="text-2xl">🔥</span>
                      <p className="text-xs text-orange-600 font-semibold mt-1">
                        {Math.floor(totalClaimed / 100)} Day Streak!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Use CHEER tokens to support your favorite creators without spending STX!
              The claim cooldown is 144 blocks (approximately 24 hours).
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
});

ClaimWidget.displayName = 'ClaimWidget';

export default ClaimWidget;
