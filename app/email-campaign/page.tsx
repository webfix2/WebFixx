"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faChevronRight,
  faChevronDown 
} from '@fortawesome/free-solid-svg-icons';
import { useAppState } from '../context/AppContext';
import { CampaignModal } from '../components/admin/campaign/CampaignModal';
import { CampaignAnalytics } from '../components/admin/campaign/CampaignAnalytics';
import type { Campaign, SMTPSetting } from '../types';

export default function EmailCampaign() {
  const { appData } = useAppState();
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const campaigns = appData?.data?.sender || [];

  const handleSaveCampaign = async (campaign: Partial<Campaign>) => {
    // TODO: Implement campaign save
    setShowCampaignModal(false);
  };

  const handleUpdateCampaignSMTP = async (campaignId: string, smtpSettings: SMTPSetting[]) => {
    try {
      // TODO: Implement API call to update campaign SMTP settings
      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign.id === campaignId) {
          return { ...campaign, smtpSettings };
        }
        return campaign;
      });
      // Update state or trigger refetch
    } catch (error) {
      console.error('Error updating SMTP settings:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
        <button
          onClick={() => setShowCampaignModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
          New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign: Campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow">
            {/* Campaign Header - Clickable */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedCampaign(
                selectedCampaign === campaign.id ? null : campaign.id
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <FontAwesomeIcon 
                    icon={selectedCampaign === campaign.id ? faChevronDown : faChevronRight} 
                    className="w-4 h-4 text-gray-400"
                  />
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      {campaign.analytics?.sent || 0} / {campaign.analytics?.totalRows || 0} sent
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
            </div>

            {/* Campaign Analytics - Expandable */}
            {selectedCampaign === campaign.id && (
              <div className="border-t">
                <CampaignAnalytics 
                  campaign={campaign}
                  onUpdateSMTP={handleUpdateCampaignSMTP}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          onClose={() => setShowCampaignModal(false)}
          onSave={handleSaveCampaign}
        />
      )}
    </div>
  );
}