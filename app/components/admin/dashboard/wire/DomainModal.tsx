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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{domainData.domain}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">MX Records</h3>
            <div className="mt-2 space-y-2">
              {domainData.records.map((record, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded">
                  <p>Priority: {record.priority}</p>
                  <p>Exchange: {record.exchange}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Possible Provider</h3>
            <p className="mt-1 font-medium">{domainData.possibleProvider}</p>
          </div>
        </div>
      </div>
    </div>
  );
};