import React, { useEffect } from 'react';
import { FiCheck, FiX, FiLoader, FiInfo } from 'react-icons/fi';

interface ToastProps {
  type: 'success' | 'error' | 'loading' | 'info';
  message: string;
  onClose: () => void;
  autoClose?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  onClose, 
  autoClose = 5000 
}) => {
  useEffect(() => {
    if (type !== 'loading' && autoClose > 0) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [type, autoClose, onClose]);

  const icons = {
    success: <FiCheck className="text-green-500" size={24} />,
    error: <FiX className="text-red-500" size={24} />,
    loading: <FiLoader className="text-blue-500 animate-spin" size={24} />,
    info: <FiInfo className="text-blue-500" size={24} />,
  };

  const colors = {
    success: 'bg-green-50 border-green-500',
    error: 'bg-red-50 border-red-500',
    loading: 'bg-blue-50 border-blue-500',
    info: 'bg-blue-50 border-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md ${colors[type]} border-l-4 p-4 rounded-lg shadow-lg transition-all duration-300 animate-slide-in`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        {type !== 'loading' && (
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <FiX size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; type: 'success' | 'error' | 'loading' | 'info'; message: string }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
};
