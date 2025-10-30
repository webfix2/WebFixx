"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons'; // Changed faWifiSlash to faExclamationTriangle
import { useAppState } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

interface OfflineViewProps {
  onReconnect: () => void;
  isReconnecting: boolean;
}

export default function OfflineView({ onReconnect, isReconnecting }: OfflineViewProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-95 text-gray-900 dark:text-white p-4">
      <div className="text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-red-500 dark:text-red-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">You are Offline</h1>
        <p className="text-lg mb-8">
          It looks like you've lost your internet connection or the server is unreachable.
          Please check your connection and try again.
        </p>
        <button
          onClick={onReconnect}
          disabled={isReconnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {isReconnecting ? (
            <>
              <LoadingSpinner size="small" /> {/* Removed color prop */}
              <span className="ml-3">Reconnecting...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faRedo} className="mr-3" />
              <span>Reconnect</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
