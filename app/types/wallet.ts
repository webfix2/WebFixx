export type PaymentMethod = 'BTC' | 'ETH' | 'USDT';

export interface PaymentDetails {
  orderId: string;
  amount: string;
  currency: PaymentMethod;
  address: string;
  timeRemaining: number;
  exchangeRate: string;
  btcAmount: string;
  ethAmount: string;
  usdtAmount: string;
  usdAmount: string;
}

export interface PaymentResponseData {
  orderId: string;
  amount: string;
  timeRemaining: number;
  exchangeRate: string;
  btcAmount: string;
  ethAmount: string;
  usdtAmount: string;
  address?: string;
  newBalance?: string;
}

export interface PaymentApiResponse {
  success: boolean;
  error?: string;
  data: PaymentResponseData;
}

// Helper function to convert SecuredApiResponse to PaymentApiResponse
export function convertToPaymentResponse(response: any): PaymentApiResponse {
  if (!response.success) {
    return {
      success: false,
      error: response.error || 'Payment processing failed',
      data: {
        orderId: '',
        amount: '',
        timeRemaining: 0,
        exchangeRate: '',
        btcAmount: '',
        ethAmount: '',
        usdtAmount: ''
      }
    };
  }

  return {
    success: true,
    data: {
      orderId: response.data?.orderId || '',
      amount: response.data?.amount || '',
      timeRemaining: response.data?.timeRemaining || 300,
      exchangeRate: response.data?.exchangeRate || '',
      btcAmount: response.data?.btcAmount || '0',
      ethAmount: response.data?.ethAmount || '0',
      usdtAmount: response.data?.usdtAmount || '0',
      address: response.data?.address,
      newBalance: response.data?.newBalance
    }
  };
}

// WALLET PAGE TYPES
export interface WalletTransaction {
  id: string;
  reference: string;
  timestamp: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  purpose?: string;
  amount: string;
  currency: 'USD' | 'BTC' | 'ETH' | 'USDT';
  status: 'pending' | 'completed' | 'failed';
}

export interface WalletBalance {
  balance: string;
  pendingBalance: string;
  currency: string;
}

export interface WalletState {
  balance: WalletBalance;
  transactions: WalletTransaction[];
  addresses: CryptoAddress[];
  isLoading: boolean;
  error: string | null;
}

export interface CryptoAddress {
  address: string;
  network: 'BTC' | 'ETH' | 'USDT';
  qrCode: string;
}
