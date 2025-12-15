// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
// Example: How to use Toast notifications in your components
// This file contains example code snippets and is not meant to be error-free

import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/common/Toast';

// In your component:
export const ExampleComponent = () => {
  const { toasts, success, error, loading, info, updateToast, removeToast } = useToast();

  // Example 1: Simple success message
  const handleSuccess = () => {
    success('Profile updated successfully!');
  };

  // Example 2: Error message
  const handleError = () => {
    error('Failed to connect wallet. Please try again.');
  };

  // Example 3: Loading with update
  const handleAsyncOperation = async () => {
    const toastId = loading('Sending transaction...');
    
    try {
      // Perform async operation - replace with your actual function
      await Promise.resolve();
      
      // Update to success
      updateToast(toastId, 'success', 'Transaction sent successfully!');
    } catch (err) {
      // Update to error
      updateToast(toastId, 'error', 'Transaction failed. Please try again.');
    }
  };

  // Example 4: Info message
  const handleInfo = () => {
    info('New features coming soon!', 10000); // Custom duration
  };

  // Use the handlers in your component
  // handleSuccess(), handleError(), handleAsyncOperation(), handleInfo()

  return (
    <div>
      {/* Your component content */}
      
      {/* Add ToastContainer at the bottom */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

// Example 5: Using in TipModal
export const TipModalExample = () => {
  const { toasts, loading, updateToast, removeToast } = useToast();
  const walletAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Example

  const handleTip = async (creatorAddress: string, amount: number) => {
    const toastId = loading('Sending tip...');

    try {
      // Replace with actual sendTipWithStx import
      const txId = await Promise.resolve('0x1234...' as string);
      
      updateToast(
        toastId, 
        'success', 
        `Tip sent successfully! Transaction: ${txId.slice(0, 8)}...`
      );

      // Optional: Remove after longer duration for success
      setTimeout(() => removeToast(toastId), 7000);
    } catch (err: any) {
      updateToast(
        toastId, 
        'error', 
        err.message || 'Failed to send tip. Please try again.'
      );
    }
  };

  return (
    <>
      {/* Modal content */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

// Example 6: Global toast context (optional - for app-wide toasts)
import { createContext, useContext, type ReactNode } from 'react';

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </ToastContext.Provider>
  );
};

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast must be used within ToastProvider');
  }
  return context;
};

// Usage in App.tsx:
// <ToastProvider>
//   <App />
// </ToastProvider>

// Then in any component:
// const { success, error } = useGlobalToast();
// success('Operation completed!');
