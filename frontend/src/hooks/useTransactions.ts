import { useState, useEffect, useCallback, useRef } from 'react';
import { TIPZ_CORE_CONTRACT, CHEER_TOKEN_CONTRACT } from '../utils/constants';

export type TransactionType = 'tip' | 'cheer' | 'claim' | 'registration';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  txId: string;
  type: TransactionType;
  description: string;
  amount?: number;
  token?: 'STX' | 'CHEER';
  status: TransactionStatus;
  timestamp: number;
  blockHeight?: number;
  sender: string;
  recipient?: string;
  recipientName?: string;
  fee?: number;
  memo?: string;
  error?: string;
}

export interface TransactionFilters {
  type?: TransactionType | 'all';
  status?: TransactionStatus | 'all';
  dateRange?: 'week' | 'month' | 'all' | 'custom';
  startDate?: Date;
  endDate?: Date;
  creator?: string;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  confirmedTransactions: Transaction[];
  failedTransactions: Transaction[];
  recentActivity: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (address: string, filters?: TransactionFilters) => Promise<void>;
  fetchTransactionDetails: (txId: string) => Promise<Transaction | null>;
  monitorTransaction: (txId: string, type: TransactionType, description: string, amount?: number, token?: 'STX' | 'CHEER') => void;
  exportTransactions: (format: 'csv' | 'pdf' | 'json', filtered?: Transaction[]) => void;
  filterTransactions: (filters: TransactionFilters) => Transaction[];
  refreshTransactions: () => Promise<void>;
}

