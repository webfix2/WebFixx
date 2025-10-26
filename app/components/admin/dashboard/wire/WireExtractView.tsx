import React from 'react';
import { parseJSONWithComments } from '../../../../../utils/helpers';
import { WireExtract } from '../../../../types/extracts';

interface WireExtractViewProps {
  data: string;
}

export const WireExtractView = ({ data }: WireExtractViewProps) => {
  try {
    // Remove outer array if present
    const cleanData = data.trim().startsWith('[') ? 
      JSON.parse(data)[0] : 
      parseJSONWithComments(data);

    if (!cleanData) return <div className="dark:text-white">Invalid data format</div>;

    const parsedData = cleanData as WireExtract;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-white">Email Information</h4>
            <div className="mt-2 space-y-2 dark:text-gray-200">
              <p><span className="text-gray-500 dark:text-gray-400">Email:</span> {parsedData?.emailAddress || 'N/A'}</p>
              <p><span className="text-gray-500 dark:text-gray-400">Timestamp:</span> {parsedData?.timestamp || 'N/A'}</p>
            </div>
          </div>
          {parsedData?.boxSummary && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-white">Box Summary</h4>
              <div className="mt-2 space-y-2 dark:text-gray-200">
                <p><span className="text-gray-500 dark:text-gray-400">Total Emails:</span> {parsedData.boxSummary?.totalEmails || 0}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Unread:</span> {parsedData.boxSummary?.unreadEmails || 0}</p>
              </div>
            </div>
          )}
        </div>

        {parsedData?.boxFinancialSummary && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 dark:text-white">Financial Summary</h4>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg dark:bg-gray-700 dark:text-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <p><span className="text-gray-500 dark:text-gray-400">Payment Methods:</span> {parsedData.boxFinancialSummary.identifiedPaymentMethods?.join(', ') || 'None'}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Potential Invoices:</span> {parsedData.boxFinancialSummary.potentialInvoiceCount || 0}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Avg Transaction:</span> ${parsedData?.averageTransactionAmount?.toFixed(2) || '0.00'}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Pending Transactions:</span> {parsedData?.pendingTransactionsCount || 0}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Last Transaction:</span> {parsedData?.lastTransactionDate ? new Date(parsedData.lastTransactionDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {parsedData?.contacts?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 dark:text-white">Contacts ({parsedData.contacts.length})</h4>
            <div className="mt-2 space-y-4">
              {parsedData.contacts.map((contact: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700 dark:text-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <p><span className="text-gray-500 dark:text-gray-400">Name:</span> {contact?.name || 'N/A'}</p>
                    <p><span className="text-gray-500 dark:text-gray-400">Email:</span> {contact?.email || 'N/A'}</p>
                    <p><span className="text-gray-500 dark:text-gray-400">Last Contact:</span> {contact?.lastInteractionDate ? new Date(contact.lastInteractionDate).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="text-gray-500 dark:text-gray-400">Interactions:</span> {contact?.interactionCount || 0}</p>
                  </div>
                  {contact?.relationshipSummary && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{contact.relationshipSummary}</p>
                  )}
                  {contact?.otherData && (
                    <div className="mt-2 text-sm">
                      {contact.otherData.phoneNumbers && (
                        <p><span className="text-gray-500 dark:text-gray-400">Phone:</span> {contact.otherData.phoneNumbers.join(', ')}</p>
                      )}
                      {contact.otherData.company && (
                        <p><span className="text-gray-500 dark:text-gray-400">Company:</span> {contact.otherData.company}</p>
                      )}
                      {contact.otherData.notes && (
                        <p><span className="text-gray-500 dark:text-gray-400">Notes:</span> {contact.otherData.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return <div className="dark:text-white">Error parsing data</div>;
  }
};
