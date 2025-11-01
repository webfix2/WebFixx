"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faLock,
  faShield,
  faKey,
  faTrash,
  faCrown,
  faEdit,
  faSync,
  faSpinner // Added faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useAppState } from '../context/AppContext';
import type { AppState } from '../../utils/authTypes'; // Import AppState from authTypes
import LoadingSpinner from '../components/LoadingSpinner';
import { securedApi } from '../../utils/auth';
import TransactionResultModal from '../components/TransactionResultModal';
import ConfirmationModal from '../components/ConfirmationModal';
import FundAccountModal from '../components/admin/wallet/FundAccountModal';
import { getUserLimits } from '../../utils/helpers';
import ChangePasswordModal from '../components/admin/settings/ChangePasswordModal'; // Import the actual ChangePasswordModal
import ApiKeyModal from '../components/admin/settings/ApiKeyModal'; // Import the actual ApiKeyModal
import DestroyAccountModal from '../components/admin/settings/DestroyAccountModal'; // Import the actual DestroyAccountModal

// Modal components (to be implemented)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Add other props as needed for specific modals
  appData?: any; // For UpgradePlanModal
  userLimits?: any; // For UpgradePlanModal
  onConfirm?: () => void; // For confirmation modals
  title?: string; // For confirmation modals
  message?: string; // For confirmation modals
  confirmText?: string; // For confirmation modals
  cancelText?: string; // For confirmation modals
  confirmDisabled?: boolean; // For confirmation modals
  onGenerateNewApiKey?: () => Promise<void>; // For ApiKeyModal
  onTwoFactorToggle?: (enable: boolean) => void; // For TwoFactorModal
  isTwoFactorEnabled?: boolean; // For TwoFactorModal
  onChangePassword?: (oldPass: string, newPass: string) => Promise<void>; // For ChangePasswordModal
  onDestroyAccount?: () => Promise<void>; // For DestroyAccountModal
  selectedPlan?: string | null; // Added for UpgradePlanModal
  setSelectedPlan?: React.Dispatch<React.SetStateAction<string | null>>; // Added for UpgradePlanModal
}


