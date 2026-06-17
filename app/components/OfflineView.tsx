"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from './LoadingSpinner';

interface OfflineViewProps {
  onReconnect: () => void;
  isReconnecting: boolean;
}

export default function OfflineView({ onReconnect, isReconnecting }: OfflineViewProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-lg" />
        <span className="text-sm font-semibold">
          You are offline. Showing cached pages. Offline mode active.
        </span>
      </div>
      <button
        onClick={onReconnect}
        disabled={isReconnecting}
        className="bg-white text-red-600 font-bold px-3 py-1 rounded text-xs hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center space-x-1"
      >
        {isReconnecting ? (
          <>
            <LoadingSpinner size="small" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faRedo} />
            <span>Retry Connection</span>
          </>
        )}
      </button>
    </div>
  );
}
