"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, 
  faExchangeAlt, 
  faHistory,
  faQrcode,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { ethers } from 'ethers';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  address: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export default function Wallet() {
  const [balance, setBalance] = useState<string>('0.00');
  const [address, setAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      // Initialize Alchemy/Moralis SDK here
      // const provider = new ethers.providers.AlchemyProvider();
      // Fetch wallet data
      setLoading(false);
    } catch (error) {
      console.error('Error initializing wallet:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Balance</h2>
            <FontAwesomeIcon icon={faWallet} className="w-6 h-6 text-blue-500" />
          </div>
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin" />
          ) : (
            <div className="text-3xl font-bold text-gray-900 dark:text-white">${balance}</div>
          )}
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setShowSend(true)}
              className="btn-primary flex items-center"
            >
              <FontAwesomeIcon icon={faExchangeAlt} className="w-4 h-4 mr-2" />
              Send/Receive
            </button>
            <button className="btn-secondary flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-md">
              <FontAwesomeIcon icon={faQrcode} className="w-4 h-4 mr-2" />
              Show QR Code
            </button>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Wallet Address</h2>
          <div className="break-all text-sm text-gray-600 dark:text-gray-300">
            {address || 'No wallet connected'}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Transaction History
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.type === 'receive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {tx.type === 'receive' ? 'Received' : 'Sent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${tx.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {tx.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send/Receive Modal */}
      {/* {showSend && (
        <SendReceiveModal
          onClose={() => setShowSend(false)}
          onSend={(data) => {
            // Handle send transaction
          }}
        />
      )} */}
    </div>
  );
}

{/* // Add SendReceiveModal component implementation */}
