"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faCheckCircle, 
  faTimesCircle, 
  faChartBar,
  faDownload,
  faCog,
  faTrash,
  faPlus,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import type { Campaign, SMTPConfig } from '../../../types';

interface CampaignAnalyticsProps {
  campaign: Campaign;
  onUpdateSMTP: (campaignId: string, smtpSettings: SMTPConfig[]) => void;
}

export function CampaignAnalytics({ campaign, onUpdateSMTP }: CampaignAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSMTPSettings, setShowSMTPSettings] = useState(false);
  const [editingSMTP, setEditingSMTP] = useState<{ index: number; config: SMTPConfig } | null>(null);

  const stats = [
    { label: 'Total', value: campaign.analytics?.totalRows || 0, icon: faEnvelope },
    { label: 'Sent', value: campaign.analytics?.sent || 0, icon: faCheckCircle },
    { label: 'Delivered', value: campaign.analytics?.delivered || 0, icon: faCheckCircle },
    { label: 'Failed', value: campaign.analytics?.failed || 0, icon: faTimesCircle },
  ];

  const downloadCSV = async () => {
    try {
      const response = await fetch(campaign.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign.name}-data.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  const handleAddUpdateSMTP = (smtp: SMTPConfig, index?: number) => {
    const newSettings = [...campaign.smtpSettings];
    if (typeof index === 'number') {
      newSettings[index] = smtp;
    } else {
      newSettings.push(smtp);
    }
    onUpdateSMTP(campaign.id, newSettings);
    setEditingSMTP(null);
  };

  const renderSMTPForm = () => {
    const config = editingSMTP?.config || {
      host: '',
      port: 587,
      username: '',
      password: '',
      from_email: ''
    };

    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium">{editingSMTP ? 'Edit' : 'Add'} SMTP Server</h4>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Host"
            className="p-2 border rounded"
            value={config.host}
            onChange={e => setEditingSMTP(prev => ({
              index: prev?.index || -1,
              config: { ...prev?.config!, host: e.target.value }
            }))}
          />
          <input
            type="number"
            placeholder="Port"
            className="p-2 border rounded"
            value={config.port}
            onChange={e => setEditingSMTP(prev => ({
              index: prev?.index || -1,
              config: { ...prev?.config!, port: Number(e.target.value) }
            }))}
          />
        </div>
        <input
          type="email"
          placeholder="From Email"
          className="w-full p-2 border rounded"
          value={config.from_email}
          onChange={e => setEditingSMTP(prev => ({
            index: prev?.index || -1,
            config: { ...prev?.config!, from_email: e.target.value }
          }))}
        />
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded"
          value={config.username}
          onChange={e => setEditingSMTP(prev => ({
            index: prev?.index || -1,
            config: { ...prev?.config!, username: e.target.value }
          }))}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={config.password}
          onChange={e => setEditingSMTP(prev => ({
            index: prev?.index || -1,
            config: { ...prev?.config!, password: e.target.value }
          }))}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setEditingSMTP(null)}
            className="px-3 py-1 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAddUpdateSMTP(config, editingSMTP?.index)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingSMTP ? 'Update' : 'Add'} Server
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold">{campaign.name}</h2>
          <p className="text-sm text-gray-500">Created on {new Date(campaign.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={downloadCSV}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-1" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon 
                icon={stat.icon} 
                className={`w-5 h-5 ${
                  stat.label === 'Failed' ? 'text-red-500' : 'text-blue-500'
                }`} 
              />
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Sending Progress</h3>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ 
              width: `${(campaign.analytics?.sent || 0) / (campaign.analytics?.totalRows || 1) * 100}%` 
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{campaign.analytics?.sent || 0} sent</span>
          <span>{campaign.analytics?.totalRows || 0} total</span>
        </div>
      </div>

      {/* SMTP Settings Section */}
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">SMTP Settings</h3>
          <button
            onClick={() => setShowSMTPSettings(!showSMTPSettings)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-1" />
            {showSMTPSettings ? 'Hide Settings' : 'Show Settings'}
          </button>
        </div>

        {showSMTPSettings && (
          <div className="space-y-4">
            {editingSMTP ? (
              renderSMTPForm()
            ) : (
              <>
                {campaign.smtpSettings.map((smtp, index) => (
                  <div key={smtp.id || index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{smtp.from_email}</h4>
                        <p className="text-sm text-gray-500">{smtp.host}:{smtp.port}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingSMTP({ index, config: { ...smtp } })}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const updatedSettings = [...campaign.smtpSettings];
                            updatedSettings.splice(index, 1);
                            onUpdateSMTP(campaign.id, updatedSettings);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setEditingSMTP({ index: -1, config: {
                    host: '',
                    port: 587,
                    username: '',
                    password: '',
                    from_email: ''
                  }})}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                  Add SMTP Server
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}