"use client";

import { useState, useEffect } from 'react';
import LoadingSpinner from '../../LoadingSpinner';
import TransactionResultModal from '../../TransactionResultModal';
import { useAppState } from '../../../context/AppContext';
import { authApi,securedApi } from '../../../../utils/auth';
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
  price?: number;
  renewal?: number;
}

interface CreateLinkModalProps {
  onClose: () => void;
  onSave: (linkData: any) => void;
  addresses?: any[];
}

export default function CreateLinkModal({ onClose, onSave, addresses }: CreateLinkModalProps) {

  const { appData, setAppData } = useAppState();
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
    price: 0,
    renewal: 0
  });

  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState<{
    images?: string;
    gifs?: string;
    videos?: string;
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

  // Helper to get first URL from string (newline/tab/comma-separated or array)
  const getFirstUrl = (field: any) => {
    if (!field) return undefined;
    if (Array.isArray(field)) return field[0];
    if (typeof field === 'string') {
      // Split by tabs, newlines, or commas, filter out empty lines, return first
      const urls = field.split(/\t|\n|,/).map(s => s.trim()).filter(Boolean);
      // Only return if it looks like a valid URL
      return urls.find(url => url.startsWith('http://') || url.startsWith('https://'));
    }
    return undefined;
  };


  const handleTemplateSelection = (template: any) => {
    const templateIndex = getTemplateIndex;

    const imageIndex = templateHeaders.indexOf('images');
    const gifIndex = templateHeaders.indexOf('gifs');
    const videoIndex = templateHeaders.indexOf('videos');

    const rawImages = template[imageIndex];
    const rawGifs = template[gifIndex];
    const rawVideos = template[videoIndex];

    // Parse variables JSON for default values
    let templateVariables: Record<string, string> = {};
    const variablesJson = template[templateIndex('variables')];
    if (variablesJson && variablesJson.trim()) {
      let fixedJson = variablesJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1');
      try {
        const variables = JSON.parse(fixedJson);
        if (typeof variables === 'object' && variables !== null) {
          Object.entries(variables).forEach(([key, value]) => {
            templateVariables[key] = typeof value === 'string' ? value : '';
          });
        }
      } catch {}
    }
    console.log('Template Variables on select:', templateVariables);
    setFormState(prev => ({
      ...prev,
      template: template[templateIndex('templateId')],
      templateTelegramId: template[templateIndex('telegramId')],
      price: parseFloat(template[templateIndex('price')] || '0'),
      renewal: parseFloat(template[templateIndex('renewal')] || '0'),
      templateVariables
    }));
    setSelectedTemplatePreview({
      images: getFirstUrl(rawImages),
      gifs: getFirstUrl(rawGifs),
      videos: getFirstUrl(rawVideos)
    });
  };

  const isValidUrl = (url: string | undefined) => {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
  };

  const renderTemplatePreview = () => {
    const { images, gifs, videos } = selectedTemplatePreview;


    if (isValidUrl(videos)) {
      return (
        <div className="relative group">
          <a href={videos} target="_blank" rel="noopener noreferrer">
            <video 
              src={videos} 
              controls 
              className="w-full h-64 object-cover rounded-lg cursor-pointer"
              poster={isValidUrl(images) ? images : undefined}
            />
          </a>
          <a href={videos} download target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-blue-700 font-semibold hidden group-hover:block">Download</a>
        </div>
      );
    }

    if (isValidUrl(gifs)) {
      return (
        <div className="relative group">
          <a href={gifs} target="_blank" rel="noopener noreferrer">
            <img 
              src={gifs} 
              alt="Template Preview (GIF)" 
              className="w-full h-64 object-cover rounded-lg cursor-pointer"
            />
          </a>
          <a href={gifs} download target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-blue-700 font-semibold hidden group-hover:block">Download</a>
        </div>
      );
    }

    if (isValidUrl(images)) {
      return (
        <div className="relative group">
          <a href={images} target="_blank" rel="noopener noreferrer">
            <img 
              src={images} 
              alt="Template Preview" 
              className="w-full h-64 object-cover rounded-lg cursor-pointer"
            />
          </a>
          <a href={images} download target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-blue-700 font-semibold hidden group-hover:block">Download</a>
        </div>
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
        // Validate template variables
        const hasEmptyRequiredVariables = Object.entries(formState.templateVariables)
          .filter(([key]) => !['FormId','formId','PostURL','postURL','Token','token'].includes(key))
          .some(([_, value]) => !value);
        if (hasEmptyRequiredVariables) {
          alert('Please fill in all template variables');
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

      setTelegramVerificationError('An unexpected error occurred during verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      const payload = {
        functionName: 'createProjectLink',
        title: formState.title,
        templateId: formState.template,
        templateVariables: JSON.stringify(formState.templateVariables),
        telegramId: formState.templateTelegramId || formState.telegramId,
        email: formState.email
      };

      const response = await securedApi.callBackendFunction(payload);

      if (response.success) {
        setResultModalProps({
          type: 'success',
          title: 'Project Created',
          message: 'Your project has been successfully created!',
          details: response.data
        });
        setShowResultModal(true);
        onSave(response.data);
        // Update app data after success
        try {
          await authApi.updateAppData(setAppData);
        } catch (e) {
          // Optionally handle updateAppData failure
        }
      } else {
        // Handle error scenarios
        setResultModalProps({
          type: 'error',
          title: 'Project Creation Failed',
          message: response.error || 'Failed to create project',
          details: response.details || {}
        });
        setShowResultModal(true);
        // Update app data after failure (optional)
        try {
          await authApi.updateAppData(setAppData);
        } catch (e) {
          // Optionally handle updateAppData failure
        }
      }
    } catch (error) {

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
    // If variablesJson is empty, null, or whitespace, render nothing
    if (!variablesJson || !variablesJson.trim()) return null;

    let fixedJson = variablesJson;
    try {
      // Remove all control characters (newlines, tabs, etc)
      fixedJson = fixedJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      // Remove trailing commas before } or ]
      fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1');
      // DO NOT replace double double-quotes, this breaks valid empty string values
      const variables = JSON.parse(fixedJson);
      if (typeof variables !== 'object' || variables === null) return null;
      const editableKeys = Object.keys(variables).filter(key => !['formId','FormId','postURL','PostURL','token','Token'].includes(key));
      if (editableKeys.length === 0) return null;
      return editableKeys.map(key => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <input
            type="text"
            value={formState.templateVariables[key] || ''}
            onChange={(e) => handleTemplateVariableChange(key, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
      ));
    } catch (err) {

      // Do not show user-facing error, just return nothing
      return null;
    }
  };

  // Render current stage
  const renderStage = () => {
    switch (formState.stage) {
      case 'template':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Template Selection</h2>
            
            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter project title"
                required
              />
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
              <select
                value={formState.category}
                onChange={(e) => {
                  setFormState(prev => ({
                    ...prev,
                    category: e.target.value,
                    template: '',
                    pageType: '',
                    templateVariables: {},
                  }));
                  setSelectedTemplatePreview({});
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="" className="dark:bg-gray-700">Select Category</option>
                {Array.from(new Set(filteredTemplates.map(t => t[getTemplateIndex('niche')]))).map(category => (
                  <option key={category} value={category} className="dark:bg-gray-700">{category}</option>
                ))}
              </select>
            </div>

            {/* Page Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Page Type</label>
              <select
                value={formState.pageType}
                onChange={(e) => {
                  setFormState(prev => ({
                    ...prev,
                    pageType: e.target.value,
                    template: '',
                    templateVariables: {},
                  }));
                  setSelectedTemplatePreview({});
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="" className="dark:bg-gray-700">Select Page Type</option>
                {Array.from(new Set(filteredTemplates.map(t => t[getTemplateIndex('type')]))).map(type => (
                  <option key={type} value={type} className="dark:bg-gray-700">{type}</option>
                ))}
              </select>
            </div>

            {formState.category && formState.pageType && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Template</label>
                <div>
                  <select
                    value={formState.template}
                    onChange={(e) => {
                      const selectedTemplate = filteredTemplates.find(
                        template => template[getTemplateIndex('templateId')] === e.target.value
                      );
                      if (selectedTemplate) {
                        handleTemplateSelection(selectedTemplate);
                      } else {
                        setFormState(prev => ({ ...prev, template: '', templateVariables: {} }));
                        setSelectedTemplatePreview({});
                      }
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="" className="dark:bg-gray-700">Select Template</option>
                    {filteredTemplates
                      .filter(t => 
                        t[getTemplateIndex('niche')] === formState.category && 
                        t[getTemplateIndex('type')] === formState.pageType
                      )
                      .map(template => {
                        const price = parseFloat(template[getTemplateIndex('price')] || '0');
                        return (
                          <option 
                            key={template[getTemplateIndex('templateId')]} 
                            value={template[getTemplateIndex('templateId')]}
                            className="dark:bg-gray-700"
                          >
                            {template[getTemplateIndex('name')]} - ${price.toFixed(2)}
                          </option>
                        );
                      })
                    }
                  </select>
                  <div className="mt-4">
                    {renderTemplatePreview()}
                  </div>
                </div>
                {/* Show selected template price and renewal price */}
                {formState.template && formState.price && formState.price > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm dark:text-blue-200">
                    <span className="font-semibold">Template Price:</span> ${formState.price?.toFixed(2)}
                    {formState.renewal !== undefined && formState.renewal > 0 && (
                      <span className="ml-4 font-semibold">Renewal Price:</span>
                    )}
                    {formState.renewal !== undefined && formState.renewal > 0 && (
                      <span> ${formState.renewal?.toFixed(2) || '0.00'}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Template Variables */}
            {formState.template && renderTemplateVariables()}
          </div>
        );

      case 'notification-setup':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Notification Setup</h2>
            
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200" role="alert">
              <p className="font-bold">Telegram Setup Steps:</p>
              <ol className="list-decimal list-inside mt-2">
                <li>Create a Telegram group</li>
                <li>Add @getidsbot to the group</li>
                <li>Copy the chat ID shown in the automatic message</li>
                <li>Add @WebFixxBot to the group chat</li>
                <li>Enter the chat ID below</li>
              </ol>
            </div>
            
            {/* Telegram ID */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Telegram ID (Required)</label>
              <input
                type="text"
                value={formState.telegramId}
                onChange={(e) => setFormState(prev => ({ ...prev, telegramId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter Telegram ID"
                required
              />
            </div>

            {/* Optional Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email (Optional)</label>
              <input
                type="email"
                value={formState.email || ''}
                onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter email address (Optional)"
              />
            </div>
          </div>
        );

      case 'telegram-verification':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Telegram Verification</h2>
              <button
                onClick={() => setFormState(prev => ({ ...prev, stage: 'notification-setup' }))}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
              >
                Change Telegram ID
              </button>
            </div>
            
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200" role="alert">
              <p className="font-bold">Test Connection</p>
              <p className="mt-2">We'll send a test message to your Telegram group to verify the connection. Click the button below to proceed.</p>
            </div>

            {telegramVerificationError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-200" role="alert">
                <p className="font-bold">Connection Failed</p>
                <p className="mt-2">We couldn't send a test message to your Telegram group. Please check:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>The Telegram ID is correct</li>
                  <li>@WebFixxBot is added to your group</li>
                  <li>The bot has permission to send messages</li>
                </ul>
                <p className="mt-2">Error: {telegramVerificationError}</p>
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
                    Sending Test Message...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>
          </div>
        );
      case 'confirmation':
        // Find the selected template object to get its name
        const selectedTemplateObj = availableTemplates.find(
          t => t[getTemplateIndex('templateId')] === formState.template
        );
        const selectedTemplateName = selectedTemplateObj ? selectedTemplateObj[getTemplateIndex('name')] : '';
        return (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">Confirm Link Details</h2>
            <div className="space-y-6">
              {/* Template Details Card */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border dark:bg-gray-700 dark:shadow-none dark:border-gray-600">
                <h3 className="font-semibold mb-3 text-blue-700 text-base flex items-center dark:text-blue-300">
                  <FontAwesomeIcon icon={faCheck} className="mr-2 text-blue-500" />Template Details
                </h3>
                <dl className="grid grid-cols-1 gap-x-3 gap-y-1">
                  <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-600"><dt className="font-medium dark:text-gray-300">Title:</dt><dd className="dark:text-gray-200">{formState.title}</dd></div>
                  <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-600"><dt className="font-medium dark:text-gray-300">Category:</dt><dd className="dark:text-gray-200">{formState.category}</dd></div>
                  <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-600"><dt className="font-medium dark:text-gray-300">Page Type:</dt><dd className="dark:text-gray-200">{formState.pageType}</dd></div>
                  {selectedTemplateName && (
                    <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-600"><dt className="font-medium dark:text-gray-300">Template Name:</dt><dd className="dark:text-gray-200">{selectedTemplateName}</dd></div>
                  )}
                  {formState.price && formState.price > 0 && (
                    <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-600"><dt className="font-medium dark:text-gray-300">Template Price:</dt><dd className="dark:text-gray-200">${formState.price?.toFixed(2)}</dd></div>
                  )}
                  {formState.renewal !== undefined && formState.renewal > 0 && (
                    <div className="flex justify-between py-1"><dt className="font-medium dark:text-gray-300">Renewal Price:</dt><dd className="dark:text-gray-200">${formState.renewal?.toFixed(2) || '0.00'}</dd></div>
                  )}
                </dl>
              </div>

              {/* Template Variables Card */}
              {Object.keys(formState.templateVariables).filter(key => !['FormId','formId','PostURL','postURL','Token','token'].includes(key)).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm border dark:bg-gray-700 dark:shadow-none dark:border-gray-600">
                  <h3 className="font-semibold mb-3 text-blue-700 text-base flex items-center dark:text-blue-300">
                    <FontAwesomeIcon icon={faCheck} className="mr-2 text-blue-500" />Template Variables
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-3 gap-y-1">
                    {Object.entries(formState.templateVariables)
                      .filter(([key]) => !['FormId','formId','PostURL','postURL','Token','token'].includes(key))
                      .map(([key, value]) => (
                        <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-600" key={key}>
                          <dt className="font-medium dark:text-gray-300">{key}</dt>
                          <dd className="dark:text-gray-200">{value}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              )}

              {/* Telegram Details Card */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border dark:bg-gray-700 dark:shadow-none dark:border-gray-600">
                <h3 className="font-semibold mb-3 text-blue-700 text-base flex items-center dark:text-blue-300">
                  <FontAwesomeIcon icon={faCheck} className="mr-2 text-blue-500" />Telegram Details
                </h3>
                <dl className="grid grid-cols-1 gap-x-3 gap-y-1">
                  <div className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-600"><dt className="font-medium dark:text-gray-300">Telegram ID:</dt><dd className="dark:text-gray-200">{formState.telegramId}</dd></div>
                  {formState.email && (
                    <div className="flex justify-between py-1"><dt className="font-medium dark:text-gray-300">Email:</dt><dd className="dark:text-gray-200">{formState.email}</dd></div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-none w-full max-w-md mx-4 flex flex-col min-h-[200px] max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Link</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1 dark:bg-gray-900">
          {renderStage()}
        </div>

        {/* Modal Footer with Navigation */}
        <div className="flex justify-between p-4 border-t dark:border-gray-700">
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
