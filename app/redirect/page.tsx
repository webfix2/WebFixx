"use client";

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLink, 
  faPlus,
  faSpinner,
  faRedo,
  faPencilAlt,
  faCopy,
  faExternalLinkAlt,
  faEdit, 
  faSave  // Add new icons
} from '@fortawesome/free-solid-svg-icons';
import { useAppState } from '../context/AppContext';
import { authApi, securedApi } from '../../utils/auth';
import TransactionResultModal from '../components/TransactionResultModal';
import LoadingSpinner from '../components/LoadingSpinner';

// Type definition for redirect paths
type RedirectPath = {
  path: string;
  redirectURL: string;
  linkHealth: string;
  inboxHealth: string;
  status: string;
  clicks: string;
  blocked: string;
};

export default function RedirectLinks() {
  const { appData, setAppData } = useAppState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLinkId, setProcessingLinkId] = useState<string | null>(null);

  // New state for paths modal
  const [showPathsModal, setShowPathsModal] = useState(false);
  const [currentRedirectId, setCurrentRedirectId] = useState<string | null>(null);
  const [currentPaths, setCurrentPaths] = useState<RedirectPath[]>([]);
  const [newRedirectURL, setNewRedirectURL] = useState('');

  // State for creating redirect
  const [newRedirectTitle, setNewRedirectTitle] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Transaction result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalProps, setResultModalProps] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
    details: {}
  });

  // Add new state for editing paths
  const [editingPathIndex, setEditingPathIndex] = useState<number | null>(null);
  const [editedRedirectURL, setEditedRedirectURL] = useState('');

  // Add useRef and useEffect for outside click handling
  const editInputRef = useRef<HTMLInputElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Handle outside click to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside both input and save button
      if (
        editInputRef.current && 
        saveButtonRef.current &&
        !editInputRef.current.contains(event.target as Node) &&
        !saveButtonRef.current.contains(event.target as Node)
      ) {
        setEditingPathIndex(null);
        setEditedRedirectURL('');
      }
    };

    // Add event listener when editing
    if (editingPathIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingPathIndex]);

  // Check if user is loaded
  if (!appData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Transform raw redirect data into a more usable format
  const transformRedirectData = (rawData: any, headers?: string[]) => {
    // If no data, return empty array
    if (!rawData || rawData.length === 0) return [];

    // Use provided headers or fallback to default indices
    const safeHeaders = headers || [
      'id', 'redirectId', 'linkHost', 'link', 'linkGoogleURL', '', 'createdAt', 
      'userId', 'title', 'expiryDate', 'paymentJSON', '', 'updatedAt', 'paths', 
      'clicks', 'blocked', '', 'totalPaid', 'paymentJSON', 'lastCheck', 'status'
    ];

    // If rawData is an object with data property, use that
    const processedData = Array.isArray(rawData) ? rawData : rawData.data || [];

    // Create a mapping of column names to their indices
    const columnIndices = {
      id: safeHeaders.indexOf('id'),
      redirectId: safeHeaders.indexOf('redirectId'),
      platform: safeHeaders.indexOf('linkHost'),
      link: safeHeaders.indexOf('link'),
      linkGoogleURL: safeHeaders.indexOf('linkGoogleURL'),
      timestamp: safeHeaders.indexOf('createdAt'),
      userId: safeHeaders.indexOf('userId'),
      title: safeHeaders.indexOf('title'),
      expiryDate: safeHeaders.indexOf('expiryDate'),
      paths: safeHeaders.indexOf('paths'),
      status: safeHeaders.indexOf('status'),
      clicks: safeHeaders.indexOf('clicks'),
      blocked: safeHeaders.indexOf('blocked'),
      updatedAt: safeHeaders.indexOf('updatedAt')
    };

    // Transform data
    return processedData.map((item: any) => ({
      id: item[columnIndices.id] || '',
      redirectId: item[columnIndices.redirectId] || '',
      platform: item[columnIndices.platform] || '',
      link: item[columnIndices.link] || '',
      linkGoogleURL: item[columnIndices.linkGoogleURL] || '',
      timestamp: item[columnIndices.timestamp] || '',
      userId: item[columnIndices.userId] || '',
      title: item[columnIndices.title] || '', 
      expiryDate: item[columnIndices.expiryDate] || '',
      paths: item[columnIndices.paths] || '[]',
      status: item[columnIndices.status] || 'PENDING',
      clicks: item[columnIndices.clicks] || '0',
      blocked: item[columnIndices.blocked] || '0',
      updatedAt: item[columnIndices.updatedAt] || '',
      // Additional parsing for paths
      parsedPaths: item[columnIndices.paths] ? JSON.parse(item[columnIndices.paths]).map((path: any) => ({
        path: path.path,
        redirectURL: path.redirectURL,
        linkHealth: path.linkHealth,
        inboxHealth: path.inboxHealth,
        clicks: path.clicks
      })) : []
    }));
  };

  // Get redirect links from app state and transform
  const redirectLinks = transformRedirectData(
    appData.data?.redirect?.data || [], 
    appData.data?.redirect?.headers || []
  );

  // Calculate pagination
  const totalPages = Math.ceil(redirectLinks.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentLinks = redirectLinks.slice(indexOfFirstRow, indexOfLastRow);

  // Pagination controls
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Helper function to parse paths JSON
  const parsePaths = (pathsString: string): RedirectPath[] => {
    try {
      return JSON.parse(pathsString || '[]');
    } catch {
      return [];
    }
  };

  // Open paths modal
  const handleOpenPathsModal = (redirectId: string, pathsString: string) => {
    setCurrentRedirectId(redirectId);
    const paths = parsePaths(pathsString);
    setCurrentPaths(paths);
    setNewRedirectURL('');
    setShowPathsModal(true);
  };

  // Add new redirect path
  const handleAddRedirectPath = async () => {
    if (!currentRedirectId || !newRedirectURL) return;

    try {
      setIsProcessing(true);
      
      // Prepare the new path object with minimal required fields
      const newPathObj = {
        redirectURL: newRedirectURL,
        linkHealth: 'ACTIVE',
        inboxHealth: 'INBOX'
      };

      const response = await securedApi.callBackendFunction({
        functionName: 'addRedirectEndPages',
        redirectId: currentRedirectId,
        paths: JSON.stringify([newPathObj])
      });



      if (response.success) {
        // Update app data
        const appDataResult = await authApi.updateAppData(setAppData);

        // Close modal and reset state
        setShowPathsModal(false);
        setNewRedirectURL('');
        setCurrentRedirectId(null);

        // Show success modal
        setResultModalProps({
          type: 'success',
          title: 'Redirect Path Added',
          message: 'New redirect path successfully added!',
          details: response.data || {}
        });
        setShowResultModal(true);
      } else {
        throw new Error(response.error || 'Failed to add redirect path');
      }
    } catch (error) {

      setResultModalProps({
        type: 'error',
        title: 'Add Path Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? { 
          errorName: error.name, 
          errorMessage: error.message,
          errorStack: error.stack 
        } : {}
      });
      setShowResultModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle editing a path
  const handleEditPath = (index: number, currentURL: string) => {
    setEditingPathIndex(index);
    setEditedRedirectURL(currentURL);
  };

  // Handle saving an edited path
  const handleSaveEditedPath = async (pathIndex: number, event?: React.MouseEvent) => {
    // Prevent propagation to avoid triggering outside click handler
    event?.stopPropagation();

    // Detailed validation
    if (!currentRedirectId) {

      alert('No redirect ID found. Please reopen the paths modal.');
      return;
    }

    if (!editedRedirectURL) {

      alert('Please enter a redirect URL');
      return;
    }

    if (pathIndex < 0 || pathIndex >= currentPaths.length) {

      alert('Invalid path selection');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Get the specific path to update
      const pathToUpdate = currentPaths[pathIndex];

      const response = await securedApi.callBackendFunction({
        functionName: 'updateRedirectEndPages',
        redirectId: currentRedirectId,
        path: pathToUpdate.path,
        redirectURL: editedRedirectURL
      });



      if (response.success) {
        // Update app data
        const appDataResult = await authApi.updateAppData(setAppData);

        // Reset editing state
        setEditingPathIndex(null);
        setEditedRedirectURL('');

        // Show success modal
        setResultModalProps({
          type: 'success',
          title: 'Redirect Path Updated',
          message: 'Redirect path successfully updated!',
          details: response.data || {}
        });
        setShowResultModal(true);
      } else {
        throw new Error(response.error || 'Failed to update redirect path');
      }
    } catch (error) {

      setResultModalProps({
        type: 'error',
        title: 'Update Path Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? { 
          errorName: error.name, 
          errorMessage: error.message,
          errorStack: error.stack 
        } : {}
      });
      setShowResultModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Renew redirect handler
  const handleRenewRedirect = async (redirectId: string) => {
    try {
      setProcessingLinkId(redirectId);
      
      // Confirm renewal with user
      const confirmRenewal = window.confirm(
        'Are you sure you want to renew this redirect link? A renewal fee will be charged.'
      );
      
      if (!confirmRenewal) {
        setProcessingLinkId(null);
        return;
      }

      const response = await securedApi.callBackendFunction({
        functionName: 'renewRedirect',
        redirectId: redirectId
      });
    
      if (response.success) {
        // Update app data to reflect new balance and redirect links
        const appDataResult = await authApi.updateAppData(setAppData);
    
        setResultModalProps({
          type: 'success',
          title: 'Redirect Renewed',
          message: 'Your redirect link has been successfully renewed!',
          details: {
            redirectId: response.data.redirectId,
            oldExpiryDate: response.data.oldExpiryDate,
            newExpiryDate: response.data.newExpiryDate,
            renewalAmount: response.data.renewalAmount,
            newBalance: `$${appDataResult.user?.balance ?? ''}`
          }
        });
        setShowResultModal(true);
      } else {
        throw new Error(response.error || 'Failed to renew redirect link');
      }
    } catch (error) {
      setResultModalProps({
        type: 'error',
        title: 'Renewal Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {}
      });
      setShowResultModal(true);
    } finally {
      setProcessingLinkId(null);
    }
  };

  // Create redirect handler
  const handleCreateRedirect = async () => {
    // Safely check user balance with optional chaining and default value
    const userBalance = parseFloat(appData?.user?.balance ?? '0');
    
    // Validate title
    if (!newRedirectTitle.trim()) {
      setResultModalProps({
        type: 'error',
        title: 'Invalid Title',
        message: 'Please enter a title for your redirect link',
        details: {}
      });
      setShowResultModal(true);
      return;
    }
    
    try {
      setIsProcessing(true);
      const response = await securedApi.callBackendFunction({
        functionName: 'createRedirect',
        title: newRedirectTitle.trim()
      });
    
      if (response.success) {
        // Validate returned data
        if (!response.data?.linkHost || !response.data?.link || !response.data?.linkGoogleURL) {
          throw new Error('Invalid redirect link data received');
        }
    
        // Update app data to reflect new balance and redirect links
        const appDataResult = await authApi.updateAppData(setAppData);
    
        setResultModalProps({
          type: 'success',
          title: 'Redirect Created',
          message: 'Your redirect link has been successfully created!',
          details: {
            linkHost: response.data.linkHost,
            link: response.data.link,
            title: newRedirectTitle,
            expiryDate: response.data.expiryDate,
            amount: response.data.amount,
            newBalance: `$${appDataResult.user?.balance ?? userBalance.toFixed(2)}`
          }
        });
        setShowResultModal(true);

        // Reset title input
        setNewRedirectTitle('');
      } else {
        throw new Error(response.error || 'Failed to create redirect link');
      }
    } catch (error) {
      setResultModalProps({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {}
      });
      setShowResultModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to calculate time remaining
  const calculateTimeRemaining = (expiryDateString: string) => {
    const expiryDate = new Date(expiryDateString);
    const now = new Date();
    const difference = expiryDate.getTime() - now.getTime();

    if (difference <= 0) return 'Expired';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hr${hours !== 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  // Helper function to generate full path URL
  const generateFullPathURL = (baseLink: string, path: string) => {
    return `${baseLink}/${path}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Create Redirect Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create Redirect Link</h2>
          <FontAwesomeIcon icon={faLink} className="w-6 h-6 text-blue-500" />
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">Create a new redirect link for $50</p>
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-600">Title:</label>
            <input
              type="text"
              value={newRedirectTitle}
              onChange={(e) => setNewRedirectTitle(e.target.value)}
              placeholder="Enter title for your redirect link"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCreateRedirect}
            disabled={isProcessing}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center justify-center"
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
        </div>
      </div>

      {/* Redirect Links Table */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Redirect Links
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Desktop Columns */}
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                
                {/* Mobile and Desktop Columns */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Paths
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Clicks
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Blocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {redirectLinks.length > 0 ? (
                currentLinks.map((link, index) => {
                  // Parse paths
                  const paths = parsePaths(link.paths);
                  
                  // Calculate time remaining
                  const timeRemaining = calculateTimeRemaining(link.expiryDate);
                  
                  return (
                    <tr key={index}>
                      {/* Desktop Title Column */}
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{link.title}</div>
                      </td>
                      
                      {/* Paths Column (Mobile and Desktop) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenPathsModal(link.redirectId, link.paths)}
                          className="text-blue-600 hover:underline"
                        >
                          {paths.length} Paths
                        </button>
                      </td>
                      
                      {/* Clicks Column (Desktop Only) */}
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{link.clicks || '0'}</span>
                      </td>
                      
                      {/* Blocked Column (Desktop Only) */}
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <span className={`
                          text-sm font-medium px-2 py-1 rounded
                          ${parseInt(link.blocked || '0') > 0 ? 'bg-red-100 text-red-800' : 
                            link.blocked === '0' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {link.blocked || '0'}
                        </span>
                      </td>
                      
                      {/* Time Left Column (Mobile and Desktop) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          timeRemaining === 'Expired' 
                            ? 'text-red-600' 
                            : timeRemaining.includes('day') 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                        }`}>
                          {timeRemaining}
                        </span>
                      </td>
                      
                      {/* Actions Column (Mobile and Desktop) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {link.status !== 'EXPIRED' && (
                          <button
                            onClick={() => handleRenewRedirect(link.redirectId)}
                            disabled={processingLinkId === link.redirectId}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Renew Redirect Link"
                          >
                            {processingLinkId === link.redirectId ? (
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                              <FontAwesomeIcon icon={faRedo} />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No redirect links found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastRow, redirectLinks.length)}
                  </span>{' '}
                  of <span className="font-medium">{redirectLinks.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                      currentPage === 1 ? 'text-gray-300' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                      currentPage === totalPages ? 'text-gray-300' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Paths Modal */}
      {showPathsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
          <div className="relative w-auto max-w-3xl mx-auto my-6 w-full">
            <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none animate-fade-in">
              {/* Modal Header with Prominent Close Button */}
              <div className="flex items-center justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                <h3 className="text-2xl font-semibold">
                  Redirect Paths
                </h3>
                <button
                  className="text-red-500 hover:text-red-700 bg-transparent border-0 text-3xl font-semibold outline-none focus:outline-none"
                  onClick={() => setShowPathsModal(false)}
                >
                  ×
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="relative flex-auto p-6">
                {/* Existing Paths Table */}
                {currentPaths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Existing Paths</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Redirect URL</th>
                            <th className="border p-2 text-left">Health</th>
                            <th className="border p-2 text-left">Clicks</th>
                            <th className="border p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentPaths.map((path, index) => {
                            // Find the base link from the current redirect links
                            const currentRedirect = redirectLinks.find(link => link.redirectId === currentRedirectId);
                            const baseLink = currentRedirect?.link || '';
                            const fullPathURL = generateFullPathURL(baseLink, path.path);

                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                {/* Redirect URL Column */}
                                <td className="border p-2">
                                  {editingPathIndex === index ? (
                                    <input
                                      type="text"
                                      value={editedRedirectURL}
                                      onChange={(e) => setEditedRedirectURL(e.target.value)}
                                      placeholder="Enter Redirect URL"
                                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      ref={editingPathIndex === index ? editInputRef : null}
                                    />
                                  ) : (
                                    <div className="flex items-center">
                                      <span className="text-sm text-gray-900 truncate max-w-[250px]">{path.redirectURL}</span>
                                    </div>
                                  )}
                                </td>
                                
                                {/* Link Health Column */}
                                <td className="border p-2">
                                  <span className={`
                                    px-2 py-1 rounded text-xs font-medium
                                    ${path.linkHealth === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                      path.linkHealth === 'RED' ? 'bg-red-100 text-red-800' : 
                                      path.linkHealth === 'ERROR' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-gray-100 text-gray-800'}
                                  `}>
                                    {path.linkHealth}
                                  </span>
                                </td>
                                
                                {/* Clicks Column */}
                                <td className="border p-2">
                                  <span className="text-sm text-gray-900">{path.clicks || '0'}</span>
                                </td>
                                
                                {/* Actions Column */}
                                <td className="border p-2">
                                  <div className="flex items-center space-x-2">
                                    {editingPathIndex === index ? (
                                      <button
                                        onClick={(e) => handleSaveEditedPath(index, e)}
                                        disabled={!editedRedirectURL || isProcessing}
                                        className={`text-blue-500 hover:text-blue-700 ${
                                          !editedRedirectURL || isProcessing 
                                            ? 'cursor-not-allowed opacity-50' 
                                            : ''
                                        }`}
                                        title="Save Path"
                                        ref={editingPathIndex === index ? saveButtonRef : null}
                                      >
                                        <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleEditPath(index, path.redirectURL)}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Edit Path"
                                      >
                                        <FontAwesomeIcon icon={faPencilAlt} className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(fullPathURL)}
                                      className="text-blue-500 hover:text-blue-700"
                                      title="Copy Full URL"
                                    >
                                      <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                                    </button>
                                    <a 
                                      href={fullPathURL} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-green-500 hover:text-green-700"
                                      title="Open Full URL"
                                    >
                                      <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4" />
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Add New Path Section */}
                <div>
                  <h4 className="text-lg font-medium mb-2">Add New Redirect Path</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRedirectURL}
                      onChange={(e) => setNewRedirectURL(e.target.value)}
                      placeholder="Enter Redirect URL"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddRedirectPath}
                      disabled={!newRedirectURL || isProcessing}
                      className={`
                        px-4 py-2 rounded-md text-white font-medium
                        ${!newRedirectURL || isProcessing 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'}
                      `}
                    >
                      {isProcessing ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Result Modal */}
      <TransactionResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        type={resultModalProps.type}
        title={resultModalProps.title}
        message={resultModalProps.message}
        details={resultModalProps.details}
      />
    </div>
  );
}