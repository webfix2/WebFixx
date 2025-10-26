"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faLock,
  faShield,
  faKey,
  faTrash,
  faCrown,
  faEdit,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { useAppState } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Modal components (to be implemented)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal = ({ isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        {/* Form fields will go here */}
        <button onClick={onClose} className="mt-4 btn-secondary">Close</button>
      </div>
    </div>
  );
};

const UpgradePlanModal = ({ isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
        <h2 className="text-xl font-bold mb-4">Upgrade Plan</h2>
        {/* Plan options will go here */}
        <button onClick={onClose} className="mt-4 btn-secondary">Close</button>
      </div>
    </div>
  );
};

const TwoFactorModal = ({ isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
        <h2 className="text-xl font-bold mb-4">Two-Factor Authentication</h2>
        {/* 2FA setup will go here */}
        <button onClick={onClose} className="mt-4 btn-secondary">Close</button>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        {/* Password form will go here */}
        <button onClick={onClose} className="mt-4 btn-secondary">Close</button>
      </div>
    </div>
  );
};

const ApiKeyModal = ({ isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
        <h2 className="text-xl font-bold mb-4">API Key Generated</h2>
        {/* API key display will go here */}
        <button onClick={onClose} className="mt-4 btn-secondary">Close</button>
      </div>
    </div>
  );
};

const DestroyAccountModal = ({ isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop bg-gray-900 bg-opacity-50 dark:bg-opacity-75 fixed inset-0 flex items-center justify-center z-50">
      <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
        <h2 className="text-xl font-bold mb-4">Destroy Account</h2>
        <p className="mb-4">This action cannot be undone. Please confirm.</p>
        <div className="flex justify-end space-x-4">
          <button className="btn-danger" onClick={onClose}>Destroy Account</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default function UserSettings() {
  const { appData } = useAppState();
  
  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showDestroyAccountModal, setShowDestroyAccountModal] = useState(false);

  if (!appData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Format the creation date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'a year ago';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2>
            <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-200">{appData.user.email}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Signed up {formatDate(appData.user.createdAt || '')}</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="w-full btn-primary flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Upgrade Plan Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upgrade Plan</h2>
            <FontAwesomeIcon icon={faCrown} className="w-6 h-6 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-200">Current Plan: <span className="font-semibold">Free</span></p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Upgrade to access premium features</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setShowUpgradePlanModal(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faCrown} className="w-4 h-4 mr-2" />
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* Security Sections */}
      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Security</h2>
            <FontAwesomeIcon icon={faShield} className="w-6 h-6 text-green-500" />
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-200">Two-factor authentication greatly helps to secure your account by requiring a dynamically generated code in addition to the standard username and password when you log in.</p>
          </div>
          <button
            onClick={() => setShowTwoFactorModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faShield} className="w-4 h-4 mr-2" />
            Enable Two-Factor Authentication
          </button>
        </div>

        {/* Password */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password</h2>
            <FontAwesomeIcon icon={faLock} className="w-6 h-6 text-blue-500" />
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-200">Regularly update your password to keep your account secure.</p>
          </div>
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faLock} className="w-4 h-4 mr-2" />
            Change Password
          </button>
        </div>

        {/* API Key */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Access Token</h2>
            <FontAwesomeIcon icon={faKey} className="w-6 h-6 text-purple-500" />
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-200">Use the WebFixx API or command-line tool with this API Key. Find more information about our API, Go SDK, Python SDK and CLI tool at our Developer Hub.</p>
            <p className="text-gray-700 dark:text-gray-200 mt-2">Regenerating your API key will invalidate the current/previous one.</p>
            <p className="text-gray-700 dark:text-gray-200 mt-2">For security reasons, your API key will only be shown once!</p>
            <div className="mt-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-mono text-gray-700 dark:text-gray-300">##############################</p>
            </div>
          </div>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSync} className="w-4 h-4 mr-2" />
            Generate New API Key
          </button>
        </div>

        {/* Destroy Account */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Destroy Account</h2>
            <FontAwesomeIcon icon={faTrash} className="w-6 h-6 text-red-500" />
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-200">This will delete your account, servers, and any/all records from our system.</p>
          </div>
          <button
            onClick={() => setShowDestroyAccountModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
            Destroy Account
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal isOpen={showEditProfileModal} onClose={() => setShowEditProfileModal(false)} />
      <UpgradePlanModal isOpen={showUpgradePlanModal} onClose={() => setShowUpgradePlanModal(false)} />
      <TwoFactorModal isOpen={showTwoFactorModal} onClose={() => setShowTwoFactorModal(false)} />
      <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
      <DestroyAccountModal isOpen={showDestroyAccountModal} onClose={() => setShowDestroyAccountModal(false)} />
    </div>
  );
}
