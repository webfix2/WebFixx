"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faCopy } from '@fortawesome/free-solid-svg-icons';

interface EmailLogin {
  id: string;
  email: string;
  password: string;
  cookie: string;
  extract: string;
  status: 'active' | 'inactive' | 'pending';
}

export default function Dashboard() {
  const [emailLogins, setEmailLogins] = useState<EmailLogin[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (id: string) => {
    try {
      // Implement check functionality
      // await checkEmailLogin(id);
    } catch (error) {
      console.error('Error checking email login:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Implement delete functionality
      // await deleteEmailLogin(id);
      setEmailLogins(emailLogins.filter(login => login.id !== id));
    } catch (error) {
      console.error('Error deleting email login:', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Logins</h1>
        <button className="btn-primary">Add New Login</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cookie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Extract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emailLogins.map((login) => (
                <tr key={login.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {login.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {login.password}
                      </span>
                      <button
                        onClick={() => handleCopy(login.password)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {login.cookie}
                      </span>
                      <button
                        onClick={() => handleCopy(login.cookie)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{login.extract}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      login.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : login.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {login.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCheck(login.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(login.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}