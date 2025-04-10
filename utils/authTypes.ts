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
      transactions: any[];
      projects: any[];
      template: any[];
      hub: any[];
      redirect?: any[];
      custom?: any[];
      sender?: any[];
      users?: any[];
    };
    isAuthenticated: boolean;
}