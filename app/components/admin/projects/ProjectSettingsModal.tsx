import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faChevronUp, 
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

import { 
  TemplateVariablesSettings, 
  NotificationSettings, 
  RedirectProtectionSettings, 
  ExpiryRenewalSettings, 
  DomainManagementSettings 
} from './settings';

interface Project {
  id: string;
  formId: string;
  projectId: string;
  projectType: string;
  projectTitle: string;
  templateNiche: string;
  templateTitle: string;
  templateType: string;
  pageHealth: string;
  redirectId?: string;
  redirectURL?: string;
  redirectHealth?: string;
  domainId?: string;
  domainURL?: string;
  domainHealth?: string;
  pageVisits: number;
  botVisits: number;
  flaggedVisits: number;
  expiryDate: string;
  response: string;
  email?: string;
  telegramGroupId?: string;
  responseCount: number;
  responses: any[];
  templateVariables: string;
  systemStatus: string;
  pageURL?: string;
  templateId: string;
  links?: any[];
}

interface ProjectSettingsModalProps {
  project: Project;
  onClose: () => void;
  onSave?: (updatedProject: Partial<Project>) => void;
}

export default function ProjectSettingsModal({ project, onClose, onSave }: ProjectSettingsModalProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleSave = (section: string, updatedData: Partial<Project>) => {
    if (onSave) {
      onSave(updatedData);
    }
    setOpenSection(null);
  };

  const renderSettingsSection = (title: string, section: string, SettingsComponent: React.ComponentType<any>) => (
    <div className="border rounded-lg">
      <div 
        onClick={() => setOpenSection(openSection === section ? null : section)}
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <FontAwesomeIcon icon={openSection === section ? faChevronUp : faChevronDown} />
      </div>
      {openSection === section && (
        <div className="p-4 border-t">
          <SettingsComponent 
            project={project} 
            onSave={(updatedData: Partial<Project>) => handleSave(section, updatedData)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Modal Header */}
        <div className="relative p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          {/* Absolute X button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              {project.projectTitle}
            </h2>
            {/* Project summary row */}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1 text-sm">
              <span><span className="font-semibold">Template:</span> {project.templateTitle}</span>
              <span><span className="font-semibold">Type:</span> {project.projectType}</span>
              <span><span className="font-semibold">Expiry:</span> {project.expiryDate}</span>
            </div>
            {/* URLs as styled links with copy, each on its own row */}
            {project.pageURL && (
              <div className="flex items-center text-xs bg-blue-50 px-2 py-1 rounded w-fit mt-2">
                <span className="font-semibold mr-1">Page URL:</span>
                <a
                  href={project.pageURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-1 underline text-blue-700 truncate max-w-[160px] md:max-w-[280px]"
                  title={project.pageURL}
                >
                  {project.pageURL}
                </a>
                <button
                  className="ml-1 text-gray-500 hover:text-blue-600"
                  title="Copy Page URL"
                  onClick={() => navigator.clipboard.writeText(project.pageURL || '')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8m-2 8v2a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m-6 4v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
                </button>
              </div>
            )}
            {project.domainURL && (
              <div className="flex items-center text-xs bg-green-50 px-2 py-1 rounded w-fit mt-2">
                <span className="font-semibold mr-1">Domain URL:</span>
                <a
                  href={project.domainURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-1 underline text-green-700 truncate max-w-[160px] md:max-w-[280px]"
                  title={project.domainURL}
                >
                  {project.domainURL}
                </a>
                <button
                  className="ml-1 text-gray-500 hover:text-green-600"
                  title="Copy Domain URL"
                  onClick={() => navigator.clipboard.writeText(project.domainURL || '')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8m-2 8v2a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m-6 4v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
                </button>
              </div>
            )}
            {project.redirectURL && (
              <div className="flex items-center text-xs bg-yellow-50 px-2 py-1 rounded w-fit mt-2">
                <span className="font-semibold mr-1">Redirect URL:</span>
                <a
                  href={project.redirectURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-1 underline text-yellow-700 truncate max-w-[160px] md:max-w-[280px]"
                  title={project.redirectURL}
                >
                  {project.redirectURL}
                </a>
                <button
                  className="ml-1 text-gray-500 hover:text-yellow-600"
                  title="Copy Redirect URL"
                  onClick={() => navigator.clipboard.writeText(project.redirectURL || '')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8m-2 8v2a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m-6 4v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Content (scrollable) */}
        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {renderSettingsSection('Template Variables', 'templateVariables', TemplateVariablesSettings)}
          {renderSettingsSection('Notification Settings', 'notifications', NotificationSettings)}
          {renderSettingsSection('Redirect Protection', 'redirectProtection', RedirectProtectionSettings)}
          {renderSettingsSection('Expiry and Renewal', 'expiry', ExpiryRenewalSettings)}
          {renderSettingsSection('Domain Management', 'domain', DomainManagementSettings)}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end">
          <button 
            onClick={onClose} 
            className="btn-secondary mr-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}