import React from 'react';

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainData: {
    domain: string;
    records: Array<{
      priority: number;
      exchange: string;
    }>;
    possibleProvider: string;
  };
}

export const DomainModal: React.FC<DomainModalProps> = ({ isOpen, onClose, domainData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{domainData.domain}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">×</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">MX Records</h3>
            <div className="mt-2 space-y-2">
              {domainData.records.map((record, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <p className="text-gray-700 dark:text-gray-200">Priority: {record.priority}</p>
                  <p className="text-gray-700 dark:text-gray-200">Exchange: {record.exchange}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Possible Provider</h3>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">{domainData.possibleProvider}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
