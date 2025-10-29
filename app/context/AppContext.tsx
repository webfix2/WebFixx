"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import type { AppState } from '../../utils/authTypes';
import { authApi } from '../../utils/auth'; // Import authApi
import { WalletTransaction } from '../types/wallet'; // Import WalletTransaction

interface AppContextType {
  appData: AppState | null;
  setAppData: (data: AppState) => void;
  clearAppData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppState | null>(null);

  // Initialize state from localStorage on mount
  useEffect(() => {
    try {
      const storedState = localStorage.getItem('appState');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        setAppData(parsedState);
      }
    } catch (error) {
      console.error('Failed to parse stored app state:', error);
      localStorage.removeItem('appState');
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    if (appData) {
      localStorage.setItem('appState', JSON.stringify(appData));
    }
  }, [appData]);

  // Global transaction status checker
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const checkPendingTransactions = async () => {
      if (appData?.data?.transactions?.data) {
        const transactionsObj = appData.data.transactions;
        const headers = transactionsObj.headers;
        const data = transactionsObj.data;
        // Assuming data is an array of WalletTransaction objects
        const hasPending = data.some((tx: WalletTransaction) => tx.status === 'pending');

        if (hasPending) {
          console.log('Pending transactions detected, updating app data...');
          await authApi.updateAppData(setAppData);
        }
      }
    };

    // Start checking only if appData is loaded and there's a user
    if (appData?.user) {
      intervalId = setInterval(checkPendingTransactions, 60 * 1000); // Every minute
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [appData?.data?.transactions, appData?.user, setAppData]); // Re-run if transactions or user changes

  const handleSetAppData = (data: AppState) => {
    setAppData(data);
  };

  const clearAppData = () => {
    setAppData(null);
    localStorage.removeItem('appState');
    // Clear auth cookies
    document.cookie = 'loggedInAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'verifyStatus=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  return (
    <AppContext.Provider value={{ 
      appData, 
      setAppData: handleSetAppData, 
      clearAppData 
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
