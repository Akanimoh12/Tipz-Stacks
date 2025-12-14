import { useState, useCallback } from 'react';
import { sendTipWithStx, sendCheerWithToken } from '../services/contractService';
import { useWallet } from './useWallet';

export type ModalType = 'tip' | 'cheer' | null;

export interface Creator {
  address: string;
  name: string;
  profileImage?: string;
  totalStxReceived?: number;
  totalCheerReceived?: number;
}

export interface TippingState {
  modalType: ModalType;
  isModalOpen: boolean;
  selectedCreator: Creator | null;
  amount: string;
  isProcessing: boolean;
  transactionId: string | null;
  error: string | null;
  showSuccess: boolean;
}

export const useTipping = () => {
  const { walletAddress, stxBalance, cheerBalance } = useWallet();
  
  const [state, setState] = useState<TippingState>({
    modalType: null,
    isModalOpen: false,
    selectedCreator: null,
    amount: '',
    isProcessing: false,
    transactionId: null,
    error: null,
    showSuccess: false,
  });

  const openTipModal = useCallback((creator: Creator) => {
    setState({
      modalType: 'tip',
      isModalOpen: true,
      selectedCreator: creator,
      amount: '',
      isProcessing: false,
      transactionId: null,
      error: null,
      showSuccess: false,
    });
  }, []);

  const openCheerModal = useCallback((creator: Creator) => {
    setState({
      modalType: 'cheer',
      isModalOpen: true,
      selectedCreator: creator,
      amount: '',
      isProcessing: false,
      transactionId: null,
      error: null,
      showSuccess: false,
    });
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      modalType: null,
      isModalOpen: false,
      selectedCreator: null,
      amount: '',
      error: null,
    }));
  }, []);

  const closeSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSuccess: false,
      transactionId: null,
    }));
  }, []);

  const updateAmount = useCallback((value: string) => {
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setState(prev => ({ ...prev, amount: value, error: null }));
    }
  }, []);

  const validateAmount = useCallback((): { valid: boolean; error: string | null } => {
    if (!state.amount || parseFloat(state.amount) <= 0) {
      return { valid: false, error: 'Please enter an amount greater than 0' };
    }

    const numAmount = parseFloat(state.amount);

    if (state.modalType === 'tip') {
      // STX validation
      const minAmount = 0.001;
      const txFee = 0.001; // Estimated transaction fee in STX
      const totalRequired = numAmount + txFee;

      if (numAmount < minAmount) {
        return { valid: false, error: `Minimum tip amount is ${minAmount} STX` };
      }

      if (totalRequired > stxBalance) {
        return { 
          valid: false, 
          error: `Insufficient balance. You need ${totalRequired.toFixed(6)} STX (including fee)` 
        };
      }
    } else if (state.modalType === 'cheer') {
      // CHEER validation
      const minAmount = 1;
      
      if (numAmount < minAmount) {
        return { valid: false, error: `Minimum cheer amount is ${minAmount} CHEER` };
      }

      if (numAmount > cheerBalance) {
        return { valid: false, error: 'Insufficient CHEER balance' };
      }
    }

    return { valid: true, error: null };
  }, [state.amount, state.modalType, stxBalance, cheerBalance]);

  const executeTip = useCallback(async () => {
    if (!walletAddress || !state.selectedCreator) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    const validation = validateAmount();
    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.error }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Convert STX to micro-STX (1 STX = 1,000,000 micro-STX)
      const microStx = Math.floor(parseFloat(state.amount) * 1_000_000);
      
      const txId = await sendTipWithStx(
        state.selectedCreator.address,
        microStx,
        walletAddress
      );

      setState(prev => ({
        ...prev,
        isProcessing: false,
        transactionId: txId,
        isModalOpen: false,
        showSuccess: true,
      }));
    } catch (error: any) {
      console.error('Tip transaction failed:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Transaction failed. Please try again.',
      }));
    }
  }, [walletAddress, state.selectedCreator, state.amount, validateAmount]);

  const executeCheer = useCallback(async () => {
    if (!walletAddress || !state.selectedCreator) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    const validation = validateAmount();
    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.error }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const cheerAmount = Math.floor(parseFloat(state.amount));
      
      const txId = await sendCheerWithToken(
        state.selectedCreator.address,
        cheerAmount,
        walletAddress
      );

      setState(prev => ({
        ...prev,
        isProcessing: false,
        transactionId: txId,
        isModalOpen: false,
        showSuccess: true,
      }));
    } catch (error: any) {
      console.error('Cheer transaction failed:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Transaction failed. Please try again.',
      }));
    }
  }, [walletAddress, state.selectedCreator, state.amount, validateAmount]);

  return {
    ...state,
    openTipModal,
    openCheerModal,
    closeModal,
    closeSuccess,
    updateAmount,
    validateAmount,
    executeTip,
    executeCheer,
    stxBalance,
    cheerBalance,
  };
};