// Cache for transaction data
const transactionCache = new Map<string, { data: Transaction[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<string>('');

  // Separate transactions by status
  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
  const confirmedTransactions = transactions.filter(tx => tx.status === 'confirmed');
  const failedTransactions = transactions.filter(tx => tx.status === 'failed');
  const recentActivity = [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

  // Fetch transaction details from Stacks API
  const fetchTransactionDetails = useCallback(async (txId: string): Promise<Transaction | null> => {
    try {
      const isTestnet = import.meta.env.VITE_STACKS_NETWORK === 'testnet';
      const apiUrl = `https://api${isTestnet ? '.testnet' : ''}.hiro.so`;
      
      const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
      
      if (!response.ok) {
        return null;
      }

      const txData = await response.json();
      
      // Parse transaction data
      const transaction: Transaction = {
        id: txId,
        txId: txId,
        type: determineTransactionType(txData),
        description: parseTransactionDescription(txData),
        amount: parseTransactionAmount(txData),
        token: parseTransactionToken(txData),
        status: mapTransactionStatus(txData.tx_status),
        timestamp: txData.burn_block_time || Date.now() / 1000,
        blockHeight: txData.block_height,
        sender: txData.sender_address,
        recipient: parseRecipient(txData),
        fee: txData.fee_rate ? parseInt(txData.fee_rate) / 1000000 : undefined,
        error: txData.tx_status === 'abort_by_response' ? 'Transaction failed' : undefined,
      };

      return transaction;
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      return null;
    }
  }, []);

  // Fetch all transactions for a user
  const fetchTransactions = useCallback(async (address: string, filters?: TransactionFilters) => {
    if (!address) return;

    // Check cache first
    const cacheKey = `${address}-${JSON.stringify(filters || {})}`;
    const cached = transactionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setTransactions(cached.data);
      return;
    }

    setIsLoading(true);
    setError(null);
    lastFetchRef.current = address;

    try {
      const isTestnet = import.meta.env.VITE_STACKS_NETWORK === 'testnet';
      const apiUrl = `https://api${isTestnet ? '.testnet' : ''}.hiro.so`;
      
      // Fetch transactions from Stacks API
      const response = await fetch(
        `${apiUrl}/extended/v1/address/${address}/transactions?limit=50`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      const txList: Transaction[] = [];

      // Process each transaction
      for (const tx of data.results) {
        // Only include contract calls related to our platform
        if (tx.tx_type === 'contract_call') {
          const contractId = `${tx.contract_call.contract_id}`;
          
          if (
            contractId.includes(TIPZ_CORE_CONTRACT.name) ||
            contractId.includes(CHEER_TOKEN_CONTRACT.name)
          ) {
            const transaction: Transaction = {
              id: tx.tx_id,
              txId: tx.tx_id,
              type: determineTransactionType(tx),
              description: parseTransactionDescription(tx),
              amount: parseTransactionAmount(tx),
              token: parseTransactionToken(tx),
              status: mapTransactionStatus(tx.tx_status),
              timestamp: tx.burn_block_time || Date.now() / 1000,
              blockHeight: tx.block_height,
              sender: tx.sender_address,
              recipient: parseRecipient(tx),
              fee: tx.fee_rate ? parseInt(tx.fee_rate) / 1000000 : undefined,
              error: tx.tx_status === 'abort_by_response' ? 'Transaction failed' : undefined,
            };

            txList.push(transaction);
          }
        }
      }

      // Apply filters
      let filtered = txList;
      if (filters) {
        filtered = applyFilters(txList, filters);
      }

      // Sort by timestamp (newest first)
      filtered.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(filtered);
      
      // Update cache
      transactionCache.set(cacheKey, { data: filtered, timestamp: Date.now() });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Monitor a pending transaction
  const monitorTransaction = useCallback((
    txId: string,
    type: TransactionType,
    description: string,
    amount?: number,
    token?: 'STX' | 'CHEER'
  ) => {
    // Add pending transaction immediately
    const pendingTx: Transaction = {
      id: txId,
      txId,
      type,
      description,
      amount,
      token,
      status: 'pending',
      timestamp: Date.now() / 1000,
      sender: '', // Will be filled when confirmed
    };

    setTransactions(prev => [pendingTx, ...prev]);

    // Start monitoring
    const checkStatus = async () => {
      const details = await fetchTransactionDetails(txId);
      
      if (details && details.status !== 'pending') {
        // Update transaction status
        setTransactions(prev =>
          prev.map(tx => (tx.txId === txId ? { ...tx, ...details } : tx))
        );

        // Show browser notification
        if (details.status === 'confirmed' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Transaction Confirmed', {
            body: details.description,
            icon: '/logo.svg',
          });
        }

        // Stop monitoring
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current);
          monitoringIntervalRef.current = null;
        }
      }
    };

    // Poll every 10 seconds
    monitoringIntervalRef.current = setInterval(checkStatus, 10000);
    
    // Initial check
    checkStatus();
  }, [fetchTransactionDetails]);

  // Filter transactions
  const filterTransactions = useCallback((filters: TransactionFilters): Transaction[] => {
    return applyFilters(transactions, filters);
  }, [transactions]);

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    if (lastFetchRef.current) {
      await fetchTransactions(lastFetchRef.current);
    }
  }, [fetchTransactions]);

  // Export transactions
  const exportTransactions = useCallback((
    format: 'csv' | 'pdf' | 'json',
    filtered?: Transaction[]
  ) => {
    const dataToExport = filtered || transactions;

    if (format === 'csv') {
      exportToCSV(dataToExport);
    } else if (format === 'json') {
      exportToJSON(dataToExport);
    } else if (format === 'pdf') {
      exportToPDF(dataToExport);
    }
  }, [transactions]);

  // Cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    transactions,
    pendingTransactions,
    confirmedTransactions,
    failedTransactions,
    recentActivity,
    isLoading,
    error,
    fetchTransactions,
    fetchTransactionDetails,
    monitorTransaction,
    exportTransactions,
    filterTransactions,
    refreshTransactions,
  };
};

// Helper functions

function determineTransactionType(tx: any): TransactionType {
  const functionName = tx.contract_call?.function_name || '';
  
  if (functionName.includes('tip')) return 'tip';
  if (functionName.includes('cheer')) return 'cheer';
  if (functionName.includes('claim')) return 'claim';
  if (functionName.includes('register')) return 'registration';
  
  return 'tip'; // default
}

