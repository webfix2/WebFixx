"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../UserContext';
import AdminLogin from '../components/AdminLogin';
import UserTable from '../components/UserTable';
import TicketTable from '../components/TicketTable';
import { User, Ticket } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTicketAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard() {
    const router = useRouter();
    const {
        admin,
        users: allUsers,
        tickets: allTickets,
        fetchAllUsers,
        fetchAllTickets,
        setUsers,
        setTickets,
        setAdmin,
        setLoading
    } = useUser();

    const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
    const [users, setFilteredUsers] = useState<User[]>([]);
    const [tickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'tickets'>('users');
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null); // Track session validity

    useEffect(() => {
        const adminUsername = sessionStorage.getItem("loggedInAdmin");
        const adminData = sessionStorage.getItem('adminData');
    
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                setIsSessionValid(true); // Session is valid
                fetchAllUsers();
                fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
                sessionStorage.removeItem('adminData');
                sessionStorage.removeItem('loggedInAdmin');
                setAdmin(null);
                setLoggedInAdmin(null);
                setIsSessionValid(false); // Session is invalid
            }
        } else if (adminUsername) {
            sessionStorage.removeItem('loggedInAdmin');
            setLoggedInAdmin(null);
            setIsSessionValid(false); // Session is invalid
        } else {
            setLoggedInAdmin(null);
            setIsSessionValid(false); // Session is invalid
        }
    }, [setAdmin]); // Removed `fetchAllUsers` and `fetchAllTickets` from dependency array

    
    


    useEffect(() => {
        if (isSessionValid === true && loggedInAdmin && Array.isArray(allUsers)) {
            const filteredUsers = allUsers.filter((u) => u.admin === loggedInAdmin);
            setFilteredUsers(filteredUsers);
        } else {
            setFilteredUsers([]); // Reset filtered users if session is invalid
        }
    }, [allUsers, loggedInAdmin, isSessionValid]);
    
    useEffect(() => {
        if (isSessionValid === false) {
            router.replace('/admin'); // Redirect to login page if session is invalid
        }
    }, [isSessionValid]);
    
    useEffect(() => {
        if (isSessionValid === true && loggedInAdmin && Array.isArray(allTickets)) {
            const filteredTickets = allTickets.filter((t) => t.admin === loggedInAdmin);
            setFilteredTickets(filteredTickets);
        } else {
            setFilteredTickets([]); // Reset filtered tickets if session is invalid
        }
    }, [allTickets, loggedInAdmin, isSessionValid]);

    const handleLogout = () => {
        sessionStorage.removeItem("loggedInAdmin");
        sessionStorage.removeItem("adminData");
        setLoggedInAdmin(null);
        setAdmin(null);
        setLoading(false);
        setUsers([]);
        setTickets([]);
        setIsSessionValid(false); // Explicitly invalidate session
        router.push('/admin');
    };

    if (isSessionValid === false || loggedInAdmin === null || admin === null) {
        return <AdminLogin setLoggedInAdmin={setLoggedInAdmin} setUsers={setFilteredUsers} />;
    }

    return (
        <main className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
                        Admin Dashboard
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-4 py-2 rounded-md flex items-center ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                                <span>Users</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('tickets')}
                                className={`px-4 py-2 rounded-md flex items-center ${activeTab === 'tickets' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                                <FontAwesomeIcon icon={faTicketAlt} className="mr-2" />
                                <span>Tickets</span>
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
                {activeTab === 'users' ? (
                    <UserTable users={users} tickets={tickets} />
                ) : (
                    <TicketTable tickets={tickets} users={users} />
                )}
            </div>
        </main>
    );
}