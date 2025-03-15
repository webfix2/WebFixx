// /components/AdminLogin.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../UserContext';
import { User } from '../types';

interface AdminLoginProps {
    setLoggedInAdmin: React.Dispatch<React.SetStateAction<string | null>>;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ setLoggedInAdmin, setUsers }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { fetchAdminData, loading, setLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        setLoading(false); // Reset loading state on component mount
    }, [setLoading]);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!username || !password) {
            setErrorMessage("Please enter both username and password.");
            return;
        }

        setLoading(true);
        try {
            const success = await fetchAdminData(username, password);

            if (success) {
                setLoggedInAdmin(username);
                router.push('/admin');
            } else {
                setErrorMessage("Invalid username or password. Please try again.");
                setPassword("");
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setErrorMessage("An unexpected error occurred. Please try again.");
            setPassword("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-12 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Admin Login</h2>
                {errorMessage && (
                    <div className="text-red-500 mb-4">{errorMessage}</div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-500 transition"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;