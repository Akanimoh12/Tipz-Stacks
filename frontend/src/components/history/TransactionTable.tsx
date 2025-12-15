import { useState } from 'react';
import { FiCheck, FiClock, FiX, FiExternalLink, FiChevronDown, FiChevronUp, FiDollarSign, FiHeart, FiGift, FiUserPlus } from 'react-icons/fi';
import type { Transaction } from '../../hooks/useTransactions';

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

const TransactionTable = ({ transactions, onTransactionClick }: TransactionTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (txId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(txId)) {
      newExpanded.delete(txId);
    } else {
      newExpanded.add(txId);
    }
    setExpandedRows(newExpanded);
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'tip':
        return <FiDollarSign className="w-5 h-5 text-orange-500" />;
      case 'cheer':
        return <FiHeart className="w-5 h-5 text-orange-500" />;
      case 'claim':
        return <FiGift className="w-5 h-5 text-orange-500" />;
      case 'registration':
        return <FiUserPlus className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheck className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <FiClock className="w-3 h-3 animate-spin" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiX className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
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
    if (!amount || !token) return '-';
    
    if (token === 'STX') {
      return `${(amount / 1000000).toFixed(6)} STX`;
    }
    
    return `${amount} ${token}`;
  };

  const truncateTxId = (txId: string) => {
    return `${txId.slice(0, 8)}...${txId.slice(-8)}`;
  };

  const getExplorerUrl = (txId: string) => {
    const isTestnet = import.meta.env.VITE_STACKS_NETWORK === 'testnet';
    const baseUrl = isTestnet
      ? 'https://explorer.hiro.so/?chain=testnet'
      : 'https://explorer.hiro.so';
    return `${baseUrl}/txid/${txId}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const isExpanded = expandedRows.has(transaction.txId);
              
              return (
                <>
                  <tr
                    key={transaction.txId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onTransactionClick(transaction)}
                  >
                    {/* Type Icon */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full">
                        {getTypeIcon(transaction.type)}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      {transaction.recipientName && (
                        <div className="text-sm text-gray-500 mt-1">
                          {transaction.recipientName}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatAmount(transaction.amount, transaction.token)}
                      </div>
                      {transaction.fee && (
                        <div className="text-xs text-gray-500">
                          Fee: {transaction.fee.toFixed(6)} STX
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                      {transaction.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {transaction.error}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(transaction.timestamp)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.timestamp * 1000).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-gray-600 font-mono">
                          {truncateTxId(transaction.txId)}
                        </code>
                        <a
                          href={getExplorerUrl(transaction.txId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>

                    {/* Expand Button */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(transaction.txId);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Block Height:</span>
                            <span className="ml-2 text-gray-900">
                              {transaction.blockHeight || 'Pending'}
                            </span>
                          </div>
                          
                          <div>
                            <span className="font-medium text-gray-700">Sender:</span>
                            <span className="ml-2 text-gray-900 font-mono text-xs">
                              {transaction.sender.slice(0, 10)}...{transaction.sender.slice(-10)}
                            </span>
                          </div>

                          {transaction.recipient && (
                            <div>
                              <span className="font-medium text-gray-700">Recipient:</span>
                              <span className="ml-2 text-gray-900 font-mono text-xs">
                                {transaction.recipient.slice(0, 10)}...{transaction.recipient.slice(-10)}
                              </span>
                            </div>
                          )}

                          {transaction.memo && (
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">Memo:</span>
                              <span className="ml-2 text-gray-900">{transaction.memo}</span>
                            </div>
                          )}

                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Full Transaction ID:</span>
                            <div className="mt-1 p-2 bg-white rounded border border-gray-200">
                              <code className="text-xs text-gray-600 font-mono break-all">
                                {transaction.txId}
                              </code>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
