import React, { useState } from 'react';
import { useAppState } from '../../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCopy, 
  faExternalLinkAlt, 
  faSync, 
  faCog, 
  faTrash 
} from '@fortawesome/free-solid-svg-icons';
import { securedApi } from '../../../../utils/auth';
import { authApi } from '../../../../utils/auth';
import ProjectSettingsModal from './../../../components/admin/projects/ProjectSettingsModal';
import ConfirmationModal from '../../ConfirmationModal';
import type { Project } from '../../../types/project'; // Add this import

interface ActionsHandlerProps {
  project: Project;
  onCopy: (text: string) => void;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
  onSettings?: () => void;
}

export default function ActionsHandler({ 
  project, 
  onCopy, 
  onRefresh,
  onDelete,
  onSettings = undefined
}: ActionsHandlerProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showRenewConfirmation, setShowRenewConfirmation] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);

  const { appData, setAppData } = useAppState();

  const templates = appData?.data?.template?.data || [];
  const templateHeaders = appData?.data?.template?.headers || [];
  const getTemplateIndex = (header: string) => templateHeaders.indexOf(header);

  const getRenewalPrice = (templateId: string) => {

    const template = templates.find(
      t => t[getTemplateIndex('templateId')] === templateId
    );

    if (!template) return null;
    const renewal = template[getTemplateIndex('renewal')];

    return renewal ? parseFloat(renewal) : null;
  };

  const handleOpenLink = () => {
    // Try multiple potential URL sources
    const urlSources = [
      project.pageURL,  // First, try pageURL
      project.projectId && `https://${project.projectId}.webfixx.com`,  // Try generated URL
      project.projectId,  // Fallback to projectId
      project.projectTitle && `https://${project.projectTitle.toLowerCase().replace(/\s+/g, '-')}.webfixx.com`  // URL from project title
    ];

    const validUrl = urlSources.find(url => url && url.trim() !== '');

    if (validUrl) {
      try {
        // Ensure the URL has a protocol
        const formattedUrl = validUrl.startsWith('http') 
          ? validUrl 
          : `https://${validUrl}`;
        
        window.open(formattedUrl, '_blank');
      } catch (error) {
        console.error('Error opening link:', error);
        // Optionally, you could add user feedback here
      }
    } else {
      console.warn('No valid URL found for this project');
      // Optionally, show a user-friendly message
    }
  };

  const handleDeleteProject = async () => {
    try {
      setDeleteLoading(true);
      const response = await securedApi.callBackendFunction({
        functionName: 'deleteProject',
        projectId: project.projectId
      });
      // Update app data
      await authApi.updateAppData(setAppData);
      onDelete(project.projectId);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error deleting project:', error);
      // You might want to add error handling here, 
      // perhaps using a result modal or toast notification
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRenewProject = async () => {
    try {
      setRenewLoading(true);
      const response = await securedApi.callBackendFunction({
        functionName: 'renewProject',
        projectId: project.projectId
      });
      // Update app data
      await authApi.updateAppData(setAppData);
      onRefresh(project.projectId);
      setShowRenewConfirmation(false);
    } catch (error) {
      console.error('Error renewing project:', error);
      // You might want to add error handling here, 
      // perhaps using a result modal or toast notification
    } finally {
      setRenewLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center space-x-2">
        <FontAwesomeIcon 
          icon={faCopy} 
          onClick={() => {
            const textToCopy = project.pageURL || project.projectId;
            onCopy(textToCopy);
          }} 
          className="cursor-pointer hover:text-blue-500" 
          title={project.pageURL ? "Copy Page URL" : "Copy Project ID"} 
        />
        <FontAwesomeIcon 
          icon={faExternalLinkAlt} 
          onClick={handleOpenLink} 
          className="cursor-pointer hover:text-green-500" 
          title="Open Link" 
        />
        <FontAwesomeIcon 
          icon={faSync} 
          onClick={() => setShowRenewConfirmation(true)} 
          className="cursor-pointer hover:text-yellow-500" 
          title="Refresh Redirect" 
        />
        <FontAwesomeIcon 
          icon={faCog} 
          onClick={() => {
            if (typeof onSettings === 'function') {
              onSettings();
            } else {
              setShowSettingsModal(true);
            }
          }} 
          className="cursor-pointer hover:text-purple-500" 
          title="Project Settings" 
        />
        <FontAwesomeIcon 
          icon={faTrash} 
          onClick={() => setShowDeleteConfirmation(true)} 
          className="cursor-pointer hover:text-red-500" 
          title="Delete Project" 
        />
      </div>

      {/* Project Settings Modal */}
      {showSettingsModal && (
        <ProjectSettingsModal 
          project={project}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <ConfirmationModal 
          isOpen={true}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          // @ts-ignore
          confirmDisabled={deleteLoading}
        />
      )}

      {/* Renew Confirmation Modal */}
      {showRenewConfirmation && (
        <ConfirmationModal 
          isOpen={true}
          onClose={() => setShowRenewConfirmation(false)}
          onConfirm={handleRenewProject}
          title="Renew Project"
          message={`Are you sure you want to renew this project? Renewal price: $${getRenewalPrice(project.templateId)?.toFixed(2) || 'N/A'}`}
          confirmText={renewLoading ? 'Renewing...' : 'Renew'}
          cancelText="Cancel"
          // @ts-ignore
          confirmDisabled={renewLoading}
        />
      )}
    </>
  );
}
