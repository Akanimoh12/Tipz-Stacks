import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export const NetworkWarning: React.FC = () => {
  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4 rounded-r-lg">
      <div className="flex items-center">
        <FiAlertTriangle className="text-orange-500 mr-3 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-orange-800 font-semibold">Testnet Network Required</h3>
          <p className="text-orange-700 text-sm mt-1">
            This application is running on Stacks Testnet. Please switch your wallet to Testnet before connecting.
          </p>
          <a 
            href="https://docs.stacks.co/stacks-101/testnet" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-600 underline text-sm mt-2 inline-block hover:text-orange-800 transition-colors"
          >
            Learn how to get testnet STX →
          </a>
        </div>
      </div>
    </div>
  );
};
