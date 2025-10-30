import React, { useState } from 'react';
import { useAppState } from '@/app/context/AppContext';
import { securedApi } from '@/utils/auth';
import TransactionResultModal from '@/app/components/TransactionResultModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';

interface DestroyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DestroyAccountModal: React.FC<DestroyAccountModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | 'warning'>('warning');
  const { appData } = useAppState();

  const handleDestroyAccount = async () => {
    setIsSubmitting(true);
    try {
      const response = await securedApi.callBackendFunction({ functionName: 'destroyAccount' });

      if (response.success) {
        setResultTitle('Success');
        setResultMessage('Your account has been successfully destroyed. You will be logged out.');
        setResultStatus('success');
        // Automatically log out the user after successful destruction
        // The backend should handle the actual logout/session invalidation
        // For frontend, we might redirect to a logout page or home page
        window.location.href = '/'; // Redirect to home or logout page
      } else {
        setResultTitle('Error');
        setResultMessage(response.error || 'Failed to destroy account.');
        setResultStatus('error');
      }
    } catch (error: any) {
      setResultTitle('Error');
      setResultMessage(error.message || 'An unexpected error occurred.');
      setResultStatus('error');
    } finally {
      setIsSubmitting(false);
      setShowResultModal(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDestroyAccount}
        title="Destroy Account"
        children={
          <div className="space-y-4">
            <p className="text-red-600 font-bold">WARNING: This action is irreversible!</p>
            <p>Are you absolutely sure you want to destroy your account? All your data will be permanently deleted.</p>
          </div>
        }
        confirmText="Destroy Account"
        confirmDisabled={isSubmitting}
      />
      <TransactionResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={resultTitle}
        message={resultMessage}
        type={resultStatus}
      />
    </>
  );
};

export default DestroyAccountModal;
