"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faWallet, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import FundWalletModal from './FundWalletModal'; // Import the existing FundWalletModal

interface FundAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: string;
  currentBalance: string;
  shortfall: string;
  message: string;
}

export default function FundAccountModal({
  isOpen,
  onClose,
  requiredAmount,
  currentBalance,
  shortfall,
  message,
}: FundAccountModalProps) {
  const [showFundWallet, setShowFundWallet] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-none w-full max-w-md mx-4 flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />
            Insufficient Balance
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1 dark:bg-gray-900">
          {!showFundWallet ? (
            <>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {message || "You do not have enough balance to complete this transaction."}
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Current Balance:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">${parseFloat(currentBalance).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Required Amount:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">${parseFloat(requiredAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-red-600 dark:text-red-400 border-t border-dashed pt-2 mt-2">
                  <span>Shortfall:</span>
                  <span>${parseFloat(shortfall).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Please fund your wallet to proceed with the creation.
              </p>
              <button
                onClick={() => setShowFundWallet(true)}
                className="btn-primary w-full flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faWallet} className="mr-2" /> Fund My Wallet
              </button>
            </>
          ) : (
            <FundWalletModal onClose={() => {
              setShowFundWallet(false);
              onClose(); // Close the parent modal as well
            }} />
          )}
        </div>
      </div>
    </div>
  );
}
