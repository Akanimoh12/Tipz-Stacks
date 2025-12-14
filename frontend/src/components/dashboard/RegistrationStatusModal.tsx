import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface RegistrationStatusModalProps {
  isOpen: boolean;
  isUploading: boolean;
  uploadProgress: number;
  isRegistering: boolean;
  isConfirming: boolean;
  registrationStep: 'idle' | 'uploading-image' | 'uploading-metadata' | 'submitting-transaction' | 'confirming' | 'complete';
  transactionStatus: 'idle' | 'broadcasting' | 'pending' | 'confirmed' | 'failed';
  transactionId: string | null;
  error: string | null;
  isSuccess: boolean;
  onClose: () => void;
}

const RegistrationStatusModal: React.FC<RegistrationStatusModalProps> = ({
  isOpen,
  isUploading,
  uploadProgress,
  isConfirming,
  registrationStep,
  transactionId,
  error,
  isSuccess,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewProfile = () => {
    onClose();
    navigate('/my-profile');
  };

  const handleGoToDashboard = () => {
    onClose();
    navigate('/dashboard');
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          {/* Success Animation */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FiCheck className="text-4xl text-green-600" />
            </div>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Registration Complete!
            </h2>
            <p className="text-gray-600 text-lg">
              Welcome to Tipz! Your creator profile is now live.
            </p>
          </div>

          {/* Transaction Info */}
          {transactionId && transactionId !== 'pending' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Transaction ID:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-600 break-all flex-1">
                  {transactionId}
                </code>
                <a
                  href={`https://explorer.hiro.so/txid/${transactionId}?chain=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 text-sm whitespace-nowrap"
                >
                  View ↗
                </a>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-3">
            <button
              onClick={handleViewProfile}
              className="w-full bg-linear-to-r from-orange-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              View My Profile
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Celebration Message */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 text-center">
              🚀 Start sharing your profile and receive your first tip!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="text-4xl text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Failed
            </h2>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800 text-left">{error}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Try Again
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Progress state
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLoader className="text-4xl text-orange-600 animate-spin" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isConfirming ? 'Confirming Transaction...' : 'Creating Your Profile...'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isConfirming 
              ? 'Waiting for blockchain confirmation. This may take a few moments.'
              : 'Please don\'t close this window'}
          </p>

          {/* Progress Steps */}
          <div className="space-y-4 text-left">
            {/* Step 1: Upload Image */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                registrationStep === 'uploading-image' 
                  ? 'bg-orange-500 text-white' 
                  : ['uploading-metadata', 'submitting-transaction', 'confirming', 'complete'].includes(registrationStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {['uploading-metadata', 'submitting-transaction', 'confirming', 'complete'].includes(registrationStep) ? (
                  <FiCheck className="text-lg" />
                ) : registrationStep === 'uploading-image' ? (
                  <FiLoader className="text-lg animate-spin" />
                ) : (
                  <span className="text-sm font-bold">1</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Upload Profile Image</p>
                <p className="text-sm text-gray-500">Storing on IPFS</p>
              </div>
            </div>

            {/* Step 2: Upload Metadata */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                registrationStep === 'uploading-metadata' 
                  ? 'bg-orange-500 text-white' 
                  : ['submitting-transaction', 'confirming', 'complete'].includes(registrationStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {['submitting-transaction', 'confirming', 'complete'].includes(registrationStep) ? (
                  <FiCheck className="text-lg" />
                ) : registrationStep === 'uploading-metadata' ? (
                  <FiLoader className="text-lg animate-spin" />
                ) : (
                  <span className="text-sm font-bold">2</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Upload Profile Data</p>
                <p className="text-sm text-gray-500">Creating metadata</p>
              </div>
            </div>

            {/* Step 3: Submit Transaction */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                registrationStep === 'submitting-transaction' 
                  ? 'bg-orange-500 text-white' 
                  : ['confirming', 'complete'].includes(registrationStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {['confirming', 'complete'].includes(registrationStep) ? (
                  <FiCheck className="text-lg" />
                ) : registrationStep === 'submitting-transaction' ? (
                  <FiLoader className="text-lg animate-spin" />
                ) : (
                  <span className="text-sm font-bold">3</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Submit to Blockchain</p>
                <p className="text-sm text-gray-500">Please sign the transaction</p>
              </div>
            </div>

            {/* Step 4: Confirm */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                registrationStep === 'confirming' 
                  ? 'bg-orange-500 text-white' 
                  : registrationStep === 'complete'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {registrationStep === 'complete' ? (
                  <FiCheck className="text-lg" />
                ) : registrationStep === 'confirming' ? (
                  <FiLoader className="text-lg animate-spin" />
                ) : (
                  <span className="text-sm font-bold">4</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Confirm Transaction</p>
                <p className="text-sm text-gray-500">Waiting for confirmation</p>
              </div>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-linear-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800 flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <span>Do not close this window or refresh the page during registration.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationStatusModal;
