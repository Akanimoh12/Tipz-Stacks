import { FiX, FiExternalLink, FiCheck, FiClock, FiAlertCircle, FiDollarSign, FiHeart, FiGift, FiUserPlus, FiCopy, FiShare2 } from 'react-icons/fi';
import type { Transaction } from '../../hooks/useTransactions';
import { useState } from 'react';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailsModal = ({ transaction, isOpen, onClose }: TransactionDetailsModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getTypeConfig = (type: Transaction['type']) => {
    switch (type) {
      case 'tip':
        return {
          icon: <FiDollarSign className="w-8 h-8" />,
          label: 'STX Tip',
          color: 'orange',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-600',
        };
      case 'cheer':
        return {
          icon: <FiHeart className="w-8 h-8" />,
          label: 'CHEER Token',
          color: 'orange',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-600',
        };
      case 'claim':
        return {
          icon: <FiGift className="w-8 h-8" />,
          label: 'Daily Claim',
          color: 'orange',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-600',
        };
      case 'registration':
        return {
          icon: <FiUserPlus className="w-8 h-8" />,
          label: 'Creator Registration',
          color: 'orange',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-600',
        };
      default:
        return {
          icon: null,
          label: 'Transaction',
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
        };
    }
  };

  const getStatusConfig = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <FiCheck className="w-6 h-6" />,
          label: 'Confirmed',
          bgColor: 'bg-green-500',
          textColor: 'text-green-500',
        };
      case 'pending':
        return {
          icon: <FiClock className="w-6 h-6 animate-spin" />,
          label: 'Pending',
          bgColor: 'bg-orange-500',
          textColor: 'text-orange-500',
        };
      case 'failed':
        return {
          icon: <FiAlertCircle className="w-6 h-6" />,
          label: 'Failed',
          bgColor: 'bg-red-500',
          textColor: 'text-red-500',
        };
      default:
        return {
          icon: null,
          label: 'Unknown',
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-500',
        };
    }
  };

  const formatAmount = (amount?: number, token?: string) => {
    if (!amount || !token) return null;
    
    if (token === 'STX') {
      return `${(amount / 1000000).toFixed(6)} STX`;
    }
    
    return `${amount} ${token}`;
  };

  const getExplorerUrl = (txId: string) => {
    const isTestnet = import.meta.env.VITE_STACKS_NETWORK === 'testnet';
    const baseUrl = isTestnet
      ? 'https://explorer.hiro.so/?chain=testnet'
      : 'https://explorer.hiro.so';
    return `${baseUrl}/txid/${txId}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTransaction = () => {
    const url = getExplorerUrl(transaction.txId);
    const text = `Check out my ${transaction.description} on Tipz Stacks!\n${url}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Tipz Stacks Transaction',
        text,
        url,
      });
    } else {
      copyToClipboard(url);
    }
  };

  const typeConfig = getTypeConfig(transaction.type);
  const statusConfig = getStatusConfig(transaction.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />

        {/* Modal panel */}
        <div
          className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Status Color */}
          <div className={`${statusConfig.bgColor} px-6 py-8 text-white relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className={`${typeConfig.bgColor} ${typeConfig.textColor} p-4 rounded-full`}>
                {typeConfig.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{typeConfig.label}</h2>
                <p className="text-white/90 mt-1">{statusConfig.label}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {transaction.description}
              </h3>
              {transaction.recipientName && (
                <p className="text-gray-600">{transaction.recipientName}</p>
              )}
            </div>

            {/* Amount Breakdown */}
            {transaction.amount && transaction.token && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatAmount(transaction.amount, transaction.token)}
                  </span>
                </div>
                {transaction.fee && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Transaction Fee</span>
                    <span className="text-gray-900">{transaction.fee.toFixed(6)} STX</span>
                  </div>
                )}
              </div>
            )}

            {/* Transaction Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Transaction Details</h4>

              {transaction.blockHeight && (
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Block Height</span>
                  <span className="text-sm font-medium text-gray-900">{transaction.blockHeight}</span>
                </div>
              )}

              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Timestamp</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(transaction.timestamp * 1000).toLocaleString()}
                </span>
              </div>

              <div className="py-2 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Sender Address</span>
                  <button
                    onClick={() => copyToClipboard(transaction.sender)}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
                <code className="text-xs font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded break-all block">
                  {transaction.sender}
                </code>
              </div>

              {transaction.recipient && (
                <div className="py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Recipient Address</span>
                    <button
                      onClick={() => copyToClipboard(transaction.recipient!)}
                      className="text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                  <code className="text-xs font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded break-all block">
                    {transaction.recipient}
                  </code>
                </div>
              )}

              {transaction.memo && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 block mb-2">Memo</span>
                  <p className="text-sm text-gray-900">{transaction.memo}</p>
                </div>
              )}

              <div className="py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Transaction ID</span>
                  <button
                    onClick={() => copyToClipboard(transaction.txId)}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
                <code className="text-xs font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded break-all block">
                  {transaction.txId}
                </code>
              </div>
            </div>

            {/* Error Message */}
            {transaction.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Transaction Failed</h4>
                    <p className="text-sm text-red-800">{transaction.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Copy Confirmation */}
            {copied && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-800 font-medium">✓ Copied to clipboard!</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            <a
              href={getExplorerUrl(transaction.txId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <FiExternalLink className="w-4 h-4" />
              View on Explorer
            </a>

            <button
              onClick={shareTransaction}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors font-medium"
            >
              <FiShare2 className="w-4 h-4" />
              Share Transaction
            </button>

            {transaction.type === 'tip' && transaction.recipient && transaction.status === 'confirmed' && (
              <button
                onClick={() => {
                  // Navigate to creator profile or open tip modal
                  window.location.href = `/creator/${transaction.recipient}`;
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-medium"
              >
                <FiDollarSign className="w-4 h-4" />
                Tip Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
