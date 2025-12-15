// Example: How to use Toast notifications in your components

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
      // Perform async operation
      await someAsyncFunction();
      
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
  const { toasts, loading, success, error, updateToast, removeToast } = useToast();

  const handleTip = async (creatorAddress: string, amount: number) => {
    const toastId = loading('Sending tip...');

    try {
      const txId = await sendTipWithStx(creatorAddress, amount, walletAddress);
      
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
import { createContext, useContext, ReactNode } from 'react';

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
