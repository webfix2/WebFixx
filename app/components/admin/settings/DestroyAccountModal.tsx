import React, { useState } from 'react';
import { securedApi } from '@/utils/auth';
import TransactionResultModal from '@/app/components/TransactionResultModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface DestroyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDestroyAccount: () => Promise<void>;
}

const DestroyAccountModal: React.FC<DestroyAccountModalProps> = ({ isOpen, onClose, onDestroyAccount }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | 'warning'>('warning');

  const handleDestroy = async () => {
    if (confirmationText !== 'DELETE') {
      setResultTitle('Error');
      setResultMessage('Please type "DELETE" to confirm.');
      setResultStatus('error');
      setShowResultModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onDestroyAccount(); // Call the parent's destroy function
      onClose(); // Close the modal on successful submission
    } catch (error: any) {
      setResultTitle('Error');
      setResultMessage(error.message || 'An unexpected error occurred.');
      setResultStatus('error');
      setShowResultModal(true);
    } finally {
      setIsSubmitting(false);
      setConfirmationText('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
        <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
          <h2 className="text-xl font-bold mb-4">Destroy Account</h2>
          <p className="mb-4 text-red-600 dark:text-red-400 font-bold">WARNING: This action is irreversible!</p>
          <p className="mb-4 text-gray-700 dark:text-gray-200">
            Are you absolutely sure you want to destroy your account? All your data, projects, and associated records will be permanently deleted.
          </p>
          <p className="mb-2 text-gray-700 dark:text-gray-200">
            To confirm, please type "DELETE" in the box below:
          </p>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type DELETE to confirm"
          />
          <div className="flex justify-end space-x-4 mt-6">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              onClick={handleDestroy}
              disabled={isSubmitting || confirmationText !== 'DELETE'}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              {isSubmitting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> : null}
              Destroy Account
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

export default DestroyAccountModal;
