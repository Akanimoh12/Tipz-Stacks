import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { FiCheckCircle, FiX, FiExternalLink } from 'react-icons/fi';
import { BsTwitterX, BsFacebook, BsLinkedin } from 'react-icons/bs';
import { BiCoinStack } from 'react-icons/bi';
import { GiPartyPopper } from 'react-icons/gi';
import { Button } from '../common/Button';
import { EXPLORER_URL } from '../../utils/constants';
import { formatTokenAmount } from '../../services/stacksService';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tip' | 'cheer';
  amount: string;
  creatorName: string;
  transactionId: string | null;
  onTipAnother?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  type,
  amount,
  creatorName,
  transactionId,
  onTipAnother,
}) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(true);

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      
      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      // Auto-dismiss modal after 30 seconds
      const dismissTimer = setTimeout(() => {
        onClose();
      }, 30000);

      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTip = type === 'tip';
  const token = isTip ? 'STX' : 'CHEER';
  const Icon = isTip ? BiCoinStack : GiPartyPopper;
  const formattedAmount = isTip ? formatTokenAmount(parseFloat(amount)) : Math.floor(parseFloat(amount));

  // Social share messages
  const shareMessage = `Just ${isTip ? 'tipped' : 'cheered'} ${creatorName} with ${formattedAmount} ${token} on Tipz Stacks! 🎉`;
  const shareUrl = window.location.origin;
  const hashtags = 'TipzStacks,StacksBlockchain,CreatorEconomy';

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleViewTransaction = () => {
    if (transactionId && transactionId !== 'pending') {
      window.open(`${EXPLORER_URL}/txid/${transactionId}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#FF6B35', '#F7931E', '#FDB913', '#FFD700', '#FFA500']}
        />
      )}

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 z-10"
        >
          <FiX size={24} />
        </button>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
                <FiCheckCircle className="text-white" size={48} />
              </div>
              <div className="absolute -top-2 -right-2 animate-spin-slow">
                <Icon className="text-orange-500" size={32} />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              🎉 {isTip ? 'Tip Sent' : 'Cheer Sent'} Successfully!
            </h2>
            <p className="text-lg text-gray-600">
              You supported <span className="font-semibold text-gray-900">{creatorName}</span>
            </p>
          </div>

          {/* Amount Display */}
          <div className="p-6 bg-linear-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
            <div className="flex items-center justify-center gap-3">
              <Icon className="text-orange-600" size={32} />
              <span className="text-4xl font-bold text-orange-600">
                {formattedAmount} {token}
              </span>
            </div>
          </div>

          {/* Transaction Link */}
          {transactionId && transactionId !== 'pending' && (
            <button
              onClick={handleViewTransaction}
              className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 mx-auto transition-colors"
            >
              <span className="font-medium">View Transaction</span>
              <FiExternalLink size={16} />
            </button>
          )}

          {/* Social Share Section */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-4">Share your support!</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleShareTwitter}
                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <BsTwitterX size={18} />
                <span>Share</span>
              </button>
              <button
                onClick={handleShareFacebook}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <BsFacebook size={18} />
                <span>Share</span>
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
              >
                <BsLinkedin size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {onTipAnother && (
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  onTipAnother();
                }}
                className="w-full"
              >
                {isTip ? 'Tip Another Creator' : 'Cheer Another Creator'}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>

          {/* Auto-dismiss Note */}
          <p className="text-xs text-gray-400">
            This message will auto-dismiss in 30 seconds
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;
