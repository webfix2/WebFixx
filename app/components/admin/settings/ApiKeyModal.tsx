import React, { useState, useEffect } from 'react';
import { useAppState } from '@/app/context/AppContext';
import { securedApi } from '@/utils/auth';
import TransactionResultModal from '@/app/components/TransactionResultModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentApiKey }) => {
  const [newApiKey, setNewApiKey] = useState(currentApiKey);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | 'warning'>('warning'); // Changed 'info' to 'warning'
  const { appData, setAppData } = useAppState();

  useEffect(() => {
    setNewApiKey(currentApiKey);
  }, [currentApiKey]);

  const handleGenerateApiKey = async () => {
    setIsGenerating(true);
    try {
      const response = await securedApi.callBackendFunction({ functionName: 'generateApiKey' });

      if (response.success && response.data && response.data.apiKey) {
        setNewApiKey(response.data.apiKey);
        setResultTitle('Success');
        setResultMessage('New API Key generated successfully.');
        setResultStatus('success');
      } else {
        setResultTitle('Error');
        setResultMessage(response.error || 'Failed to generate new API Key.');
        setResultStatus('error');
      }
    } catch (error: any) {
      setResultTitle('Error');
      setResultMessage(error.message || 'An unexpected error occurred.');
      setResultStatus('error');
    } finally {
      setIsGenerating(false);
      setShowResultModal(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleGenerateApiKey}
        title="Generate New API Key"
        children={
          <div className="space-y-4">
            <p>Your current API Key:</p>
            <input
              type="text"
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              value={newApiKey}
            />
            <p>Are you sure you want to generate a new API Key? This will invalidate the old one.</p>
          </div>
        }
        confirmText="Generate New Key"
        confirmDisabled={isGenerating} // Changed isConfirming to confirmDisabled
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

export default ApiKeyModal;
