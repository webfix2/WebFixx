"use client";

import { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <LoadingContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}