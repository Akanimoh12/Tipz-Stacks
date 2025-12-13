import React, { useEffect, useState } from 'react';
import { FiCheck, FiExternalLink } from 'react-icons/fi';
import { getExplorerUrl } from '../../services/stacksService';

interface SuccessAnimationProps {
  amount: number;
  txId: string | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  amount,
  txId,
  onDismiss,
  autoDismiss = true,
  dismissDelay = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after delay
    if (autoDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 500);
  };

  // Confetti particles
  const confettiColors = [
    'bg-[#FF6B35]',
    'bg-[#FF8C42]',
    'bg-yellow-400',
    'bg-orange-300',
    'bg-red-400',
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible && !isExiting
          ? 'opacity-100 backdrop-blur-sm bg-black/20'
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleDismiss}
    >
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 ${
              confettiColors[i % confettiColors.length]
            } rounded-full animate-confetti`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Success Card */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all duration-500 ${
          isVisible && !isExiting
            ? 'scale-100 translate-y-0'
            : 'scale-75 translate-y-10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce-in">
              <FiCheck className="text-white text-4xl" strokeWidth={3} />
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full animate-ping opacity-20" />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🎉 Success!
        </h2>
        <p className="text-xl text-gray-600 mb-1">You claimed</p>
        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] mb-4">
          {amount} CHEER
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Your tokens will be available shortly
        </p>

        {/* Transaction Link */}
        {txId && (
          <a
            href={getExplorerUrl(txId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
          >
            <span>View Transaction</span>
            <FiExternalLink className="text-sm" />
          </a>
        )}

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="mt-6 w-full py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Continue
        </button>

        {/* Auto-dismiss indicator */}
        {autoDismiss && (
          <p className="text-xs text-gray-400 mt-3">
            Closes automatically in {dismissDelay / 1000}s
          </p>
        )}
      </div>

      {/* Confetti Animation Styles */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

export default SuccessAnimation;
