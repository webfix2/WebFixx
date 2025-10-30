import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface CreateRedirectCardProps {
  newRedirectTitle: string;
  setNewRedirectTitle: (title: string) => void;
  confirmCreateRedirect: () => void;
  isProcessing: boolean;
  redirectPrice: number;
}

const CreateRedirectCard: React.FC<CreateRedirectCardProps> = ({
  newRedirectTitle,
  setNewRedirectTitle,
  confirmCreateRedirect,
  isProcessing,
  redirectPrice,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Redirect Link</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Create a new protected redirect for ${redirectPrice.toFixed(2)}</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
          <FontAwesomeIcon icon={faLink} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">Redirect Title:</label>
          <input
            type="text"
            value={newRedirectTitle}
            onChange={(e) => setNewRedirectTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <button
          onClick={confirmCreateRedirect}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center justify-center shadow-sm"
        >
          {isProcessing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
              Create Redirect
            </>
          )}
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-left">
          Redirect links are valid for 30 days. Renewals will extend the duration from the last expiry date.
        </p>
      </div>
    </div>
  );
};

export default CreateRedirectCard;
