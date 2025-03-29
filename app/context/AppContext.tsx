"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

interface AppState {
  user: User;
  data: {
    user: any;
    users?: any[];
    transactions: any[];
    projects: any[];
    template: any[];
    hub: any[];
    links?: any[];
    sender?: any[];
  };
}

interface AppContextType {
  appData: AppState | null;
  setAppData: (data: AppState) => void;
  clearAppData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appData, setAppData] = useState<AppState | null>(null);

  const clearAppData = () => {
    setAppData(null);
  };

  return (
    <AppContext.Provider value={{ appData, setAppData, clearAppData }}>
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