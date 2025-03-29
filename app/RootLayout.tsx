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
  faTimes,
  faWallet,
  faRandom,
  faTools,
  faCog, 
  faMoon,
  faUsers,
  faMoneyBill,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { useEffect, useState } from 'react';
import { useAppState } from './context/AppContext';

library.add(faUser, faSearch, faDashboard, faEnvelope, faLink, faCode, faBars, faTimes, faWallet, faRandom, faTools, faCog, faMoon, faUsers, faMoneyBill, faSun);

export default function RootLayout({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: { className: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { appData, clearAppData } = useAppState();
  const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
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

  useEffect(() => {
    const admin = sessionStorage.getItem("loggedInAdmin");
    if (admin) {
      setLoggedInAdmin(admin);
    }
  }, []);

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

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInAdmin");
    setLoggedInAdmin(null);
    clearAppData();
    router.push('/');
  };

  const shouldShowSidebar =
    pathname !== '/account' &&
    pathname !== '/invalid' &&
    pathname !== '/root' &&
    pathname !== '/' &&
    pathname !== '/reset-password' &&
    pathname !== '/admin';

  const [walletBalance] = useState(appData?.data?.transactions?.[0]?.balance || "0.00");

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
        <Link href="/project-links" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faLink} className="w-5 h-5" />
          <span className="ml-3">Project Links</span>
        </Link>
      )}
      {visibleLinks.redirectLinks && (
        <Link href="/redirect-links" className="nav-link" onClick={handleNavClick}>
          <FontAwesomeIcon icon={faRandom} className="w-5 h-5" />
          <span className="ml-3">Redirect Links</span>
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
      {loggedInAdmin && (
        <button onClick={handleLogout} className="btn-primary w-full">
          Logout
        </button>
      )}
    </div>
  );

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
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
                  <span className="text-sm font-medium">${walletBalance}</span>
                </div>
              </div>
            </header>

            {/* Sidebar */}
            <aside className={`
              fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}>
              <div className="flex flex-col h-full">
                {/* Logo and Wallet Balance for Desktop */}
                <div className="p-4 border-b flex justify-between items-center">
                  <Link href="/" className="flex items-center">
                    <span className="text-blue-600 font-bold text-2xl">WebFixx</span>
                  </Link>
                  <div className="hidden lg:flex items-center">
                    <FontAwesomeIcon icon={faWallet} className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">${walletBalance}</span>
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
        <main className={`
          ${shouldShowSidebar ? 'lg:ml-64' : ''} 
          ${shouldShowSidebar ? 'mt-16 lg:mt-0' : ''}
          min-h-screen p-4
        `}>
          {children}
        </main>

        <style jsx>{`
          .nav-link {
            @apply flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors w-full;
          }
          .btn-primary {
            @apply bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors;
          }
        `}</style>
      </body>
    </html>
  );
}