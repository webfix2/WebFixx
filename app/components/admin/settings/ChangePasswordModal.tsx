import React, { useState } from 'react';
import { useAppState } from '@/app/context/AppContext';
import { securedApi } from '@/utils/auth';
import TransactionResultModal from '@/app/components/TransactionResultModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (oldPass: string, newPass: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onChangePassword }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | 'warning'>('warning');

  const handleSubmit = async () => {
    if (newPassword !== confirmNewPassword) {
      setResultTitle('Error');
      setResultMessage('New passwords do not match.');
      setResultStatus('error');
      setShowResultModal(true);
      return;
    }
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setResultTitle('Error');
      setResultMessage('All password fields are required.');
      setResultStatus('error');
      setShowResultModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onChangePassword(oldPassword, newPassword);
      onClose(); // Close the change password modal on successful submission
    } catch (error: any) {
      setResultTitle('Error');
      setResultMessage(error.message || 'An unexpected error occurred.');
      setResultStatus('error');
      setShowResultModal(true);
    } finally {
      setIsSubmitting(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
        <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Old Password"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !oldPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
              className="btn-primary"
            >
              {isSubmitting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> : null}
              Change Password
            </button>
          </div>
        </div>
      </div>
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

export default ChangePasswordModal;
