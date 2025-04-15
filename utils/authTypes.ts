import type { CryptoAddress, WalletState, WalletTransaction } from '../app/types/wallet';

export interface SecuredApiRequest {
    [key: string]: any;
}

export interface User {
    id: string;
    userId: string;
    email: string;
    username: string;
    role: 'ADMIN' | 'USER';
    verifyStatus: string;
    btcAddress: string; // Add Bitcoin address
    ethAddress: string;
    usdtAddress: string;
    balance: string;
    pendingBalance: string;
    addresses?: CryptoAddress[];
}

export interface SecuredApiResponse {
    success: boolean;
    error?: string;
    data?: any;
    details?: any;
    needsVerification?: boolean;
    transactionId?: string;
    newBalance?: string;
}

export interface AppState {
    user: User | null;
    data: {
      user?: User;
      transactions: {
        success: boolean;
        headers: string[];
        data: any[];
        count: number;
      };
      projects: {
        success: boolean;
        headers: string[];
        data: any[];
        count: number;
      };
      template: {
        success: boolean;
        headers: string[];
        data: any[];
        count: number;
      };
      hub: {
        success: boolean;
        headers: string[];
        data: any[];
        count: number;
      };
      redirect?: {
        success: boolean;
        headers: string[];
        data: any[];
        count: number;
      };
      custom?: {
        success: boolean;
        headers: string[];
        data: any[];
        count: number;
      };
      sender?: {
        success: boolean;
        headers: string[];
        data: any[];
        count: number;
      };
      users?: {
        success: boolean;
        headers: string[];
        data: any[];
        count: number;
      };
    };
    isAuthenticated: boolean;
}