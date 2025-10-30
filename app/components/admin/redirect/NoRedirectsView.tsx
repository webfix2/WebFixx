import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLink, 
  faPlus,
  faSpinner,
  faShield,
  faRobot,
  faChartLine,
  faFingerprint
} from '@fortawesome/free-solid-svg-icons';

interface NoRedirectsViewProps {
  redirectPrice: number;
  newRedirectTitle: string;
  setNewRedirectTitle: (title: string) => void;
  confirmCreateRedirect: () => void;
  isProcessing: boolean;
}

const NoRedirectsView: React.FC<NoRedirectsViewProps> = ({
  redirectPrice,
  newRedirectTitle,
  setNewRedirectTitle,
  confirmCreateRedirect,
  isProcessing,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center">
      <FontAwesomeIcon icon={faLink} className="w-20 h-20 text-blue-500 mb-6" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Redirect Available</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        It looks like you haven't created any redirect links yet. Get started by creating your first one!
      </p>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow dark:shadow-none mb-8">
          <div className="flex flex-col items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Redirect Link</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Create a new protected redirect for ${redirectPrice.toFixed(2)}</p>
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
                  Create Redirect Link
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-left">
              Redirect links are valid for 30 days. Renewals will extend the duration from the last expiry date.
            </p>
          </div>
        </div>

        {/* Protection Features - Always visible in this view */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">Protection Features</h2>
          <div className="space-y-6 mt-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900">
                <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium dark:text-white">Anti-Red</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Advanced protection against detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
                <FontAwesomeIcon icon={faRobot} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium dark:text-white">Bot Detector/Killer</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatic bot detection and blocking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center dark:bg-purple-900">
                <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium dark:text-white">Analytics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Traffic and health monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center dark:bg-yellow-900">
                <FontAwesomeIcon icon={faFingerprint} className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-medium dark:text-white">Fingerprinting</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visitor validation system</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoRedirectsView;