const UpgradePlanModal = ({ isOpen, onClose, appData, userLimits, onConfirm, selectedPlan, setSelectedPlan, confirmDisabled }: ModalProps) => {
  if (!isOpen) return null;

  const availablePlans = appData?.data?.limits?.data || [];
  const planHeaders = appData?.data?.limits?.headers || [];

  const getPlanIndex = (header: string) => planHeaders.indexOf(header);

  const currentPlan = appData?.user?.plan?.toLowerCase() || 'free'; // Assuming 'free' is the default plan

  return (
    <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 relative">
        <h2 className="text-xl font-bold mb-4">Upgrade Plan</h2>
        <p className="text-gray-700 dark:text-gray-200 mb-6">Select a plan to upgrade your account and unlock more features.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {availablePlans.map((plan: any, index: number) => {
            const planName = plan[getPlanIndex('plan')]?.toLowerCase();
            const isCurrentPlan = currentPlan === planName;
            const price = parseFloat(plan[getPlanIndex('price')] || '0');

            return (
              <div
                key={index}
                className={`
                  p-4 border rounded-lg cursor-pointer
                  ${isCurrentPlan ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 dark:border-gray-600'}
                  ${selectedPlan === planName ? 'bg-blue-50 dark:bg-blue-900' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}
                `}
                onClick={() => setSelectedPlan && setSelectedPlan(planName)}
              >
                <h3 className="font-semibold text-lg mb-2 capitalize dark:text-white">{planName}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Price: ${price.toFixed(2)} / month
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc list-inside">
                  <li>Redirect Limit: {plan[getPlanIndex('redirectLimit')]}</li>
                  <li>Project Limit: {plan[getPlanIndex('projectLimit')]}</li>
                  <li>Path Limit: {plan[getPlanIndex('pathLimit')]}</li>
                  <li>Team Members: {plan[getPlanIndex('teamMembers')]}</li>
                  <li>Custom Domains: {plan[getPlanIndex('customDomains')]}</li>
                </ul>
                {isCurrentPlan && (
                  <span className="mt-2 inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Current Plan</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled || !selectedPlan || selectedPlan === currentPlan}
            className="btn-primary"
          >
            {confirmDisabled ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> : null}
            {selectedPlan === currentPlan ? 'Current Plan' : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TwoFactorModal = ({ isOpen, onClose, appData, onTwoFactorToggle, isTwoFactorEnabled }: ModalProps) => {
  if (!isOpen) return null;

  const isEnabled = appData?.user?.twoFactorAuth || false;

  return (
    <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
        <h2 className="text-xl font-bold mb-4">Two-Factor Authentication</h2>
        <p className="mb-4">
          Two-factor authentication is currently: <span className={`font-semibold ${isEnabled ? 'text-green-500' : 'text-red-500'}`}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </p>
        <p className="mb-6">
          {isEnabled
            ? 'Disabling 2FA will remove an extra layer of security from your account.'
            : 'Enabling 2FA will add an extra layer of security to your account, requiring a code from your authenticator app.'
          }
        </p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={() => onTwoFactorToggle && onTwoFactorToggle(!isEnabled)}
            className={`${isEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white py-2 px-4 rounded-lg`}
          >
            {isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserSettings() {
  const { appData, setAppData } = useAppState();
  const userLimits = getUserLimits(appData);
  
  // Modal states
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showDestroyAccountModal, setShowDestroyAccountModal] = useState(false);

  // Transaction result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalProps, setResultModalProps] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
    details: {}
  });

  const [showFundAccountModal, setShowFundAccountModal] = useState(false);
  const [fundAccountModalProps, setFundAccountModalProps] = useState({
    requiredAmount: '0.00',
    currentBalance: '0.00',
    shortfall: '0.00',
    message: '',
  });

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPlanConfirmation, setShowPlanConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to handle password change
  const handleChangePassword = async (oldPass: string, newPass: string) => {
    setIsProcessing(true);
    setShowChangePasswordModal(false); // Close the modal

    try {
      const response = await securedApi.callBackendFunction({
        functionName: 'changePassword',
        oldPassword: oldPass,
        newPassword: newPass,
      });

      if (response.success) {
        setResultModalProps({
          type: 'success',
          title: 'Password Changed',
          message: 'Your password has been changed successfully.',
          details: response.data || {}
        });
      } else {
        setResultModalProps({
          type: 'error',
          title: 'Password Change Failed',
          message: response.error || 'Failed to change password.',
          details: response.details || {}
        });
      }
    } catch (error: any) {
      setResultModalProps({
        type: 'error',
        title: 'Unexpected Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {}
      });
    } finally {
      setIsProcessing(false);
      setShowResultModal(true);
    }
  };

  // Function to handle API Key generation
  const handleGenerateNewApiKey = async () => {
    setIsProcessing(true);
    setShowApiKeyModal(false); // Close the modal

    try {
      const response = await securedApi.callBackendFunction({ functionName: 'generateApiKey' });

      if (response.success) {
        setResultModalProps({
          type: 'success',
          title: 'API Key Generated',
          message: 'A new API Key has been successfully generated.',
          details: response.data || {}
        });
        // appData will be globally updated in auth.ts
      } else {
        setResultModalProps({
          type: 'error',
          title: 'API Key Generation Failed',
          message: response.error || 'Failed to generate new API Key.',
          details: response.details || {}
        });
      }
    } catch (error: any) {
      setResultModalProps({
        type: 'error',
        title: 'Unexpected Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {}
      });
    } finally {
      setIsProcessing(false);
      setShowResultModal(true);
    }
  };

  // Function to handle account destruction
  const handleDestroyAccount = async () => {
    setIsProcessing(true);
    setShowDestroyAccountModal(false); // Close the modal

    try {
      const response = await securedApi.callBackendFunction({ functionName: 'destroyAccount' });

      if (response.success) {
        setResultModalProps({
          type: 'success',
          title: 'Account Destroyed',
          message: 'Your account has been successfully destroyed. You will be logged out.',
          details: response.data || {}
        });
        // Redirect to home or logout page after successful destruction
        window.location.href = '/'; 
      } else {
        setResultModalProps({
          type: 'error',
          title: 'Account Destruction Failed',
          message: response.error || 'Failed to destroy account.',
          details: response.details || {}
        });
      }
    } catch (error: any) {
      setResultModalProps({
        type: 'error',
        title: 'Unexpected Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {}
      });
    } finally {
      setIsProcessing(false);
      setShowResultModal(true);
    }
  };

  // Function to handle plan change
  const handleChangePlan = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setShowPlanConfirmation(false); // Close confirmation modal

    try {
      const limitsHeaders = appData?.data?.limits?.headers;
      if (!limitsHeaders) {
        throw new Error('Limits data headers are not available.');
      }

      const getLimitIndex = (header: string) => limitsHeaders.indexOf(header);

      const selectedPlanData = appData?.data?.limits?.data?.find(
        (plan: any) => plan[getLimitIndex('plan')]?.toLowerCase() === selectedPlan
      );
      const requiredAmount = parseFloat(selectedPlanData?.[getLimitIndex('price')] || '0');
      const currentBalance = parseFloat(appData?.user?.balance ?? '0');
      const shortfall = requiredAmount - currentBalance;

      const response = await securedApi.callBackendFunction({
        functionName: 'changePlan',
        plan: selectedPlan,
      });

      if (response.success) {
        setResultModalProps({
          type: 'success',
          title: 'Plan Upgraded',
          message: `You have successfully upgraded to the ${selectedPlan} plan!`,
          details: response.data || {}
        });
        // appData will be globally updated in auth.ts, no need to set AppData here
      } else {
        if (response.details?.error?.includes('Insufficient balance')) {
          setFundAccountModalProps({
            requiredAmount: requiredAmount.toFixed(2),
            currentBalance: currentBalance.toFixed(2),
            shortfall: shortfall.toFixed(2),
            message: response.details.details?.Message || `Insufficient balance to upgrade to ${selectedPlan} plan.`,
          });
          setShowFundAccountModal(true);
        } else {
          setResultModalProps({
            type: 'error',
            title: 'Upgrade Failed',
            message: response.error || `Failed to upgrade to ${selectedPlan} plan.`,
            details: response.details || {}
          });
        }
      }
    } catch (error: any) {
      setResultModalProps({
        type: 'error',
        title: 'Unexpected Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {}
      });
    } finally {
      setIsProcessing(false);
      setShowResultModal(true);
      setShowUpgradePlanModal(false); // Close the upgrade modal
      setSelectedPlan(null); // Reset selected plan
    }
  };

  if (!appData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Function to handle 2FA toggle
  const handleTwoFactorToggle = async (enable: boolean) => {
    setIsProcessing(true);
    setShowTwoFactorModal(false); // Close the modal

    try {
      const response = await securedApi.callBackendFunction({
        functionName: 'toggleTwoFactorAuth',
        enable: enable,
      });

      if (response.success) {
        setResultModalProps({
          type: 'success',
          title: `2FA ${enable ? 'Enabled' : 'Disabled'}`,
          message: `Two-factor authentication has been successfully ${enable ? 'enabled' : 'disabled'}.`,
          details: response.data || {}
        });
        // appData will be globally updated in auth.ts
      } else {
        setResultModalProps({
          type: 'error',
          title: `2FA ${enable ? 'Enable' : 'Disable'} Failed`,
          message: response.error || `Failed to ${enable ? 'enable' : 'disable'} two-factor authentication.`,
          details: response.details || {}
        });
      }
    } catch (error: any) {
      setResultModalProps({
        type: 'error',
        title: 'Unexpected Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {}
      });
    } finally {
      setIsProcessing(false);
      setShowResultModal(true);
    }
  };

  // Format the creation date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'a year ago';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Upgrade Plan Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 h-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upgrade Plan</h2>
          <FontAwesomeIcon icon={faCrown} className="w-6 h-6 text-amber-500" />
        </div>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-200">Current Plan: <span className="font-semibold">Free</span></p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Upgrade to access premium features</p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => setShowUpgradePlanModal(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faCrown} className="w-4 h-4 mr-2" />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Security Sections */}
      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Security</h2>
            <FontAwesomeIcon icon={faShield} className="w-6 h-6 text-green-500" />
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-200">Two-factor authentication greatly helps to secure your account by requiring a dynamically generated code in addition to the standard username and password when you log in.</p>
          </div>
          <button
            onClick={() => setShowTwoFactorModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faShield} className="w-4 h-4 mr-2" />
            Enable Two-Factor Authentication
          </button>
        </div>

        {/* Password */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password</h2>
            <FontAwesomeIcon icon={faLock} className="w-6 h-6 text-blue-500" />
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-200">Regularly update your password to keep your account secure.</p>
          </div>
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faLock} className="w-4 h-4 mr-2" />
            Change Password
          </button>
        </div>

        {/* API Key */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Access Token</h2>
            <FontAwesomeIcon icon={faKey} className="w-6 h-6 text-purple-500" />
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-200">Use the WebFixx API or command-line tool with this API Key. Find more information about our API, Go SDK, Python SDK and CLI tool at our Developer Hub.</p>
            <p className="text-gray-700 dark:text-gray-200 mt-2">Regenerating your API key will invalidate the current/previous one.</p>
            <p className="text-gray-700 dark:text-gray-200 mt-2">For security reasons, your API key will only be shown once!</p>
            <div className="mt-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-mono text-gray-700 dark:text-gray-300">##############################</p>
            </div>
          </div>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSync} className="w-4 h-4 mr-2" />
            Generate New API Key
          </button>
        </div>

        {/* Destroy Account */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Destroy Account</h2>
            <FontAwesomeIcon icon={faTrash} className="w-6 h-6 text-red-500" />
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-200">This will delete your account, servers, and any/all records from our system.</p>
          </div>
          <button
            onClick={() => setShowDestroyAccountModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
            Destroy Account
          </button>
        </div>
      </div>

      {/* Modals */}
      <UpgradePlanModal 
        isOpen={showUpgradePlanModal} 
        onClose={() => setShowUpgradePlanModal(false)} 
        appData={appData}
        userLimits={userLimits}
        onConfirm={() => setShowPlanConfirmation(true)}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        confirmDisabled={isProcessing}
      />
      <TwoFactorModal 
        isOpen={showTwoFactorModal} 
        onClose={() => setShowTwoFactorModal(false)} 
        appData={appData}
        onTwoFactorToggle={handleTwoFactorToggle}
        isTwoFactorEnabled={appData?.user?.twoFactorAuth || false}
      />
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
        onChangePassword={handleChangePassword}
      />
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onGenerateNewApiKey={handleGenerateNewApiKey}
      />
      <DestroyAccountModal 
        isOpen={showDestroyAccountModal} 
        onClose={() => setShowDestroyAccountModal(false)} 
        onDestroyAccount={handleDestroyAccount}
      />

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
              setShowResultModal(false);
              setShowFundAccountModal(true);
            }
          } : undefined
        }
      />

      {/* Fund Account Modal */}
      <FundAccountModal
        isOpen={showFundAccountModal}
        onClose={() => setShowFundAccountModal(false)}
        requiredAmount={fundAccountModalProps.requiredAmount}
        currentBalance={fundAccountModalProps.currentBalance}
        shortfall={fundAccountModalProps.shortfall}
        message={fundAccountModalProps.message}
      />

      {/* Plan Confirmation Modal */}
      {showPlanConfirmation && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setShowPlanConfirmation(false)}
          onConfirm={handleChangePlan}
          title="Confirm Plan Upgrade"
          message={`Are you sure you want to upgrade to the ${selectedPlan} plan? This action will incur a charge.`}
          confirmText={isProcessing ? 'Upgrading...' : 'Confirm Upgrade'}
          cancelText="Cancel"
          confirmDisabled={isProcessing}
        />
      )}
    </div>
  );
}
