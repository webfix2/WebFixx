import type { CryptoAddress, WalletState, WalletTransaction } from '../app/types/wallet';
import type { UserData } from './auth'; // Import UserData from auth.ts

export interface SecuredApiRequest {
    [key: string]: any;
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
    user: UserData | null; // Use UserData here
    data: {
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
      limits?: {
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
