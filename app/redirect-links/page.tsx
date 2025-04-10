"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLink, 
  faPlus,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useAppState } from '../context/AppContext';
import { authApi, securedApi } from '../../utils/auth';
import TransactionResultModal from '../components/TransactionResultModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RedirectLinks() {
  const { appData, setAppData } = useAppState();
  const [isProcessing, setIsProcessing] = useState(false);

  // Transaction result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalProps, setResultModalProps] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
    details: {}
  });

  // Check if user is loaded
  if (!appData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Get redirect links from app state
  const links = appData.data?.redirect || [];

  // Create redirect handler
  const handleCreateRedirect = async () => {
    // Safely check user balance with optional chaining and default value
    const userBalance = parseFloat(appData?.user?.balance ?? '0');
    
    // Validate user balance
    if (userBalance < 50) {
      setResultModalProps({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'Minimum $50 required to create a redirect link',
        details: {
          currentBalance: `$${userBalance.toFixed(2)}`,
          requiredAmount: '$50',
          shortfall: `$${(50 - userBalance).toFixed(2)}`
        }
      });
      setShowResultModal(true);
      return;
    }

    try {
      setIsProcessing(true);
      const response = await securedApi.callBackendFunction({
        functionName: 'createRedirect',
        data: {}
      });
    
      if (response.success) {
        // Validate returned data
        if (!response.data?.linkHost || !response.data?.link || !response.data?.linkGoogleURL) {
          throw new Error('Invalid redirect link data received');
        }
    
        // Update app data to reflect new balance and redirect links
        const appDataResult = await authApi.updateAppData(setAppData);
    
        setResultModalProps({
          type: 'success',
          title: 'Redirect Created',
          message: 'Your redirect link has been successfully created!',
          details: {
            linkHost: response.data.linkHost,
            link: response.data.link,
            newBalance: `$${appDataResult.user?.balance ?? userBalance.toFixed(2)}`
          }
        });
        setShowResultModal(true);
      } else {
        throw new Error(response.error || 'Failed to create redirect link');
      }
    } catch (error) {
      setResultModalProps({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {}
      });
      setShowResultModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Create Redirect Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create Redirect Link</h2>
          <FontAwesomeIcon icon={faLink} className="w-6 h-6 text-blue-500" />
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">Create a new redirect link for $50</p>
          <button
            onClick={handleCreateRedirect}
            disabled={isProcessing}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                Create Redirect
              </>
            )}
          </button>
        </div>
      </div>

      {/* Redirect Links Table */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Redirect Links
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Link Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Google URL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {links.length > 0 ? (
                links.map((link, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{link.linkHost}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{link.link}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{link.linkGoogleURL}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No redirect links found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Result Modal */}
      <TransactionResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        type={resultModalProps.type}
        title={resultModalProps.title}
        message={resultModalProps.message}
        details={resultModalProps.details}
        actionButton={
          resultModalProps.type === 'error' && 
          resultModalProps.title === 'Insufficient Balance' ? 
          {
            text: 'Add Funds',
            onClick: () => {
              // Implement navigation or modal opening for adding funds
              // This might depend on your app's navigation setup
            }
          } : undefined
        }
      />
    </div>
  );
}