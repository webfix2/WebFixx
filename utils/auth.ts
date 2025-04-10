import type { SecuredApiRequest, SecuredApiResponse } from './authTypes';
import type { CryptoAddress, WalletState, WalletTransaction } from '../app/types/wallet';

const API_BASE_URL = 'https://web-fixx-hoo.vercel.app/api';
// const API_BASE_URL = 'https://webfixx-backend.vercel.app/api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
}

export interface LoginData {
  email: string;
  password: string;
  deviceInfo: DeviceInfo;
}

export interface TokenData {
  token: string;
  createdAt: string;
  expiresAt: string;
  deviceInfo: DeviceInfo;
  lastUsed: string;
}

export interface UserData {
  id: string;
  userId: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'USER';
  verifyStatus: 'TRUE' | 'FALSE' | '';
  btcAddress: string;
  ethAddress: string;
  usdtAddress: string;
  balance: string;
  pendingBalance: string;
  addresses?: CryptoAddress[];
  tokens?: TokenData[];
}

export interface AppData {
  user: any;
  users?: any[];
  transactions: WalletTransaction[];
  projects: any[];
  template: any[];
  hub: any[];
  redirect?: any[];
  custom?: any[];
  sender?: any[];
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserData;
  data: AppData;
  needsVerification: boolean;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    userId: string;
    email: string;
    username: string;
  };
}

export interface VerificationStatus {
  isVerified: boolean;
  message?: string;
  error?: string;
}

export interface TokenValidationResponse {
  success: boolean;
  data?: {
    user: UserData;
    transactions?: WalletTransaction[];
    projects?: any[];
    template?: any[];
    hub?: any[];
    redirect?: any[];
    custom?: any[];
    sender?: any[];
    users?: any[];
  };
  needsVerification?: boolean;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  data: AppData | null;
  error: string | null;
  isLoading: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface ErrorResponse {
  error: string;
}

export interface VerifyResetCodeData {
  email: string;
  code: string;
}

export interface UpdatePasswordData {
  email: string;
  newPassword: string;
}

// Helper function to convert object to URLSearchParams
function objectToFormData(obj: Record<string, any>): string {
  const formData = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });
  return formData.toString();
}

// Utility functions
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

let appStateRef: any = null;

export const setAppState = (state: any) => {
  appStateRef = state;
};

const getAppState = () => {
  return appStateRef;
};

export const authApi = {
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    console.log('Sending registration request:', data);

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: objectToFormData({ 
        action: 'register',
        ...data 
      }),
    });

    const responseData = await response.json();
    console.log('Registration response:', responseData);

    if (!response.ok || responseData.error) {
      throw new Error(responseData.error || 'Registration failed');
    }

    if (!responseData.success) {
      throw new Error(responseData.message || 'Registration failed');
    }

    return responseData;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: objectToFormData({ 
        action: 'login',
        ...data 
      }),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      throw new Error(responseData.error || 'Login failed');
    }

    if (!responseData.token || !responseData.user) {
      throw new Error('Invalid response format');
    }

    return {
      success: responseData.success,
      token: responseData.token,
      user: {
        id: responseData.user.id,
        userId: responseData.user.userId,
        email: responseData.user.email,
        username: responseData.user.username,
        role: responseData.user.role,
        verifyStatus: responseData.user.verifyStatus,
        btcAddress: responseData.user.btcAddress || '',
        ethAddress: responseData.user.ethAddress || '',
        usdtAddress: responseData.user.usdtAddress || '',
        balance: responseData.user.balance || '0.00',
        pendingBalance: responseData.user.pendingBalance || '0.00',
        addresses: responseData.user.addresses || [],
        tokens: responseData.user.tokens || []
      },
      data: {
        user: responseData.data?.user || null,
        users: responseData.data?.users || [],
        transactions: responseData.data?.transactions || [],
        projects: responseData.data?.projects || [],
        template: responseData.data?.template || [],
        hub: responseData.data?.hub || [],
        redirect: responseData.data?.redirect || [],
        custom: responseData.data?.custom || [],
        sender: responseData.data?.sender || []
      },
      needsVerification: responseData.needsVerification || false,
      error: responseData.error || undefined
    };
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: objectToFormData({
        action: 'resetPassword',
        ...data
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Password reset failed');
    }

    return response.json();
  },

  verifyResetCode: async (data: VerifyResetCodeData) => {
    const response = await fetch(`${API_BASE_URL}/verify-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: objectToFormData({
        action: 'verifyResetCode',
        ...data
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Code verification failed');
    }

    return response.json();
  },

  updatePassword: async (data: UpdatePasswordData) => {
    const response = await fetch(`${API_BASE_URL}/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: objectToFormData({
        action: 'updatePassword',
        ...data
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Password update failed');
    }

    return response.json();
  },

  updateAppData: async (setAppDataFunc?: any) => {
    try {
      const token = document.cookie.match('(^|;)\\s*loggedInAdmin\\s*=\\s*([^;]+)')?.pop();
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${API_BASE_URL}/backend-function`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: objectToFormData({
          token,
          functionName: 'updateAppData'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Raw API response:', text); // Debug log

      if (!text) {
        throw new Error('Empty response from server');
      }

      try {
        const result = JSON.parse(text);
        
        // Update the app state with the new data if setAppDataFunc is provided
        if (result && result.success && setAppDataFunc && typeof setAppDataFunc === 'function') {
          // Create the updated app state object
          const updatedAppState = {
            user: result.user,
            data: result.data || {},
            isAuthenticated: true
          };
          
          // Update the app state using the provided function
          console.log('Updating app state with:', updatedAppState);
          setAppDataFunc(updatedAppState);
        } else if (result && result.success) {
          // Try to use the global app state if available
          const appState = getAppState();
          if (appState && appState.setAppData) {
            // Create the updated app state object
            const updatedAppState = {
              user: result.user || appState.appData?.user,
              data: result.data || appState.appData?.data || {},
              isAuthenticated: true
            };
            
            // Update the app state
            console.log('Updating app state with global context:', updatedAppState);
            appState.setAppData(updatedAppState);
          } else {
            console.log('No setAppData function provided and global app state not available');
          }
        }
        
        return result;
      } catch (e) {
        console.error('Failed to parse response:', text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Failed to update app data:', error);
      throw error;
    }
  },

  logout: async (token: string) => {
    try {
      const response = await securedApi.callBackendFunction({
        functionName: 'logout',
        token
      });

      // Clear cookies
      document.cookie = 'loggedInAdmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'verifyStatus=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      return response;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
};

export const securedApi = {
  callBackendFunction: async (data: SecuredApiRequest): Promise<SecuredApiResponse> => {
    const token = document.cookie.match('(^|;)\\s*loggedInAdmin\\s*=\\s*([^;]+)')?.pop();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/backend-function`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: objectToFormData({
          action: 'backendFunction',
          token, // Add token to params
          ...data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      return response.json();
    } catch (error) {
      console.error('Secured API Error:', error);
      throw error;
    }
  }
};

export const checkAuth = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }
  return token;
};