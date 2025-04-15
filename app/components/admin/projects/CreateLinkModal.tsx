"use client";

import { useState, useEffect } from 'react';
import LoadingSpinner from '../../LoadingSpinner';
import TransactionResultModal from '../../TransactionResultModal';
import { useAppState } from '../../../context/AppContext';
import { securedApi } from '../../../../utils/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faArrowRight, 
  faTimes, 
  faCheck 
} from '@fortawesome/free-solid-svg-icons';

// Types for form state
interface LinkFormState {
  stage: 'template' | 'notification-setup' | 'telegram-verification' | 'confirmation';
  title: string;
  category: string;
  pageType: string;
  template: string;
  templateVariables: Record<string, string>;
  telegramId: string;
  templateTelegramId?: string;
  email?: string;
  telegramVerified: boolean;
  templatePrice?: number;
}

interface CreateLinkModalProps {
  onClose: () => void;
  onSave: (linkData: any) => void;
  addresses?: any[];
}

export default function CreateLinkModal({ onClose, onSave, addresses }: CreateLinkModalProps) {
  const { appData } = useAppState();
  const [formState, setFormState] = useState<LinkFormState>({
    stage: 'template',
    title: '',
    category: '',
    pageType: '',
    template: '',
    templateVariables: {},
    telegramId: '',
    templateTelegramId: '',
    email: '',
    telegramVerified: false,
    templatePrice: 0
  });

  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState<{
    image?: string;
    gif?: string;
    video?: string;
  }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [telegramVerificationError, setTelegramVerificationError] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalProps, setResultModalProps] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
    details: {}
  });

  // Fetch available templates from appData
  const availableTemplates = appData?.data?.template?.data || [];
  const templateHeaders = appData?.data?.template?.headers || [];

  // Dynamic template selection
  const getTemplateIndex = (header: string) => templateHeaders.indexOf(header);
  const filteredTemplates = availableTemplates.filter(template => 
    template[getTemplateIndex('status')] === 'ACTIVE'
  );

  const handleTemplateSelection = (template: any) => {
    const templateIndex = getTemplateIndex;
    setFormState(prev => ({
      ...prev,
      template: template[templateIndex('templateId')],
      templateTelegramId: template[templateIndex('telegramId')],
      templatePrice: parseFloat(template[templateIndex('price')] || '0')
    }));

    // Set preview media
    setSelectedTemplatePreview({
      image: template[templateIndex('images')]?.[0],
      gif: template[templateIndex('gifs')]?.[0],
      video: template[templateIndex('videos')]?.[0]
    });
  };

  const renderTemplatePreview = () => {
    const { image, gif, video } = selectedTemplatePreview;

    if (video) {
      return (
        <video 
          src={video} 
          controls 
          className="w-full h-64 object-cover rounded-lg"
          poster={image}
        />
      );
    }

    if (gif) {
      return (
        <img 
          src={gif} 
          alt="Template Preview (GIF)" 
          className="w-full h-64 object-cover rounded-lg"
        />
      );
    }

    if (image) {
      return (
        <img 
          src={image} 
          alt="Template Preview" 
          className="w-full h-64 object-cover rounded-lg"
        />
      );
    }

    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No preview available</p>
      </div>
    );
  };

  // Stage navigation
  const nextStage = () => {
    switch (formState.stage) {
      case 'template':
        // Validate template stage inputs
        if (!formState.title || !formState.category || !formState.template) {
          alert('Please fill in all required fields');
          return;
        }
        setFormState(prev => ({ ...prev, stage: 'notification-setup' }));
        break;
      case 'notification-setup':
        // Validate notification setup stage inputs
        if (!formState.telegramId) {
          alert('Telegram ID is required');
          return;
        }
        setFormState(prev => ({ ...prev, stage: 'telegram-verification' }));
        break;
      case 'telegram-verification':
        // Telegram verification handled separately
        break;
      case 'confirmation':
        // Submit link creation
        handleSubmit();
        break;
    }
  };

  const prevStage = () => {
    switch (formState.stage) {
      case 'notification-setup':
        setFormState(prev => ({ ...prev, stage: 'template' }));
        break;
      case 'telegram-verification':
        setFormState(prev => ({ ...prev, stage: 'notification-setup' }));
        break;
      case 'confirmation':
        setFormState(prev => ({ ...prev, stage: 'telegram-verification' }));
        break;
    }
  };

  // Dynamic template variable handling
  const handleTemplateVariableChange = (key: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      templateVariables: {
        ...prev.templateVariables,
        [key]: value
      }
    }));
  };

  // Submit link creation
  const handleTelegramVerification = async () => {
    try {
      setIsProcessing(true);
      setTelegramVerificationError(null);
      const response = await securedApi.callBackendFunction({
        functionName: 'verifyTelegramNotification',
        telegramId: formState.telegramId
      });

      if (response.success) {
        setFormState(prev => ({
          ...prev, 
          telegramVerified: true,
          stage: 'confirmation'
        }));
      } else {
        // Handle verification failure
        setTelegramVerificationError(response.error || 'Failed to verify Telegram account');
      }
    } catch (error) {
      console.error('Telegram verification error:', error);
      setTelegramVerificationError('An unexpected error occurred during verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      const response = await securedApi.callBackendFunction({
        functionName: 'createProjectLink',
        title: formState.title,
        templateId: formState.template,
        templateVariables: formState.templateVariables,
        telegramId: formState.templateTelegramId || formState.telegramId,
        email: formState.email
      });

      if (response.success) {
        setResultModalProps({
          type: 'success',
          title: 'Project Created',
          message: 'Your project has been successfully created!',
          details: response.data
        });
        setShowResultModal(true);
        onSave(response.data);
      } else {
        // Handle error scenarios
        setResultModalProps({
          type: 'error',
          title: 'Project Creation Failed',
          message: response.error || 'Failed to create project',
          details: response.details || {}
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Link creation error:', error);
      setResultModalProps({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An unexpected error occurred',
        details: {}
      });
      setShowResultModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render template variables dynamically
  const renderTemplateVariables = () => {
    const selectedTemplate = availableTemplates.find(
      template => template[getTemplateIndex('templateId')] === formState.template
    );

    if (!selectedTemplate) return null;

    const variablesJson = selectedTemplate[getTemplateIndex('variables')];
    try {
      const variables = JSON.parse(variablesJson || '{}');
      return Object.keys(variables).map(key => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <input
            type="text"
            value={formState.templateVariables[key] || ''}
            onChange={(e) => handleTemplateVariableChange(key, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      ));
    } catch {
      return <p>Error parsing template variables</p>;
    }
  };

  // Render current stage
  const renderStage = () => {
    switch (formState.stage) {
      case 'template':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">Template Selection</h2>
            
            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter project title"
              />
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formState.category}
                onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select Category</option>
                {Array.from(new Set(filteredTemplates.map(t => t[getTemplateIndex('niche')]))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Page Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Page Type</label>
              <select
                value={formState.pageType}
                onChange={(e) => setFormState(prev => ({ ...prev, pageType: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select Page Type</option>
                {Array.from(new Set(filteredTemplates.map(t => t[getTemplateIndex('type')]))).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {formState.category && formState.pageType && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <select
                      value={formState.template}
                      onChange={(e) => {
                        const selectedTemplate = filteredTemplates.find(
                          template => template[getTemplateIndex('templateId')] === e.target.value
                        );
                        
                        if (selectedTemplate) {
                          setFormState(prev => ({ 
                            ...prev, 
                            template: selectedTemplate[getTemplateIndex('templateId')],
                            templateTelegramId: selectedTemplate[getTemplateIndex('telegramId')]
                          }));

                          // Set preview media
                          setSelectedTemplatePreview({
                            image: selectedTemplate[getTemplateIndex('images')]?.[0],
                            gif: selectedTemplate[getTemplateIndex('gifs')]?.[0],
                            video: selectedTemplate[getTemplateIndex('videos')]?.[0]
                          });
                        }
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="">Select Template</option>
                      {filteredTemplates
                        .filter(t => 
                          t[getTemplateIndex('niche')] === formState.category && 
                          t[getTemplateIndex('type')] === formState.pageType
                        )
                        .map(template => (
                          <option 
                            key={template[getTemplateIndex('templateId')]} 
                            value={template[getTemplateIndex('templateId')]}
                          >
                            {template[getTemplateIndex('name')]}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="w-1/2">
                    {renderTemplatePreview()}
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Template Variables */}
            {formState.template && renderTemplateVariables()}
          </div>
        );

      case 'notification-setup':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">Notification Setup</h2>
            
            {/* Telegram ID */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Telegram ID (Required)</label>
              <input
                type="text"
                value={formState.telegramId}
                onChange={(e) => setFormState(prev => ({ ...prev, telegramId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter Telegram ID"
              />
            </div>

            {/* Optional Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
              <input
                type="email"
                value={formState.email || ''}
                onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter email address (Optional)"
              />
            </div>
          </div>
        );

      case 'telegram-verification':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Telegram Verification</h2>
              <button
                onClick={() => setFormState(prev => ({ ...prev, stage: 'notification-setup' }))}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Change Telegram ID
              </button>
            </div>
            
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
              <p className="font-bold">Telegram Verification Steps:</p>
              <ol className="list-decimal list-inside mt-2">
                <li>Open Telegram</li>
                <li>Search for and start a chat with <strong>@WebFixxBot</strong></li>
                <li>Send the following message: <code>/verify {formState.telegramId}</code></li>
                <li>After completing these steps, click the &quot;Test Notification&quot; button below</li>
              </ol>
            </div>

            {telegramVerificationError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{telegramVerificationError}</p>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleTelegramVerification}
                disabled={isProcessing}
                className="btn-primary flex items-center"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" />
                    Verifying...
                  </>
                ) : (
                  'Test Notification'
                )}
              </button>
            </div>
          </div>
        );
      case 'confirmation':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">Confirm Link Details</h2>
            
            {/* Summary of Entered Information */}
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Template Details</h3>
              <p><strong>Title:</strong> {formState.title}</p>
              <p><strong>Category:</strong> {formState.category}</p>
              <p><strong>Page Type:</strong> {formState.pageType}</p>
              <p><strong>Template:</strong> {formState.template}</p>
              <p><strong>Template Price:</strong> ${formState.templatePrice?.toFixed(2) || '0.00'}</p>

              {/* Template Variables */}
              {Object.keys(formState.templateVariables).length > 0 && (
                <div>
                  <h3 className="font-semibold mt-4 mb-2">Template Variables</h3>
                  {Object.entries(formState.templateVariables).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {value}</p>
                  ))}
                </div>
              )}

              <h3 className="font-semibold mt-4 mb-2">Telegram Details</h3>
              <p><strong>Telegram ID:</strong> {formState.telegramId}</p>
              {formState.email && <p><strong>Email:</strong> {formState.email}</p>}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Link</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {renderStage()}
        </div>

        {/* Modal Footer with Navigation */}
        <div className="flex justify-between p-4 border-t">
          {formState.stage !== 'template' && formState.stage !== 'telegram-verification' && (
            <button 
              onClick={prevStage}
              className="btn-secondary flex items-center"
              disabled={isProcessing}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Previous
            </button>
          )}

          {formState.stage !== 'telegram-verification' && (
            <button 
              onClick={nextStage}
              className="btn-primary ml-auto flex items-center"
              disabled={isProcessing || (formState.stage === 'notification-setup' && !formState.telegramId)}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="small" />
                  Processing...
                </>
              ) : formState.stage === 'confirmation' ? (
                <>
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  Create Link
                </>
              ) : (
                <>
                  Next
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Transaction Result Modal */}
        <TransactionResultModal
          isOpen={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            if (resultModalProps.type === 'success') {
              onClose();
            }
          }}
          type={resultModalProps.type}
          title={resultModalProps.title}
          message={resultModalProps.message}
          details={resultModalProps.details}
        />
      </div>
    </div>
  );
}
