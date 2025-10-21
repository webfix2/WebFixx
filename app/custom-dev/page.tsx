"use client";

import { useState } from 'react';
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
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateLink = async (data: Partial<ProjectLink>) => {
    // Implementation for creating new link
  };

  const handleRefreshRedirect = async (id: string) => {
    // Implementation for refreshing redirect
  };

  const handleGetDomain = async (id: string) => {
    // Implementation for getting domain
  };

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
                    {/* <button
                      onClick={() => handleCopy(link.originalUrl)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                    </button> */}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 truncate max-w-xs">
                      {link.redirectUrl}
                    </span>
                    {/* <button
                      onClick={() => handleCopy(link.redirectUrl)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                    </button> */}
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
      {/* {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateLink}
        />
      )} */}
    </div>
  );
}
