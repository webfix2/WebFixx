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
    <div className="border rounded-lg dark:border-gray-700">
      <div 
        onClick={() => setOpenSection(openSection === section ? null : section)}
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
      >
        <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        <FontAwesomeIcon icon={openSection === section ? faChevronUp : faChevronDown} />
      </div>
      {openSection === section && (
        <div className="p-4 border-t dark:border-gray-700">
          <SettingsComponent 
            project={project} 
            onSave={(updatedData: Partial<Project>) => handleSave(section, updatedData)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-none w-full max-w-2xl mx-4">
        {/* Modal Header */}
        <div className="relative p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          {/* Absolute X button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 z-10"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              {project.projectTitle}
            </h2>
            {/* Project summary row */}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1 text-sm text-gray-700 dark:text-gray-200">
              <span><span className="font-semibold dark:text-gray-300">Template:</span> {project.templateTitle}</span>
              <span><span className="font-semibold dark:text-gray-300">Type:</span> {project.projectType}</span>
              <span><span className="font-semibold dark:text-gray-300">Expiry:</span> {project.expiryDate}</span>
            </div>
            {/* URLs as styled links with copy, each on its own row */}
            {project.pageURL && (
              <div className="flex items-center text-xs bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded w-fit mt-2 dark:text-blue-200">
                <span className="font-semibold mr-1">Page URL:</span>
                <a
                  href={project.pageURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-1 underline text-blue-700 dark:text-blue-400 truncate max-w-[160px] md:max-w-[280px]"
                  title={project.pageURL}
                >
                  {project.pageURL}
                </a>
                <button
                  className="ml-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300"
                  title="Copy Page URL"
                  onClick={() => navigator.clipboard.writeText(project.pageURL || '')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8m-2 8v2a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m-6 4v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
                </button>
              </div>
            )}
            {project.domainURL && (
              <div className="flex items-center text-xs bg-green-50 dark:bg-green-900 px-2 py-1 rounded w-fit mt-2 dark:text-green-200">
                <span className="font-semibold mr-1">Domain URL:</span>
                <a
                  href={project.domainURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-1 underline text-green-700 dark:text-green-400 truncate max-w-[160px] md:max-w-[280px]"
                  title={project.domainURL}
                >
                  {project.domainURL}
                </a>
                <button
                  className="ml-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-300"
                  title="Copy Domain URL"
                  onClick={() => navigator.clipboard.writeText(project.domainURL || '')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8m-2 8v2a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m-6 4v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
                </button>
              </div>
            )}
            {project.redirectURL && (
              <div className="flex items-center text-xs bg-yellow-50 dark:bg-yellow-900 px-2 py-1 rounded w-fit mt-2 dark:text-yellow-200">
                <span className="font-semibold mr-1">Redirect URL:</span>
                <a
                  href={project.redirectURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-1 underline text-yellow-700 dark:text-yellow-400 truncate max-w-[160px] md:max-w-[280px]"
                  title={project.redirectURL}
                >
                  {project.redirectURL}
                </a>
                <button
                  className="ml-1 text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-300"
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
        <div className="p-4 space-y-4 overflow-y-auto dark:bg-gray-900" style={{ maxHeight: '70vh' }}>
          {renderSettingsSection('Template Variables', 'templateVariables', TemplateVariablesSettings)}
          {renderSettingsSection('Notification Settings', 'notifications', NotificationSettings)}
          {renderSettingsSection('Redirect Protection', 'redirectProtection', RedirectProtectionSettings)}
          {renderSettingsSection('Expiry and Renewal', 'expiry', ExpiryRenewalSettings)}
          {renderSettingsSection('Domain Management', 'domain', DomainManagementSettings)}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-end">
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
