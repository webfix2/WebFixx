"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRotateRight } from '@fortawesome/free-solid-svg-icons';

interface WireSenderData {
  campaign: string;
  messageIdentifier: string;
  emailSubject: string;
  emailTemplate: string;
  sendStatus: string;
  lastUpdated: string;
  recipientEmail: string;
  recipientName: string;
}

interface SocialSenderData {
  campaign: string;
  messageIdentifier: string;
  messageTemplate: string;
  sendStatus: string;
  lastUpdated: string;
  recipientHandle: string;
  recipientName: string;
  platform: string;
}

interface ShootContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  item?: any;
  category?: 'WIRE' | 'SOCIAL';
}

const safeParseJSON = (jsonString: string) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
};

export const ShootContactsModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  item,
  category
}: ShootContactsModalProps) => {
  const [showSetupFlow, setShowSetupFlow] = useState(false);
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({
    campaign: '',
    emailTemplate: '',
    templateVariables: {},
    selectedLink: ''
  });
  const [currentItem, setCurrentItem] = useState<any>(null);

  useEffect(() => {
    if (item) {
      setCurrentItem(item);
    }
  }, [item]);

  // Debug logs
  console.log('ShootContactsModal Props:', {
    category,
    itemId: currentItem?.id,
    canWireSender: currentItem?.canWireSender,
    canSocialSender: currentItem?.canSocialSender,
    wireSenderJSON: currentItem?.wireSenderJSON,
    socialSenderJSON: currentItem?.socialSenderJSON,
    wireSendStatus: currentItem?.wireSendStatus,
    socialSendStatus: currentItem?.socialSendStatus
  });

  const canShoot = category === 'WIRE' 
    ? (currentItem?.canWireSender === 'TRUE' && currentItem?.wireSenderJSON && currentItem?.wireSenderJSON !== '[]')
    : (currentItem?.canSocialSender === 'TRUE' && currentItem?.socialSenderJSON && currentItem?.socialSenderJSON !== '[]');

  console.log('Can Shoot:', canShoot);

  const senderData = category === 'WIRE'
    ? safeParseJSON(currentItem?.wireSenderJSON || '[]')
    : safeParseJSON(currentItem?.socialSenderJSON || '[]');

  console.log('Sender Data:', senderData);

  const sendStatus = category === 'WIRE' ? currentItem?.wireSendStatus : currentItem?.socialSendStatus;
  const canReshoot = ['WAITING', 'COMPLETED', 'FAILED'].includes(sendStatus);

  if (!isOpen) return null;

  const handleNext = () => setStage(prev => Math.min(prev + 1, 5));
  const handleBack = () => setStage(prev => Math.max(prev - 1, 1));
  
  const handleSubmit = async () => {
    await onSubmit({
      ...formData,
      id: currentItem?.id,
      category
    });
    setShowSetupFlow(false);
    setStage(1);
  };

  const getSendStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderSetupFlow = () => {
    switch (stage) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Choose Campaign</h3>
            <p className="text-sm text-gray-500">
              Current item: {currentItem?.title} ({category})
            </p>
            <select 
              value={formData.campaign}
              onChange={(e) => setFormData(prev => ({ ...prev, campaign: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a campaign</option>
              <option value="campaign1">Campaign 1</option>
              <option value="campaign2">Campaign 2</option>
            </select>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Template</h3>
            <div className="grid grid-cols-2 gap-4">
              {category === 'WIRE' ? (
                <>
                  <div 
                    className={`p-4 border rounded cursor-pointer ${
                      formData.emailTemplate === 'template1' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, emailTemplate: 'template1' }))}
                  >
                    <h4 className="font-medium">Professional Template</h4>
                    <p className="text-sm text-gray-500">Formal communication style</p>
                  </div>
                  <div 
                    className={`p-4 border rounded cursor-pointer ${
                      formData.emailTemplate === 'template2' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, emailTemplate: 'template2' }))}
                  >
                    <h4 className="font-medium">Casual Template</h4>
                    <p className="text-sm text-gray-500">Friendly communication style</p>
                  </div>
                </>
              ) : (
                <>
                  <div 
                    className={`p-4 border rounded cursor-pointer ${
                      formData.emailTemplate === 'social1' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, emailTemplate: 'social1' }))}
                  >
                    <h4 className="font-medium">DM Template</h4>
                    <p className="text-sm text-gray-500">Direct message style</p>
                  </div>
                  <div 
                    className={`p-4 border rounded cursor-pointer ${
                      formData.emailTemplate === 'social2' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, emailTemplate: 'social2' }))}
                  >
                    <h4 className="font-medium">Comment Template</h4>
                    <p className="text-sm text-gray-500">Public comment style</p>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customize Template Variables</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Greeting</label>
                <input
                  type="text"
                  className="mt-1 w-full p-2 border rounded"
                  placeholder="Enter greeting"
                  value={formData.templateVariables.greeting || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    templateVariables: {
                      ...prev.templateVariables,
                      greeting: e.target.value
                    }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message Body</label>
                <textarea
                  className="mt-1 w-full p-2 border rounded h-32"
                  placeholder="Enter message body"
                  value={formData.templateVariables.body || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    templateVariables: {
                      ...prev.templateVariables,
                      body: e.target.value
                    }
                  }))}
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Link Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-4 border rounded cursor-pointer ${
                  formData.selectedLink === 'tracking' ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, selectedLink: 'tracking' }))}
              >
                <h4 className="font-medium">Tracking Link</h4>
                <p className="text-sm text-gray-500">Include click tracking</p>
              </div>
              <div 
                className={`p-4 border rounded cursor-pointer ${
                  formData.selectedLink === 'direct' ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, selectedLink: 'direct' }))}
              >
                <h4 className="font-medium">Direct Link</h4>
                <p className="text-sm text-gray-500">No tracking included</p>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review and Confirm</h3>
            <div className="bg-gray-50 p-4 rounded space-y-3">
              <div>
                <span className="font-medium">Campaign:</span> {formData.campaign}
              </div>
              <div>
                <span className="font-medium">Template:</span> {formData.emailTemplate}
              </div>
              <div>
                <span className="font-medium">Link Type:</span> {formData.selectedLink}
              </div>
              <div>
                <span className="font-medium">Recipients:</span> {senderData.length}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTable = () => {
    if (!canShoot) {
      return (
        <div className="text-center py-8 text-gray-500">
          Please extract the {category === 'WIRE' ? 'box' : 'account'} to be able to shoot the contacts
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {category === 'WIRE' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Send Status</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient Handle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Send Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {senderData.map((data: WireSenderData | SocialSenderData, index: number) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{data.recipientName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {category === 'WIRE' 
                    ? (data as WireSenderData).recipientEmail 
                    : (data as SocialSenderData).recipientHandle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSendStatusColor(data.sendStatus)}`}>
                    {data.sendStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {showSetupFlow ? 'Setup Message Campaign' : 'Message Status'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        {showSetupFlow ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stage > i ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {renderSetupFlow()}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowSetupFlow(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Back to Status
              </button>
              {stage < 5 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Messages'}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {renderTable()}
            {canShoot && !showSetupFlow && canReshoot && senderData.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowSetupFlow(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                  New Campaign
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};