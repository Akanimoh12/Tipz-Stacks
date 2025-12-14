import { useEffect } from 'react';
import { FiX, FiAlertCircle, FiGift } from 'react-icons/fi';
import { GiPartyPopper } from 'react-icons/gi';
import { Button } from '../common/Button';
import { ProfileImage } from '../common/ProfileImage';
import { formatTokenAmount } from '../../services/stacksService';
import { Link } from 'react-router-dom';

interface CheerModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    address: string;
    name: string;
    profileImage?: string;
    totalCheerReceived?: number;
  };
  amount: string;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  error: string | null;
  userBalance: number;
  canClaim?: boolean;
  onClaimClick?: () => void;
}

const SUGGESTED_AMOUNTS = [10, 50, 100, 500, 1000];

const CheerModal: React.FC<CheerModalProps> = ({
  isOpen,
  onClose,
  creator,
  amount,
  onAmountChange,
  onSubmit,
  isProcessing,
  error,
  userBalance,
  canClaim = false,
  onClaimClick,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const isInsufficientBalance = numAmount > userBalance;
  const isValidAmount = numAmount >= 1 && !isInsufficientBalance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 z-10"
          disabled={isProcessing}
        >
          <FiX size={24} />
        </button>

        {/* Header with Orange Accent */}
        <div className="p-6 border-b border-gray-100 bg-linear-to-r from-orange-50 to-white">
          <div className="flex items-center gap-4">
            <ProfileImage
              cid={creator.profileImage}
              alt={creator.name}
              size="large"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{creator.name}</h2>
                <GiPartyPopper className="text-orange-500" size={20} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatTokenAmount(creator.totalCheerReceived || 0)} CHEER received
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Encouragement Text */}
          <div className="text-center p-4 bg-orange-50 border border-orange-100 rounded-lg">
            <p className="text-sm font-medium text-orange-800">
              🎉 Support with free tokens! Claim daily CHEER to spread the love.
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cheer Amount
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0"
                disabled={isProcessing}
                className="w-full px-4 py-4 pr-20 text-2xl font-bold text-gray-900 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-orange-600">
                <GiPartyPopper size={24} />
                <span className="text-lg font-semibold">CHEER</span>
              </div>
            </div>
          </div>

          {/* Suggested Amounts */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Select</p>
            <div className="grid grid-cols-5 gap-2">
              {SUGGESTED_AMOUNTS.map((suggested) => (
                <button
                  key={suggested}
                  onClick={() => onAmountChange(suggested.toString())}
                  disabled={isProcessing}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                    parseFloat(amount) === suggested
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {suggested}
                </button>
              ))}
            </div>
          </div>

          {/* Balance Display */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-sm text-gray-700 font-medium">Your CHEER Balance</span>
            <span className={`text-sm font-bold ${isInsufficientBalance ? 'text-red-600' : 'text-orange-600'}`}>
              {Math.floor(userBalance)} CHEER
            </span>
          </div>

          {/* Low Balance Alert with Claim Button */}
          {userBalance < 10 && (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <FiGift className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Low on CHEER tokens?</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Claim your daily 100 CHEER tokens for free!
                  </p>
                </div>
              </div>
              {canClaim && onClaimClick ? (
                <button
                  onClick={() => {
                    onClose();
                    onClaimClick();
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Claim Daily CHEER
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Go to Dashboard to Claim
                </Link>
              )}
            </div>
          )}

          {/* Transaction Details */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cheer Amount</span>
              <span className="font-semibold text-gray-900">{Math.floor(numAmount)} CHEER</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Transaction Fee</span>
              <span className="font-semibold text-green-600">Free ✨</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-lg font-bold text-orange-600">
                  {Math.floor(numAmount)} CHEER
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <FiAlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Warning for Insufficient Balance */}
          {isInsufficientBalance && !error && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <FiAlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-yellow-800">
                Insufficient CHEER balance. You have {Math.floor(userBalance)} CHEER available.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={!isValidAmount || isProcessing}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <GiPartyPopper size={18} />
                  Send Cheer
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheerModal;
