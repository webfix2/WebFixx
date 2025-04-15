"use client";

import { useState, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { securedApi, authApi } from '../../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import TransactionResultModal from '../components/TransactionResultModal';
import CreateLinkModal from '../components/admin/projects/CreateLinkModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSync, 
  faCopy, 
  faGlobe,
  faPlus,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';

interface ProjectLink {
  id: string;
  name: string;
  originalUrl: string;
  redirectUrl: string;
  domain: string;
  created_at: string;
  status: 'active' | 'inactive';
}

export default function ProjectLinks() {
  const { appData, setAppData } = useAppState();
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalProps, setResultModalProps] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
    details: {}
  });

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const projectLinks = appData?.data?.projects?.data || [];
        setLinks(projectLinks.map((link: any[]) => ({
          id: link[0],
          name: link[4],
          originalUrl: link[1],
          redirectUrl: link[2],
          domain: link[3],
          created_at: link[5],
          status: link[6].toLowerCase() as 'active' | 'inactive'
        })));
      } catch (error) {
        console.error('Error fetching project links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [appData]);

  const handleCreateLink = async (data: any) => {
    try {
      const response = await securedApi.callBackendFunction({
        functionName: 'createProjectLink',
        linkData: data
      });

      if (response.success) {
        // Update app data to get latest project links
        const appDataResult = await authApi.updateAppData(setAppData);

        // Show success modal
        setResultModalProps({
          type: 'success',
          title: 'Link Created',
          message: 'Your project link has been successfully created!',
          details: response.data
        });
        setShowResultModal(true);
      } else {
        // Handle error scenarios
        setResultModalProps({
          type: 'error',
          title: 'Link Creation Failed',
          message: response.error || 'Failed to create project link',
          details: response.details || {}
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Project link creation error:', error);
      setResultModalProps({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An unexpected error occurred',
        details: {}
      });
      setShowResultModal(true);
    }
  };

  const handleRefreshRedirect = async (id: string) => {
    // Implementation for refreshing redirect
  };

  const handleGetDomain = async (id: string) => {
    // Implementation for getting domain
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Optional: Show a toast or temporary notification
        setResultModalProps({
          type: 'success',
          title: 'Copied',
          message: 'URL copied to clipboard',
          details: {}
        });
        setShowResultModal(true);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setResultModalProps({
          type: 'error',
          title: 'Copy Failed',
          message: 'Unable to copy URL',
          details: {}
        });
        setShowResultModal(true);
      });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Project Links</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
          Create Link
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Original URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Redirect URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {link.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 truncate max-w-xs">
                      {link.originalUrl}
                    </span>
                    <button
                      onClick={() => handleCopy(link.originalUrl)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 truncate max-w-xs">
                      {link.redirectUrl}
                    </span>
                    <button
                      onClick={() => handleCopy(link.redirectUrl)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{link.domain}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    link.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {link.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRefreshRedirect(link.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleGetDomain(link.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateLink}
        />
      )}

      {/* Transaction Result Modal */}
      <TransactionResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          if (resultModalProps.type === 'success') {
            setShowCreateModal(false);
          }
        }}
        type={resultModalProps.type}
        title={resultModalProps.title}
        message={resultModalProps.message}
        details={resultModalProps.details}
      />

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <LoadingSpinner size="large" />
        </div>
      )}
    </div>
  );
}