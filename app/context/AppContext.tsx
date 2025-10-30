"use client";

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react'; // Added useCallback
import type { AppState, GlobalAppStateContext } from '../../utils/authTypes'; // Updated import
import { authApi } from '../../utils/auth'; // Import authApi
import { WalletTransaction } from '../types/wallet'; // Import WalletTransaction

// Updated AppContextType to match GlobalAppStateContext
const AppContext = createContext<GlobalAppStateContext | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppState | null>(null);
  const [isOffline, setIsOffline] = useState(false); // New offline state
  const [isReconnecting, setIsReconnecting] = useState(false); // New reconnecting state

  // Initialize state from localStorage on mount
  useEffect(() => {
    try {
      const storedState = localStorage.getItem('appState');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        // Ensure isOffline is set to false on initial load from localStorage
        setAppData({ ...parsedState, isOffline: false }); 
      }
    } catch (error) {
      // console.error('Failed to parse stored app state:', error); // Removed console.error
      localStorage.removeItem('appState');
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    if (appData) {
      localStorage.setItem('appState', JSON.stringify(appData));
    }
  }, [appData]);

  // Function to handle setting app data, ensuring isOffline is managed
  const handleSetAppData = useCallback((data: AppState) => {
    setAppData(prev => ({ ...data, isOffline: prev?.isOffline || false })); // Preserve isOffline status
  }, []);

  // Function to attempt reconnection
  const attemptReconnect = useCallback(async () => {
    if (isReconnecting) return false; // Prevent multiple reconnection attempts
    setIsReconnecting(true);
    try {
      // Call updateAppData, which will update the global app state
      await authApi.updateAppData(handleSetAppData);
      setIsOffline(false); // If successful, set offline status to false
      setIsReconnecting(false);
      return true;
    } catch (error) {
      // If updateAppData fails, remain offline
      setIsReconnecting(false);
      return false;
    }
  }, [isReconnecting, handleSetAppData]);

  // Global transaction status checker
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const checkPendingTransactions = async () => {
      // Only check if online
      if (!isOffline && appData?.data?.transactions?.data) {
        const transactionsObj = appData.data.transactions;
        const headers = transactionsObj.headers;
        const data = transactionsObj.data;
        // Assuming data is an array of WalletTransaction objects
        const hasPending = data.some((tx: WalletTransaction) => tx.status === 'pending');

        if (hasPending) {
          // console.log('Pending transactions detected, updating app data...'); // Removed console.log
          await authApi.updateAppData(handleSetAppData);
        }
      }
    };

    // Start checking only if appData is loaded, there's a user, and not offline
    if (appData?.user && !isOffline) {
      intervalId = setInterval(checkPendingTransactions, 60 * 1000); // Every minute
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [appData?.data?.transactions, appData?.user, isOffline, handleSetAppData]); // Re-run if transactions, user, or offline status changes

  const clearAppData = () => {
    setAppData(null);
    setIsOffline(false); // Also reset offline status on logout
    localStorage.removeItem('appState');
    // Clear auth cookies
    document.cookie = 'loggedInAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'verifyStatus=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  return (
    <AppContext.Provider value={{ 
      appData, 
      setAppData: handleSetAppData, 
      clearAppData,
      isOffline, // Provide isOffline
      setIsOffline, // Provide setIsOffline
      attemptReconnect, // Provide attemptReconnect
      isReconnecting // Provide isReconnecting
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
