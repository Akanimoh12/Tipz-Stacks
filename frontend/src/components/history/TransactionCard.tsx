import { useState } from 'react';
import { FiCheck, FiClock, FiX, FiExternalLink, FiChevronDown, FiChevronUp, FiDollarSign, FiHeart, FiGift, FiUserPlus } from 'react-icons/fi';
import type { Transaction } from '../../hooks/useTransactions';

interface TransactionCardProps {
  transaction: Transaction;
  onClick: () => void;
}

const TransactionCard = ({ transaction, onClick }: TransactionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeConfig = (type: Transaction['type']) => {
    switch (type) {
      case 'tip':
        return {
          icon: <FiDollarSign className="w-5 h-5" />,
          label: 'Tip',
          color: 'orange',
        };
      case 'cheer':
        return {
          icon: <FiHeart className="w-5 h-5" />,
          label: 'Cheer',
          color: 'orange',
        };
      case 'claim':
        return {
          icon: <FiGift className="w-5 h-5" />,
          label: 'Claim',
          color: 'orange',
        };
      case 'registration':
        return {
          icon: <FiUserPlus className="w-5 h-5" />,
          label: 'Registration',
          color: 'orange',
        };
      default:
        return {
          icon: null,
          label: 'Transaction',
          color: 'gray',
        };
    }
  };

  const getStatusConfig = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <FiCheck className="w-4 h-4" />,
          label: 'Confirmed',
          color: 'green',
          borderColor: 'border-l-green-500',
        };
      case 'pending':
        return {
          icon: <FiClock className="w-4 h-4 animate-spin" />,
          label: 'Pending',
          color: 'orange',
          borderColor: 'border-l-orange-500',
        };
      case 'failed':
        return {
          icon: <FiX className="w-4 h-4" />,
          label: 'Failed',
          color: 'red',
          borderColor: 'border-l-red-500',
        };
      default:
        return {
          icon: null,
          label: 'Unknown',
          color: 'gray',
          borderColor: 'border-l-gray-500',
        };
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatAmount = (amount?: number, token?: string) => {
    if (!amount || !token) return null;
    
    if (token === 'STX') {
      return `${(amount / 1000000).toFixed(6)} STX`;
    }
    
    return `${amount} ${token}`;
  };

  const truncateTxId = (txId: string) => {
    return `${txId.slice(0, 6)}...${txId.slice(-6)}`;
  };

  const getExplorerUrl = (txId: string) => {
    const isTestnet = import.meta.env.VITE_STACKS_NETWORK === 'testnet';
    const baseUrl = isTestnet
      ? 'https://explorer.hiro.so/?chain=testnet'
      : 'https://explorer.hiro.so';
    return `${baseUrl}/txid/${txId}`;
  };

  const typeConfig = getTypeConfig(transaction.type);
  const statusConfig = getStatusConfig(transaction.status);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 ${statusConfig.borderColor} overflow-hidden`}
    >
      {/* Main Content */}
      <div className="p-4" onClick={onClick}>
        {/* Top Row: Type Icon + Description */}
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0 w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
            {typeConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {transaction.description}
            </h3>
            {transaction.recipientName && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {transaction.recipientName}
              </p>
            )}
          </div>
        </div>

        {/* Middle Row: Amount + Status */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {transaction.amount && transaction.token && (
              <div className="text-lg font-bold text-gray-900">
                {formatAmount(transaction.amount, transaction.token)}
              </div>
            )}
            {transaction.fee && (
              <div className="text-xs text-gray-500">
                Fee: {transaction.fee.toFixed(6)} STX
              </div>
            )}
          </div>

          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Bottom Row: Date + Explorer Link */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {formatDate(transaction.timestamp)}
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={getExplorerUrl(transaction.txId)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors"
            >
              <code className="text-xs font-mono">{truncateTxId(transaction.txId)}</code>
              <FiExternalLink className="w-3 h-3" />
            </a>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {isExpanded ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {transaction.error && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {transaction.error}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-2">
          <div className="text-xs">
            <span className="font-medium text-gray-700">Type:</span>
            <span className="ml-2 text-gray-900">{typeConfig.label}</span>
          </div>

          {transaction.blockHeight && (
            <div className="text-xs">
              <span className="font-medium text-gray-700">Block Height:</span>
              <span className="ml-2 text-gray-900">{transaction.blockHeight}</span>
            </div>
          )}

          <div className="text-xs">
            <span className="font-medium text-gray-700">Time:</span>
            <span className="ml-2 text-gray-900">
              {new Date(transaction.timestamp * 1000).toLocaleString()}
            </span>
          </div>

          <div className="text-xs">
            <span className="font-medium text-gray-700 block mb-1">Sender:</span>
            <code className="text-gray-900 font-mono text-[10px] break-all bg-white px-2 py-1 rounded border border-gray-200 block">
              {transaction.sender}
            </code>
          </div>

          {transaction.recipient && (
            <div className="text-xs">
              <span className="font-medium text-gray-700 block mb-1">Recipient:</span>
              <code className="text-gray-900 font-mono text-[10px] break-all bg-white px-2 py-1 rounded border border-gray-200 block">
                {transaction.recipient}
              </code>
            </div>
          )}

          {transaction.memo && (
            <div className="text-xs">
              <span className="font-medium text-gray-700">Memo:</span>
              <span className="ml-2 text-gray-900">{transaction.memo}</span>
            </div>
          )}

          <div className="text-xs">
            <span className="font-medium text-gray-700 block mb-1">Transaction ID:</span>
            <code className="text-gray-900 font-mono text-[10px] break-all bg-white px-2 py-1 rounded border border-gray-200 block">
              {transaction.txId}
            </code>
          </div>

          <div className="pt-2">
            <a
              href={getExplorerUrl(transaction.txId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              View on Explorer
              <FiExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
