import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'loading' | 'info';
  message: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    type: ToastMessage['type'],
    message: string,
    duration: number = 5000
  ): string => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = { id, type, message };

    setToasts(prev => [...prev, toast]);

    // Auto-remove non-loading toasts
    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return showToast('success', message, duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    return showToast('error', message, duration);
  }, [showToast]);

  const loading = useCallback((message: string) => {
    return showToast('loading', message, 0); // No auto-dismiss
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    return showToast('info', message, duration);
  }, [showToast]);

  const updateToast = useCallback((id: string, type: ToastMessage['type'], message: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, type, message } : toast
    ));

    // Auto-remove if not loading
    if (type !== 'loading') {
      setTimeout(() => removeToast(id), 5000);
    }
  }, [removeToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    loading,
    info,
    updateToast,
  };
};
