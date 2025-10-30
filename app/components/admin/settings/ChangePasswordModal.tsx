import React, { useState } from 'react';
import { useAppState } from '@/app/context/AppContext';
import { securedApi } from '@/utils/auth';
import TransactionResultModal from '@/app/components/TransactionResultModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | 'warning'>('warning'); // Changed 'info' to 'warning'
  const { appData } = useAppState(); // Removed setAppData

  const handleSubmit = async () => {
    if (newPassword !== confirmNewPassword) {
      setResultTitle('Error');
      setResultMessage('New passwords do not match.');
      setResultStatus('error');
      setShowResultModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await securedApi.callBackendFunction({
        functionName: 'changePassword',
        oldPassword,
        newPassword,
      });

      if (response.success) {
        setResultTitle('Success');
        setResultMessage('Your password has been changed successfully.');
        setResultStatus('success');
        onClose(); // Close the change password modal
      } else {
        setResultTitle('Error');
        setResultMessage(response.error || 'Failed to change password.');
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
        onConfirm={handleSubmit}
        title="Change Password"
        children={ // Changed message to children
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Old Password"
              className="w-full p-2 border border-gray-300 rounded"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-2 border border-gray-300 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-2 border border-gray-300 rounded"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        }
        confirmText="Change Password"
        confirmDisabled={isSubmitting} // Changed isConfirming to confirmDisabled
      />
      <TransactionResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={resultTitle}
        message={resultMessage}
        type={resultStatus} // Changed status to type
      />
    </>
  );
};

export default ChangePasswordModal;
