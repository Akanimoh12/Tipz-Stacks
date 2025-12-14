import { useEffect } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import { BiCoinStack } from 'react-icons/bi';
import { Button } from '../common/Button';
import { ProfileImage } from '../common/ProfileImage';
import { formatTokenAmount } from '../../services/stacksService';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    address: string;
    name: string;
    profileImage?: string;
    totalStxReceived?: number;
  };
  amount: string;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  error: string | null;
  userBalance: number;
}

const SUGGESTED_AMOUNTS = [1, 5, 10, 25, 50];
const TX_FEE_ESTIMATE = 0.001; // STX

const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  creator,
  amount,
  onAmountChange,
  onSubmit,
  isProcessing,
  error,
  userBalance,
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
  const totalWithFee = numAmount + TX_FEE_ESTIMATE;
  const isInsufficientBalance = totalWithFee > userBalance;
  const isValidAmount = numAmount >= 0.001 && !isInsufficientBalance;

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
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          disabled={isProcessing}
        >
          <FiX size={24} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <ProfileImage
              cid={creator.profileImage}
              alt={creator.name}
              size="large"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{creator.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {formatTokenAmount(creator.totalStxReceived || 0)} STX received
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip Amount
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0.00"
                disabled={isProcessing}
                className="w-full px-4 py-4 pr-16 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
                <BiCoinStack size={24} />
                <span className="text-lg font-semibold">STX</span>
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
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {suggested}
                </button>
              ))}
            </div>
          </div>

          {/* Balance Display */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Your Balance</span>
            <span className={`text-sm font-semibold ${isInsufficientBalance ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTokenAmount(userBalance)} STX
            </span>
          </div>

          {/* Transaction Details */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tip Amount</span>
              <span className="font-semibold text-gray-900">{formatTokenAmount(numAmount)} STX</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Transaction Fee</span>
              <span className="font-semibold text-gray-900">~{TX_FEE_ESTIMATE} STX</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatTokenAmount(totalWithFee)} STX
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
                Insufficient balance. You need {formatTokenAmount(totalWithFee)} STX (including fee).
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
              className="flex-1"
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
                'Send Tip'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipModal;
