import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTimes, 
  faCopy, 
  faStickyNote 
} from '@fortawesome/free-solid-svg-icons';
import { LoginData } from '../../../types';

interface LoginTableProps {
  data: LoginData[];
  onCopy: (text: string) => void;
  formatTimestamp: (timestamp: string) => string;
}

export const LoginTable = ({ data, onCopy, formatTimestamp }: LoginTableProps) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Domain
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Password
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Timestamp
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Verified
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Cookie
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Memo
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map(login => (
          <tr key={login.id} className={login.memo ? 'bg-yellow-50' : ''}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{login.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{login.domain}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{login.password}</span>
                <button
                  onClick={() => onCopy(login.password)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                </button>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatTimestamp(login.timestamp)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <FontAwesomeIcon 
                icon={login.verified ? faCheck : faTimes} 
                className={login.verified ? 'text-green-600' : 'text-red-600'}
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {login.cookie && (
                <button
                  onClick={() => onCopy(login.cookie)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                </button>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {login.memo && (
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faStickyNote} className="text-yellow-600 w-4 h-4" />
                  <span className="text-sm text-gray-500">{login.memo}</span>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);