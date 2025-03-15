import { useState } from 'react';
import { useUser } from '../UserContext'; 
import { Ticket } from '../types';

const APP_SCRIPT_POST_URL =
  'https://script.google.com/macros/s/AKfycbxcoCDXcWlKPDbttlFf2eR_EeuMkfupy5dfgIOklM1ShEZ30gfD3wzZZOxkKV4xIWEl/exec';

interface AddUserModalProps {
  tickets: Ticket[];
  formData: {
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    seatNumbers: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      phoneNumber: string;
      emailAddress: string;
      seatNumbers: string;
    }>
  >;
  onAddUser: () => void;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  tickets,
  formData,
  setFormData,
  onAddUser,
  onClose
}) => {
  const { admin, fetchAllUsers } = useUser();
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicketId) {
      setError('Please select a ticket.');
      return;
    }

    if (!formData.seatNumbers) {
      setError('Please specify seat numbers.');
      return;
    }

    if (!admin) {
      setError('Admin data is missing. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString();
      const payload = new URLSearchParams();
      payload.append('action', 'transferTicket');
      payload.append('fullName', formData.fullName);
      payload.append('phoneNumber', formData.phoneNumber);
      payload.append('emailAddress', formData.emailAddress);
      payload.append('seatNumbers', formData.seatNumbers);
      payload.append('ticketId', selectedTicketId);
      payload.append('timestamp', timestamp);
      payload.append('admin', admin.username);
      const senderName = admin.senderName || 'Theresa Labirre';
      const senderEmail = admin.senderEmail || 'theresalabire@gmail.com';
      payload.append('senderName', senderName);
      payload.append('senderEmail', senderEmail);

      console.log('Payload:', payload.toString());

      const response = await fetch(APP_SCRIPT_POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      const data = await response.json();

      console.log('Response:', data);
      
      fetchAllUsers(); // Refresh users list

      if (data.error) {
        setError(data.error);
      } else {
        fetchAllUsers(); // Refresh users list
        onAddUser();
        onClose();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'An unexpected error occurred.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      fetchAllUsers(); // Refresh users list
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Full Name*</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Phone Number*</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Email Address*</label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Select Ticket*</label>
              <select
                value={selectedTicketId}
                onChange={e => setSelectedTicketId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                required
              >
                <option value="">--Select a Ticket--</option>
                {tickets.map(ticket => (
                  <option key={ticket.ticketId} value={ticket.ticketId}>
                    {ticket.eventName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Seat Numbers*</label>
              <input
                type="text"
                name="seatNumbers"
                value={formData.seatNumbers}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Add User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
