"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCog, faPlus } from '@fortawesome/free-solid-svg-icons';

interface SMTPConfig {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  smtp_config_id: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  created_at: string;
}

export default function EmailCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [smtpConfigs, setSmtpConfigs] = useState<SMTPConfig[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="btn-secondary"
          >
            <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-2" />
            SMTP Settings
          </button>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="btn-primary"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Campaign Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {campaign.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{campaign.subject}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    campaign.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'running'
                      ? 'bg-blue-100 text-blue-800'
                      : campaign.status === 'scheduled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SMTP Settings Modal */}
      {showSettingsModal && (
        <SMTPSettingsModal
          smtpConfigs={smtpConfigs}
          onClose={() => setShowSettingsModal(false)}
          onSave={(config) => {
            // Handle SMTP config save
            setShowSettingsModal(false);
          }}
        />
      )}

      {/* New Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          smtpConfigs={smtpConfigs}
          onClose={() => setShowCampaignModal(false)}
          onSave={(campaign) => {
            // Handle campaign save
            setShowCampaignModal(false);
          }}
        />
      )}
    </div>
  );
}

// Add these components in separate files
function SMTPSettingsModal({ smtpConfigs, onClose, onSave }) {
  // Implementation for SMTP settings modal
}

function CampaignModal({ smtpConfigs, onClose, onSave }) {
  // Implementation for campaign modal
}