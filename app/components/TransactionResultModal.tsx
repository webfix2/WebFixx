import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faExclamationTriangle,
  faWallet,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

type ResultType = 'success' | 'error' | 'warning';

interface TransactionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ResultType;
  title: string;
  message: string;
  details?: {
    [key: string]: string | number;
  };
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

const TransactionResultModal: React.FC<TransactionResultModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
  actionButton
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faTimesCircle;
      case 'warning':
        return faExclamationTriangle;
      default:
        return faWallet;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900';
      case 'error':
        return 'bg-red-50 dark:bg-red-900';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900';
      default:
        return 'bg-blue-50 dark:bg-blue-900';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md relative overflow-hidden">
        <div className={`p-6 ${getBgColor()}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-16 h-16 rounded-full ${getBgColor()} flex items-center justify-center`}>
              <FontAwesomeIcon icon={getIcon()} className={`h-10 w-10 ${getIconColor()}`} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
            
            {details && (
              <div className="w-full mt-4 text-left bg-white dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-700 dark:text-white mb-2">Details</h4>
                <div className="space-y-1">
                  {typeof details === 'string' || typeof details === 'number' ? (
                    <div className="text-sm font-medium dark:text-gray-200">{details}</div>
                  ) : Array.isArray(details) ? (
                    <div className="text-sm font-medium dark:text-gray-200">{JSON.stringify(details)}</div>
                  ) : typeof details === 'object' && details !== null ? (
                    Object.entries(details).map(([key, value]) => {
                      // Try to parse stringified JSON objects for nested details
                      let parsedValue = value;
                      let isJsonString = false;
                      if (typeof value === 'string' && value.trim().startsWith('{') && value.trim().endsWith('}')) {
                        try {
                          parsedValue = JSON.parse(value);
                          isJsonString = true;
                        } catch {}
                      }
                      return (
                        <div key={key} className="flex flex-col text-sm mb-1">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-medium dark:text-gray-200">
                            {key === 'LinkURL' && typeof parsedValue === 'string' ? (
                              <a 
                                href={parsedValue} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-500 hover:underline break-all"
                              >
                                {parsedValue}
                              </a>
                            ) : isJsonString && typeof parsedValue === 'object' && parsedValue !== null ? (
                              <div className="ml-2 border-l border-gray-200 dark:border-gray-600 pl-2">
                                {Object.entries(parsedValue).map(([k, v]) => (
                                  <div key={k} className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                                    <span>{typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : Array.isArray(parsedValue) ? (
                              (parsedValue as unknown as any[]).map((v, i) => (
                                <span key={i}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}{i !== (parsedValue as unknown as any[]).length - 1 ? ', ' : ''}</span>
                              ))
                            ) : typeof parsedValue === 'object' && parsedValue !== null ? (
                              <div className="ml-2 border-l border-gray-200 dark:border-gray-600 pl-2">
                                {Object.entries(parsedValue).map(([k, v]) => (
                                  <div key={k} className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                                    <span>{typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              String(parsedValue)
                            )}
                          </span>
                        </div>
                      );
                    })
                  ) : null}

                </div>
              </div>
            )}
            
            <div className="flex space-x-3 w-full mt-4">
              {actionButton && (
                <button
                  onClick={actionButton.onClick}
                  className={`flex-1 px-4 py-2 ${
                    type === 'success' ? 'bg-green-500 hover:bg-green-600 dark:hover:bg-green-700' :
                    type === 'error' ? 'bg-red-500 hover:bg-red-600 dark:hover:bg-red-700' :
                    type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-700' :
                    'bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-700'
                  } text-white rounded-lg transition-colors`}
                >
                  {actionButton.text}
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionResultModal;
