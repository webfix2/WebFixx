import type { SecuredApiRequest, SecuredApiResponse } from './authTypes';

const API_BASE_URL = 'https://webfixx-backend.vercel.app/api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: 'ADMIN' | 'USER';
  };
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

export interface ResetPasswordData {
  email: string;
}

export const authApi = {
  login: async (data: LoginData) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  register: async (data: RegisterData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }

    return response.json();
  },

  logout: () => {
    localStorage.removeItem('authToken');
    // Add any other cleanup needed
  }
};

export const securedApi = {
  callBackendFunction: async (data: SecuredApiRequest): Promise<SecuredApiResponse> => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/backend-function`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
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