function parseTransactionDescription(tx: any): string {
  const type = determineTransactionType(tx);
  
  if (type === 'tip') return 'Tipped creator with STX';
  if (type === 'cheer') return 'Cheered creator with CHEER';
  if (type === 'claim') return 'Claimed 100 CHEER tokens';
  if (type === 'registration') return 'Registered as creator';
  
  return 'Platform transaction';
}

function parseTransactionAmount(tx: any): number | undefined {
  try {
    const args = tx.contract_call?.function_args;
    if (!args || args.length === 0) return undefined;

    // Look for amount in function arguments
    const amountArg = args.find((arg: any) => arg.name === 'amount');
    if (amountArg) {
      const value = amountArg.repr.replace('u', '');
      return parseInt(value);
    }

    // For claims, default is 100 CHEER
    if (determineTransactionType(tx) === 'claim') {
      return 100;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function parseTransactionToken(tx: any): 'STX' | 'CHEER' | undefined {
  const type = determineTransactionType(tx);
  
  if (type === 'tip') return 'STX';
  if (type === 'cheer' || type === 'claim') return 'CHEER';
  
  return undefined;
}

function parseRecipient(tx: any): string | undefined {
  try {
    const args = tx.contract_call?.function_args;
    if (!args || args.length === 0) return undefined;

    const recipientArg = args.find((arg: any) => arg.name === 'creator' || arg.name === 'recipient');
    if (recipientArg) {
      return recipientArg.repr.replace(/'/g, '');
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function mapTransactionStatus(status: string): TransactionStatus {
  if (status === 'success') return 'confirmed';
  if (status === 'pending') return 'pending';
  return 'failed';
}

function applyFilters(txs: Transaction[], filters: TransactionFilters): Transaction[] {
  let filtered = [...txs];

  // Type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(tx => tx.type === filters.type);
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(tx => tx.status === filters.status);
  }

  // Date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = Date.now() / 1000;
    let cutoff = 0;

    if (filters.dateRange === 'week') {
      cutoff = now - 7 * 24 * 60 * 60;
    } else if (filters.dateRange === 'month') {
      cutoff = now - 30 * 24 * 60 * 60;
    }

    if (cutoff > 0) {
      filtered = filtered.filter(tx => tx.timestamp >= cutoff);
    }
  }

  // Custom date range
  if (filters.startDate) {
    const start = filters.startDate.getTime() / 1000;
    filtered = filtered.filter(tx => tx.timestamp >= start);
  }

  if (filters.endDate) {
    const end = filters.endDate.getTime() / 1000;
    filtered = filtered.filter(tx => tx.timestamp <= end);
  }

  // Creator filter
  if (filters.creator) {
    filtered = filtered.filter(tx => tx.recipient === filters.creator);
  }

  return filtered;
}

function exportToCSV(transactions: Transaction[]) {
  const headers = ['Type', 'Description', 'Amount', 'Token', 'Status', 'Date', 'Transaction ID'];
  const rows = transactions.map(tx => [
    tx.type,
    tx.description,
    tx.amount || '',
    tx.token || '',
    tx.status,
    new Date(tx.timestamp * 1000).toLocaleString(),
    tx.txId,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tipz-transactions-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportToJSON(transactions: Transaction[]) {
  const jsonContent = JSON.stringify(transactions, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tipz-transactions-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(transactions: Transaction[]) {
  // For PDF, we'll create a simple HTML that can be printed
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tipz Stacks - Transaction History</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #FF6B35; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #FF6B35; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-confirmed { color: green; }
        .status-pending { color: orange; }
        .status-failed { color: red; }
      </style>
    </head>
    <body>
      <h1>Tipz Stacks - Transaction History</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Transaction ID</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(tx => `
            <tr>
              <td>${tx.type}</td>
              <td>${tx.description}</td>
              <td>${tx.amount || ''} ${tx.token || ''}</td>
              <td class="status-${tx.status}">${tx.status}</td>
              <td>${new Date(tx.timestamp * 1000).toLocaleString()}</td>
              <td style="font-size: 10px;">${tx.txId.slice(0, 16)}...</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  
  if (newWindow) {
    newWindow.onload = () => {
      setTimeout(() => {
        newWindow.print();
      }, 500);
    };
  }
  
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
