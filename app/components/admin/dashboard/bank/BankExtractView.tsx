import React from 'react';
import { parseJSONWithComments } from '../../../../../utils/helpers';
import { BankExtract } from '../../../../types/extracts';

interface BankExtractViewProps {
  data: string;
}

export const BankExtractView = ({ data }: BankExtractViewProps) => {
  try {
    const parsedData = parseJSONWithComments(data) as BankExtract;
    if (!parsedData || !Array.isArray(parsedData)) return <div>Invalid data format</div>;

    return (
      <div className="space-y-6">
        {parsedData.map((account, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {account.accountType} Account
                <span className="text-sm text-gray-500 ml-2">({account.accountId})</span>
              </h3>
              <div className="text-xl font-semibold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: account.currency || 'USD'
                }).format(account.balance)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">{account.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Routing Number</p>
                <p className="font-medium">{account.routingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Transactions</p>
                <p className="font-medium">{account.pendingTransactionsCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Transaction</p>
                <p className="font-medium">{new Date(account.lastTransactionDate).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Credit</p>
                <p className="font-medium text-green-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: account.currency || 'USD'
                  }).format(account.totalCredit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Debit</p>
                <p className="font-medium text-red-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: account.currency || 'USD'
                  }).format(account.totalDebit)}
                </p>
              </div>
            </div>

            {account.transactions && account.transactions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recent Transactions</h4>
                <div className="space-y-2">
                  {account.transactions.slice(0, 3).map((transaction: any, tIndex: number) => (
                    <div key={tIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleString()}
                        </p>
                      </div>
                      <div className={transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: account.currency || 'USD'
                        }).format(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return <div>Error parsing data</div>;
  }
};