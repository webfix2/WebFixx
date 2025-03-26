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
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { UserProvider, useUser } from './UserContext';
import { useEffect, useState } from 'react';

library.add(faUser, faSearch, faDashboard, faEnvelope, faLink, faCode, faBars, faTimes);

export default function RootLayout({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: { className: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const admin = sessionStorage.getItem("loggedInAdmin");
    if (admin) {
      setLoggedInAdmin(admin);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInAdmin");
    setLoggedInAdmin(null);
    router.push('/');
  };

  const shouldShowSidebar =
    pathname !== '/account' &&
    pathname !== '/invalid' &&
    pathname !== '/root' ;
    // pathname !== '/' &&
    // pathname !== '/admin';
    
  const [walletBalance] = useState("0.00"); // Add this state for wallet balance

  const NavLinks = () => (
    <div className="flex flex-col w-full space-y-2">
      <Link href="/dashboard" className="nav-link">
        <FontAwesomeIcon icon={faDashboard} className="w-5 h-5" />
        <span className="ml-3">Dashboard</span>
      </Link>
      <Link href="/email-campaign" className="nav-link">
        <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
        <span className="ml-3">Email Campaign</span>
      </Link>
      <Link href="/project-links" className="nav-link">
        <FontAwesomeIcon icon={faLink} className="w-5 h-5" />
        <span className="ml-3">Project Links</span>
      </Link>
      <Link href="/tools" className="nav-link">
        <FontAwesomeIcon icon={faCode} className="w-5 h-5" />
        <span className="ml-3">Tools</span>
      </Link>
      <Link href="/wallet" className="nav-link">
        <FontAwesomeIcon icon={faWallet} className="w-5 h-5" />
        <span className="ml-3">Wallet</span>
      </Link>
    </div>
  );

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <UserProvider>
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
                  <div className="p-4 border-t">
                    {loggedInAdmin ? (
                      <button onClick={handleLogout} className="btn-primary w-full">
                        Logout
                      </button>
                    ) : (
                      <Link href="/signin" className="btn-primary block text-center">
                        Sign In
                      </Link>
                    )}
                  </div>
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
        </UserProvider>

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