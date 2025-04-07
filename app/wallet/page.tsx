"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, 
  faMoneyBillWave,
  faHistory,
  faSpinner,
  faCoffee
} from '@fortawesome/free-solid-svg-icons';
import { useAppState } from '../context/AppContext';
import type { WalletTransaction } from '../types/wallet';
import LoadingSpinner from '../components/LoadingSpinner';
import FundWalletModal from '../components/admin/wallet/FundWalletModal';
import { securedApi } from '../../utils/auth';

export default function Wallet() {
  const { appData } = useAppState();
  const [showFundModal, setShowFundModal] = useState(false);
  const [drinkAmount, setDrinkAmount] = useState('5');
  const [isProcessing, setIsProcessing] = useState(false);

  // Add console logging to inspect user data
  console.log('User Data:', {
    user: appData?.user,
    balance: appData?.user?.balance,
    pendingBalance: appData?.user?.pendingBalance,
    fullAppData: appData // Log full appData to see entire structure
  });

  if (!appData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const transactions = appData.data.transactions || [];
  const addresses = appData.user.addresses || [];

  const handleBuyDrink = async () => {
    try {
      setIsProcessing(true);
      const amount = parseFloat(drinkAmount);
      
      if (amount < 5) {
        throw new Error('Minimum amount is $5');
      }

      const response = await securedApi.callBackendFunction({
        functionName: 'processInternalPayment',
        amount: drinkAmount,
        purpose: 'buy_drink',
        userId: appData?.user?.userId
      });

      if (response.success) {
        appData.user.balance = response.data.newBalance;
        setDrinkAmount('5'); // Reset to minimum
      }
    } catch (error) {
      console.error('Failed to process drink payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        {/* Available Balance Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Available Balance</h2>
            <FontAwesomeIcon icon={faWallet} className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${appData?.user?.balance || '0.00'}
          </div>
          {parseFloat(appData?.user?.pendingBalance || '0') > 0 && (
            <div className="text-sm text-gray-500 mt-1">
              Pending: ${appData?.user?.pendingBalance}
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={() => setShowFundModal(true)}
              className="w-full btn-primary flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faMoneyBillWave} className="w-4 h-4 mr-2" />
              Add Funds
            </button>
          </div>
        </div>

        {/* Buy us a drink Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Buy us a drink</h2>
            <FontAwesomeIcon icon={faCoffee} className="w-6 h-6 text-amber-500" />
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">Support our team with a virtual drink!</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="drinkAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (min. $5)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="drinkAmount"
                    min="5"
                    step="1"
                    value={drinkAmount}
                    onChange={(e) => setDrinkAmount(e.target.value)}
                    className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="5"
                  />
                </div>
              </div>
              <button
                onClick={handleBuyDrink}
                disabled={isProcessing || parseFloat(drinkAmount) < 5}
                className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCoffee} className="w-4 h-4 mr-2" />
                    Buy Drink
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Transaction History
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx: WalletTransaction) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {tx.reference}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${tx.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
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

      {/* Fund Modal */}
      {showFundModal && (
        <FundWalletModal
          onClose={() => setShowFundModal(false)}
          addresses={addresses}
        />
      )}
    </div>
  );
}