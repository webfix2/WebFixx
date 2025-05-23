"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSearch, 
  faDashboard, 
  faEnvelope, 
  faLink, 
  faCode,
  faBars,
  faWallet,
  faRandom,
  faTools,
  faCog, 
  faMoon,
  faUsers,
  faMoneyBill,
  faSun,
  faComments,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { useEffect, useState } from 'react';
import { useAppState } from './context/AppContext';
import { securedApi, authApi } from '../utils/auth';
import LoadingSpinner from './components/LoadingSpinner';
import { useLoading } from './context/LoadingContext';
import ChatBot from './components/ChatBot';

library.add(faUser, faSearch, faDashboard, faEnvelope, faLink, faCode, faBars, faTimes, faWallet, faRandom, faTools, faCog, faMoon, faUsers, faMoneyBill, faSun, faComments, faTimes);

interface RootLayoutProps {
  children: React.ReactNode;
  inter: { className: string };
}

export default function RootLayout({ children, inter }: RootLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { appData, setAppData, clearAppData } = useAppState();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleLinks, setVisibleLinks] = useState({
    dashboard: false,
    emailCampaign: false,
    projectLinks: false,
    redirectLinks: false,
    customDev: false,
    tools: false,
    wallet: false,
    settings: false,
    rootDashboard: false,
    users: false,
    transactions: false,
    rootSettings: false
  });
  const { isNavigating, setIsNavigating } = useLoading();

  useEffect(() => {
    if (appData?.user) {
      if (appData.user.role === 'ADMIN') {
        setVisibleLinks({
          dashboard: false,
          emailCampaign: false,
          projectLinks: false,
          redirectLinks: false,
          customDev: false,
          tools: false,
          wallet: false,
          settings: false,
          rootDashboard: true,
          users: true,
          transactions: true,
          rootSettings: true
        });
      } else {
        setVisibleLinks({
          dashboard: true,
          emailCampaign: false,
          projectLinks: true,
          redirectLinks: true,
          customDev: false,
          tools: false,
          wallet: true,
          settings: true,
          rootDashboard: false,
          users: false,
          transactions: false,
          rootSettings: false
        });
      }
    }
  }, [appData]);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const restoreSession = async () => {
      try {
        const token = document.cookie.match('(^|;)\\s*loggedInAdmin\\s*=\\s*([^;]+)')?.pop();
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        if (isMounted) {
          console.log('Validating session...');
          const response = await securedApi.callBackendFunction({
            functionName: 'validateUserToken',
            token
          });

          console.log('Session validation response:', response);

          if (response.success && response.data?.user && isMounted) {
            // Only update if we have valid user data
            setAppData({
              user: response.data.user,
              data: {
                transactions: response.data.transactions || [],
                projects: response.data.projects || [],
                template: response.data.template || [],
                hub: response.data.hub || [],
                redirect: response.data.redirect || [],
                custom: response.data.custom || [],
                sender: response.data.sender || [],
                users: response.data.users || []
              },
              isAuthenticated: true
            });

            // Update verification status cookie
            document.cookie = `verifyStatus=${response.data.user.verifyStatus}; path=/; max-age=2592000`;
            
            console.log('Session restored successfully');
          } else {
            // Only logout if the token is actually invalid
            if (response.error === 'Token expired' || response.error === 'Invalid token') {
              console.log('Token invalid, logging out:', response.error);
              handleLogout();
            } else {
              console.log('Session validation failed but token might be valid:', response.error);
            }
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
        // Only logout on specific errors
        if (error instanceof Error && 
            (error.message.includes('token') || error.message.includes('auth'))) {
          handleLogout();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial session restore
    restoreSession();

    // Set up interval for periodic validation (1 hour)
    intervalId = setInterval(restoreSession, 60 * 60 * 1000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsNavigating(false);
    };

    const handleRouteStart = () => {
      setIsNavigating(true);
    };

    // Watch for pathname changes
    if (pathname) {
      handleRouteChange();
    }

    return () => {
      // Cleanup
    };
  }, [pathname, setIsNavigating]);

  const handleLogout = async () => {
    try {
      const token = document.cookie.match('(^|;)\\s*loggedInAdmin\\s*=\\s*([^;]+)')?.pop();
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAppData();
      // Clear cookies
      document.cookie = 'loggedInAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'verifyStatus=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      setVisibleLinks({
        dashboard: false,
        emailCampaign: false,
        projectLinks: false,
        redirectLinks: false,
        customDev: false,
        tools: false,
        wallet: false,
        settings: false,
        rootDashboard: false,
        users: false,
        transactions: false,
        rootSettings: false
      });
      
      window.location.href = '/';
    }
  };

  const shouldShowSidebar = pathname !== '/' && 
                           pathname !== '/account' && 
                           pathname !== '/invalid' && 
                           pathname !== '/root' && 
                           pathname !== '/reset-password' && 
                           pathname !== '/verify' && 
                           pathname !== '/admin';

  const userBalance = appData?.user?.balance || "0.00";

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const NavLinks = () => (
    <div className="flex flex-col w-full space-y-2">
      {visibleLinks.rootDashboard && (
        <Link href="/root" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faDashboard} className="w-5 h-5" />
          <span className="ml-3">Admin Dashboard</span>
        </Link>
      )}
      {visibleLinks.users && (
        <Link href="/root/users" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
          <span className="ml-3">Users</span>
        </Link>
      )}
      {visibleLinks.transactions && (
        <Link href="/root/transactions" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faMoneyBill} className="w-5 h-5" />
          <span className="ml-3">Transactions</span>
        </Link>
      )}
      {visibleLinks.dashboard && (
        <Link href="/dashboard" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faDashboard} className="w-5 h-5" />
          <span className="ml-3">Dashboard</span>
        </Link>
      )}
      {visibleLinks.emailCampaign && (
        <Link href="/email-campaign" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
          <span className="ml-3">Email Campaign</span>
        </Link>
      )}
      {visibleLinks.projectLinks && (
        <Link href="/projects" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faLink} className="w-5 h-5" />
          <span className="ml-3">Links</span>
        </Link>
      )}
      {visibleLinks.redirectLinks && (
        <Link href="/redirect" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faRandom} className="w-5 h-5" />
          <span className="ml-3">Redirect</span>
        </Link>
      )}
      {visibleLinks.customDev && (
        <Link href="/custom-dev" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faTools} className="w-5 h-5" />
          <span className="ml-3">Custom Development</span>
        </Link>
      )}
      {visibleLinks.tools && (
        <Link href="/tools" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faCode} className="w-5 h-5" />
          <span className="ml-3">Tools</span>
        </Link>
      )}
      {visibleLinks.wallet && (
        <Link href="/wallet" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faWallet} className="w-5 h-5" />
          <span className="ml-3">Wallet</span>
        </Link>
      )}
      {visibleLinks.settings && (
        <Link href="/settings" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
          <span className="ml-3">Settings</span>
        </Link>
      )}
      {visibleLinks.rootSettings && (
        <Link href="/root/settings" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
          <span className="ml-3">Admin Settings</span>
        </Link>
      )}
    </div>
  );

  const UserControls = () => (
    <div className="p-4 border-t">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="w-5 h-5" />
        </button>
        <Link 
          href={appData?.user?.role === 'ADMIN' ? "/root/settings" : "/settings"}
          className="p-2 rounded-lg hover:bg-gray-100"
          onClick={handleNavClick}
        >
          <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
        </Link>
      </div>
      {appData?.user && (
        <button onClick={handleLogout} className="btn-primary w-full">
          Logout
        </button>
      )}
    </div>
  );

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Show full-screen loading state during initial load
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner 
          fullScreen 
          size="large" 
          text="Loading WebFixx..." 
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      {isNavigating && (
        <LoadingSpinner 
          overlay 
          size="default" 
          text="Loading..." 
        />
      )}

      {shouldShowSidebar && (
        <>
          {/* Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* Mobile Header */}
          <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white shadow-sm h-16">
            <div className="flex items-center justify-between px-4 h-full">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2"
              >
                <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} className="w-6 h-6" />
              </button>
              <Link href="/" className="text-blue-600 font-bold text-xl">
                WebFixx
              </Link>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faWallet} className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">${userBalance}</span>
              </div>
            </div>
          </header>

          {/* Sidebar */}
          <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="flex flex-col h-full">
              {/* Logo and Wallet Balance for Desktop */}
              <div className="p-4 border-b flex justify-between items-center">
                <Link href="/" className="flex items-center">
                  <span className="text-blue-600 font-bold text-2xl">WebFixx</span>
                </Link>
                <div className="hidden lg:flex items-center">
                  <FontAwesomeIcon icon={faWallet} className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">${userBalance}</span>
                </div>
              </div>

              {/* Navigation Links - Now in a column */}
              <nav className="flex-1 px-4 py-6">
                <NavLinks />
              </nav>

              {/* User Section */}
              <UserControls />
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className={`${shouldShowSidebar ? 'lg:ml-64' : ''} ${shouldShowSidebar ? 'mt-16 lg:mt-0' : ''} min-h-screen p-4`}>
        {children}
      </main>

      {/* Add ChatBot if user is authenticated */}
      {appData?.isAuthenticated && <ChatBot />}

      <style jsx>{`
        .nav-link {
          @apply flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors w-full;
        }
        .btn-primary {
          @apply bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors;
        }
      `}</style>
    </div>
  );
}