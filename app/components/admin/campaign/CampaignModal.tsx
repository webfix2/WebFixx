"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faSpinner, 
  faEdit, 
  faPlus, 
  faTrash 
} from '@fortawesome/free-solid-svg-icons';
import type { Campaign, SMTPSetting, CSVAnalytics } from '../../../types';

interface CampaignModalProps {
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
}

export function CampaignModal({ onClose, onSave }: CampaignModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Campaign>({
    name: '',
    type: 'general',
    subject: '',
    smtpSettings: [],
    template: '',
  });
  const [csvAnalytics, setCsvAnalytics] = useState<CSVAnalytics | null>(null);
  const [editingSMTP, setEditingSMTP] = useState<SMTPSetting | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setLoading(true);
    const file = e.target.files[0];
    
    try {
      // TODO: Upload file and get URL
      const fileUrl = 'placeholder_url';
      
      // TODO: Analyze CSV with AI
      const analytics: CSVAnalytics = {
        totalRows: 100,
        headers: ['email', 'name', 'status'],
        preview: [],
        summary: 'AI-generated summary of the data...',
      };
      
      setCsvAnalytics(analytics);
      setFormData(prev => ({ ...prev, fileUrl }));
      setStep(2);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSMTP = () => {
    if (!editingSMTP) return;
    
    setFormData(prev => ({
      ...prev,
      smtpSettings: [...prev.smtpSettings, editingSMTP]
    }));
    setEditingSMTP(null);
  };

  const renderSMTPForm = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium">Add SMTP Server</h4>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Host"
          className="p-2 border rounded"
          value={editingSMTP?.host || ''}
          onChange={e => setEditingSMTP(prev => ({ ...prev!, host: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Port"
          className="p-2 border rounded"
          value={editingSMTP?.port || ''}
          onChange={e => setEditingSMTP(prev => ({ ...prev!, port: Number(e.target.value) }))}
        />
      </div>
      <input
        type="email"
        placeholder="From Email"
        className="w-full p-2 border rounded"
        value={editingSMTP?.from_email || ''}
        onChange={e => setEditingSMTP(prev => ({ ...prev!, from_email: e.target.value }))}
      />
      <input
        type="text"
        placeholder="Username"
        className="w-full p-2 border rounded"
        value={editingSMTP?.username || ''}
        onChange={e => setEditingSMTP(prev => ({ ...prev!, username: e.target.value }))}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded"
        value={editingSMTP?.password || ''}
        onChange={e => setEditingSMTP(prev => ({ ...prev!, password: e.target.value }))}
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setEditingSMTP(null)}
          className="px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleAddSMTP}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Server
        </button>
      </div>
    </div>
  );

  const renderSMTPList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">SMTP Servers ({formData.smtpSettings.length})</h4>
        <button
          onClick={() => setEditingSMTP({ host: '', port: 587, username: '', password: '', from_email: '' })}
          className="text-blue-600 hover:text-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {formData.smtpSettings.map((smtp, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-medium">{smtp.from_email}</p>
              <p className="text-xs text-gray-500">{smtp.host}:{smtp.port}</p>
            </div>
            <button
              onClick={() => {
                const newSettings = [...formData.smtpSettings];
                newSettings.splice(index, 1);
                setFormData(prev => ({ ...prev, smtpSettings: newSettings }));
              }}
              className="text-red-600 hover:text-red-800"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
        
        {/* Step indicators */}
        <div className="flex justify-between mb-8">
          {['Upload CSV', 'Campaign Details', 'Review & Launch'].map((label, i) => (
            <div key={i} className={`flex items-center ${i + 1 <= step ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${i + 1 <= step ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                {i + 1}
              </div>
              <span className="ml-2">{label}</span>
              {i < 2 && <div className={`h-0.5 w-12 mx-4 ${i + 1 < step ? 'bg-blue-600' : 'bg-gray-300'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csvUpload"
              />
              <label htmlFor="csvUpload" className="cursor-pointer">
                <FontAwesomeIcon icon={loading ? faSpinner : faUpload} className={`w-8 h-8 mb-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Campaign Details */}
        {step === 2 && (
          <div className="space-y-6">
            {/* CSV Summary */}
            {csvAnalytics && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">CSV Analysis</h3>
                <p className="text-sm text-gray-600">{csvAnalytics.summary}</p>
                <div className="mt-2">
                  <span className="text-xs font-medium">Total Rows: </span>
                  <span className="text-xs text-gray-600">{csvAnalytics.totalRows}</span>
                </div>
              </div>
            )}

            {/* Campaign Form */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Campaign Name"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <input
                type="text"
                placeholder="Subject Line"
                className="w-full p-2 border rounded"
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              />
              
              <select
                className="w-full p-2 border rounded"
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as Campaign['type'] }))}
              >
                <option value="general">General</option>
                <option value="email_logs">Email Logs</option>
                <option value="bank_logs">Bank Logs</option>
              </select>

              {/* Template Selection */}
              <select
                className="w-full p-2 border rounded"
                value={formData.template}
                onChange={e => setFormData(prev => ({ ...prev, template: e.target.value }))}
              >
                <option value="">Select Template</option>
                {/* Add your templates here */}
              </select>

              {/* SMTP Settings */}
              <div className="border-t pt-4">
                {editingSMTP ? renderSMTPForm() : renderSMTPList()}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Launch */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Campaign Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Campaign Details</h3>
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium capitalize">{formData.type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Subject</p>
                  <p className="font-medium">{formData.subject}</p>
                </div>
                <div>
                  <p className="text-gray-500">Selected SMTPs</p>
                  <p className="font-medium">{formData.smtpSettings.length} servers</p>
                </div>
              </div>
            </div>

            {/* CSV Data Preview */}
            {csvAnalytics && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">CSV Data</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Total Recipients: {csvAnalytics.totalRows}</p>
                  <div className="text-sm text-gray-500">
                    <p>Headers:</p>
                    <p className="font-mono text-xs">{csvAnalytics.headers.join(', ')}</p>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        {csvAnalytics.headers.map(header => (
                          <th key={header} className="px-2 py-1 text-left">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvAnalytics.preview.slice(0, 3).map((row, i) => (
                        <tr key={i}>
                          {csvAnalytics.headers.map(header => (
                            <td key={header} className="px-2 py-1 border-t">{row[header]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-400 mt-2">Showing first 3 rows</p>
                </div>
              </div>
            )}

            {/* Launch Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-4">Launch Configuration</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox" />
                  <span className="text-sm">Enable rate limiting (recommended)</span>
                </label>
                <div className="text-sm text-gray-500">
                  Estimated completion time: ~2 hours
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <div className="space-x-2">
            {step > 1 && (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => onSave(formData)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                Launch Campaign
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}