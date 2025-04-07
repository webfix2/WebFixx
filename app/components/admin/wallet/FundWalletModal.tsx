import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faTimes, 
  faCopy, 
  faWallet,
  faArrowUpRightFromSquare 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faBtc, 
  faEthereum 
} from '@fortawesome/free-brands-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { QRCodeSVG } from 'qrcode.react';
import { securedApi } from "../../../../utils/auth";
import { useAppState } from "../../../../app/context/AppContext";
import { convertToPaymentResponse } from '../../../types/wallet';
import LoadingSpinner from '../../LoadingSpinner';
import type { 
  PaymentMethod, 
  PaymentDetails, 
  PaymentApiResponse,
  WalletTransaction 
} from '../../../types/wallet';
import { authApi } from '../../../../utils/auth';
import { timerStorage } from '../../../../utils/timer';

const iconMap: Record<string, IconDefinition> = {
  arrowLeft: faArrowLeft,
  times: faTimes,
  copy: faCopy,
  wallet: faWallet,
  btc: faBtc,
  ethereum: faEthereum
};

interface FundWalletModalProps {
  onClose: () => void;
}

type Step = 'amount' | 'method' | 'payment';

type TimeRemaining = {
  minutes: number;
  seconds: number;
};

type PaymentStatus = 'pending' | 'completed' | 'expired';

export default function FundWalletModal({ onClose }: FundWalletModalProps) {
  const { appData } = useAppState();
  const [currentStep, setCurrentStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ minutes: 30, seconds: 0 });
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const orderIdRef = useRef<string | null>(null);

  // Function to check payment status from app state
  const checkPaymentStatus = useCallback(async () => {
    if (!orderIdRef.current) return;

    try {
      // Update app data to get latest transactions
      const result = await authApi.updateAppData();
      
      if (!result?.data?.transactions) {
        console.log('No transactions found in response:', result);
        return;
      }

      // Find matching transaction by orderId
      const matchingTransaction = result.data.transactions.find(
        (tx: WalletTransaction) => tx.reference === orderIdRef.current
      );

      console.log('Found transaction:', matchingTransaction);

      if (matchingTransaction?.status === 'completed') {
        // Clear intervals before state updates
        if (countdownInterval) {
          clearInterval(countdownInterval);
          setCountdownInterval(null);
        }
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        setPaymentStatus('completed');
        // Show success message
        alert('Payment confirmed! Your balance has been updated.');
        onClose();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Don't throw the error - just log it and continue
    }
  }, [countdownInterval, onClose]);

  // Start status checking
  useEffect(() => {
    let isActive = true;
    
    const startStatusCheck = async () => {
      if (currentStep === 'payment' && paymentStatus === 'pending') {
        // Clear any existing interval
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }

        // Initial check
        if (isActive) {
          try {
            await checkPaymentStatus();
          } catch (error) {
            console.error('Initial status check failed:', error);
          }
        }

        // Set up interval for subsequent checks
        if (isActive) {
          statusCheckIntervalRef.current = setInterval(checkPaymentStatus, 120000); // 2 minutes
        }

        // Set timer for payment prompt (5 minutes)
        const promptTimeout = setTimeout(() => {
          if (isActive) {
            setShowPaymentPrompt(true);
          }
        }, 300000); // 5 minutes

        return () => {
          isActive = false;
          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
            statusCheckIntervalRef.current = null;
          }
          clearTimeout(promptTimeout);
        };
      }
    };

    startStatusCheck();

    return () => {
      isActive = false;
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [currentStep, paymentStatus, checkPaymentStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  const startCountdown = useCallback(() => {
    if (!paymentDetails?.orderId) return;

    // Initialize or get existing timer
    const storedTimer = timerStorage.getTimer(paymentDetails.orderId);
    if (!storedTimer) {
      // Start new 30-minute timer
      timerStorage.setTimer(paymentDetails.orderId, 1800);
    }

    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    const interval = setInterval(() => {
      if (!paymentDetails?.orderId) return;

      const remaining = timerStorage.getRemainingTime(paymentDetails.orderId);
      if (!remaining) {
        clearInterval(interval);
        handleExpiry();
        return;
      }

      setTimeRemaining(remaining);

      if (remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(interval);
        handleExpiry();
      }
    }, 1000);

    setCountdownInterval(interval);

    // Set initial time
    const initialTime = timerStorage.getRemainingTime(paymentDetails.orderId);
    if (initialTime) {
      setTimeRemaining(initialTime);
    }
  }, [paymentDetails?.orderId]);

  // Handle countdown expiry
  const handleExpiry = useCallback(() => {
    if (orderIdRef.current) {
      timerStorage.clearTimer(orderIdRef.current);
    }
    setPaymentStatus('expired');
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  }, [countdownInterval]);

  // Start/resume countdown when returning to payment view
  useEffect(() => {
    if (currentStep === 'payment' && paymentStatus === 'pending' && paymentDetails?.orderId) {
      const remaining = timerStorage.getRemainingTime(paymentDetails.orderId);
      if (remaining) {
        if (remaining.minutes === 0 && remaining.seconds === 0) {
          handleExpiry();
        } else {
          startCountdown();
        }
      }
    }
  }, [currentStep, paymentStatus, paymentDetails?.orderId, startCountdown, handleExpiry]);

  // Update orderIdRef when paymentDetails changes
  useEffect(() => {
    orderIdRef.current = paymentDetails?.orderId || null;
  }, [paymentDetails?.orderId]);

  const handlePaymentPromptResponse = (hasPaid: boolean) => {
    if (hasPaid) {
      // User claims they've paid, close modal as balance will update automatically
      onClose();
    } else {
      // User hasn't paid, hide prompt and continue showing payment view
      setShowPaymentPrompt(false);
    }
  };

  const handleProceed = async () => {
    const user = appData?.user;
    if (!user) return;
  
    console.log("Handling proceed with current step: ", currentStep);
    setIsLoading(true);
    
    if (currentStep === 'amount' && amount && agreed) {
      try {
        const requestData = {
          functionName: 'getCurrentValue',
          amount,
        };
        console.log('Data sent to API (getCurrentValue):', requestData);
  
        const apiResponse = await securedApi.callBackendFunction(requestData);
        console.log('API Response:', apiResponse);
  
        if (!apiResponse || !apiResponse.data) {
          console.error('API response does not contain the expected data:', apiResponse);
          setIsLoading(false);
          return;
        }
  
        const response = convertToPaymentResponse(apiResponse);
        console.log("Converted payment response:", response);
  
        if (response.success && response.data) {
          const paymentData: PaymentDetails = {
            orderId: response.data.orderId,
            amount: amount,
            currency: selectedMethod || 'BTC',
            address: '',
            timeRemaining: response.data.timeRemaining,
            exchangeRate: response.data.exchangeRate,
            btcAmount: response.data.btcAmount,
            ethAmount: response.data.ethAmount,
            usdtAmount: response.data.usdtAmount,
            usdAmount: amount
          };
          setPaymentDetails(paymentData);
          orderIdRef.current = paymentData.orderId;
          setCurrentStep('method');
        }
      } catch (error) {
        console.error('Failed to get exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 'method' && selectedMethod && paymentDetails) {
      try {
        const user = appData?.user;
        if (!user) {
          console.error('User data is not available');
          setIsLoading(false);
          return;
        }

        const coinValue = selectedMethod === 'BTC' 
          ? paymentDetails.btcAmount 
          : selectedMethod === 'ETH'
          ? paymentDetails.ethAmount
          : paymentDetails.usdtAmount;

        if (!coinValue) {
          console.error(`No ${selectedMethod} amount available`);
          setIsLoading(false);
          return;
        }

        const requestData = {
          functionName: 'initializePayment',
          userId: user.userId,
          amount: paymentDetails.amount,
          coinValue: coinValue,
          currency: selectedMethod,
          orderId: paymentDetails.orderId,
        };
        console.log('Data sent to API (initializePayment):', requestData);
  
        const apiResponse = await securedApi.callBackendFunction(requestData);
        console.log('Payment Initialization Response:', apiResponse);
  
        if (!apiResponse || !apiResponse.data) {
          console.error('API response does not contain the expected data:', apiResponse);
          setIsLoading(false);
          return;
        }
  
        const response = convertToPaymentResponse(apiResponse);
        console.log("Converted payment initialization response:", response);
  
        if (response.success && response.data) {
          const userAddress = selectedMethod === 'BTC' 
            ? user.btcAddress 
            : selectedMethod === 'ETH'
            ? user.ethAddress
            : user.usdtAddress;

          if (!userAddress) {
            console.error(`No ${selectedMethod} address found for user`);
            setIsLoading(false);
            return;
          }

          const updatedPaymentDetails: PaymentDetails = {
            ...paymentDetails,
            address: userAddress,
            timeRemaining: 1800,
            currency: selectedMethod
          };
  
          setPaymentDetails(updatedPaymentDetails);
          setTimeRemaining({ minutes: 30, seconds: 0 });
          startCountdown();
          setCurrentStep('payment');
        }
      } catch (error) {
        console.error('Payment initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getWalletUri = (method: PaymentMethod, address: string, amount: string) => {
    switch (method) {
      case 'BTC':
        return `bitcoin:${address}?amount=${amount}`;
      case 'ETH':
        return `ethereum:${address}?amount=${amount}`;
      case 'USDT':
        return `ethereum:${address}?amount=${amount}`;
      default:
        return '';
    }
  };

  const getPaymentWarning = (method: PaymentMethod) => {
    switch (method) {
      case 'BTC':
        return "Only send Bitcoin using the Bitcoin network. Do not send BTC using wrapped tokens or other networks.";
      case 'ETH':
        return "Do not send USDT or use BNB/Binance Network - ETH Only.";
      case 'USDT':
        return "Only send USDT using ERC-20 network.";
      default:
        return "";
    }
  };

  const renderIcon = (icon: keyof typeof iconMap) => (
    <FontAwesomeIcon icon={iconMap[icon]} />
  );

  const renderAmountStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Add funds</h3>
      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg text-sm text-yellow-800">
        We are unable to accept funds from OFAC/FATF sanctioned entities, illicit sources, and individuals from the following countries: Cuba, Iran, North Korea, Russia, Syria, Crimea Region of Ukraine
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="agreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="agreement" className="ml-2 text-sm text-gray-600">
            Check to confirm you understand.
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              min="20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 pr-4 py-2 w-full border rounded-lg"
              placeholder="20"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleProceed}
          disabled={!amount || !agreed}
          className="btn-primary disabled:opacity-50"
        >
          Make Payment
        </button>
      </div>
    </div>
  );

  const renderMethodStep = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => setCurrentStep('amount')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          {renderIcon('arrowLeft')}
        </button>
        <h3 className="text-xl font-bold text-gray-900 ml-2">
          Add Funds
        </h3>
      </div>
      <div className="text-2xl font-bold text-center py-4">
        ${amount} USD
      </div>
      <div className="space-y-4">
        <h4 className="font-medium">Choose Payment method</h4>
        
        {/* Bitcoin Option */}
        <button
          onClick={() => setSelectedMethod('BTC')}
          className={`w-full p-4 border rounded-lg flex items-center justify-between ${
            selectedMethod === 'BTC' ? 'border-orange-500 bg-orange-50' : ''
          }`}
        >
          <div className="flex items-center">
            {renderIcon('btc')}
            <span>Bitcoin (BTC)</span>
          </div>
          <span className="text-sm text-gray-500">≈ {paymentDetails?.btcAmount} BTC</span>
        </button>

        {/* Ethereum Option */}
        <button
          onClick={() => setSelectedMethod('ETH')}
          className={`w-full p-4 border rounded-lg flex items-center justify-between ${
            selectedMethod === 'ETH' ? 'border-blue-500 bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center">
            {renderIcon('ethereum')}
            <span>Ethereum (ETH)</span>
          </div>
          <span className="text-sm text-gray-500">≈ {paymentDetails?.ethAmount} ETH</span>
        </button>

        {/* USDT Option */}
        <button
          onClick={() => setSelectedMethod('USDT')}
          className={`w-full p-4 border rounded-lg flex items-center justify-between ${
            selectedMethod === 'USDT' ? 'border-green-500 bg-green-50' : ''
          }`}
        >
          <div className="flex items-center">
            <img src="/usdt-icon.svg" className="w-6 h-6 mr-2" alt="USDT" />
            <span>USDT (ERC-20)</span>
          </div>
          <span className="text-sm text-gray-500">≈ {paymentDetails?.usdtAmount} USDT</span>
        </button>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={handleProceed}
          disabled={!selectedMethod}
          className="btn-primary px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Continue
        </button>
      </div>
      <div className="text-xs text-gray-500 text-center">
        order id: {paymentDetails?.orderId}
      </div>
    </div>
  );

  const renderPaymentStep = () => {
    const walletUri = getWalletUri(
      selectedMethod!,
      paymentDetails?.address || '',
      selectedMethod === 'BTC' ? paymentDetails?.btcAmount || '' :
      selectedMethod === 'ETH' ? paymentDetails?.ethAmount || '' :
      paymentDetails?.usdtAmount || ''
    );

    const formatTime = (time: TimeRemaining) => {
      return `${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
    };

    const getCryptoAmount = () => {
      if (!paymentDetails) return '0';
      switch (selectedMethod) {
        case 'BTC':
          return paymentDetails.btcAmount;
        case 'ETH':
          return paymentDetails.ethAmount;
        case 'USDT':
          return paymentDetails.usdtAmount;
        default:
          return '0';
      }
    };

    if (paymentStatus === 'expired') {
      return (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Order Expired</h3>
            <p className="text-gray-500">This order has expired</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800">Already sent funds?</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Don't worry, funds are not lost. Contact us on support from your dashboard.
            </p>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            View details
          </button>
        </div>
      );
    }

    if (showPaymentPrompt) {
      return (
        <div className="space-y-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">Have you made the payment?</h3>
          <div className="space-y-3">
            <button
              onClick={() => handlePaymentPromptResponse(true)}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Yes, I've made the payment
            </button>
            <button
              onClick={() => handlePaymentPromptResponse(false)}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              No, continue waiting
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-gray-900">Payment</h3>
          <div className="text-sm text-gray-500">Time remaining {formatTime(timeRemaining)}</div>
          <div>
            <div className="text-sm text-gray-600">Send this amount</div>
            <div className="text-2xl font-bold mt-1">
              {getCryptoAmount()} {selectedMethod}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              (≈ ${paymentDetails?.amount} USD)
            </div>
            <div className="text-sm text-gray-500">
              {selectedMethod === 'BTC' ? '(Bitcoin Network)' :
               selectedMethod === 'ETH' ? '(Mainnet - ERC-20)' :
               '(ERC-20)'}
            </div>
          </div>
        </div>

        <div className="flex justify-center py-2">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <QRCodeSVG
              value={paymentDetails?.address || ''}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To this {selectedMethod} address
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={paymentDetails?.address}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(paymentDetails?.address || '')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title={copied ? "Copied!" : "Copy to clipboard"}
            >
              {renderIcon('copy')}
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <a
            href={walletUri}
            target=""
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            {renderIcon('wallet')}
            <span className="mx-2">Open in Wallet</span>
            <FontAwesomeIcon 
              icon={faArrowUpRightFromSquare} 
              className="h-4 w-4"
            />
          </a>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-sm">
          <p>{getPaymentWarning(selectedMethod!)}</p>
        </div>

        <div className="text-xs text-gray-500 text-center">
          order id: {paymentDetails?.orderId}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'amount':
        return renderAmountStep();
      case 'method':
        return renderMethodStep();
      case 'payment':
        return renderPaymentStep();
    }
  };

  useEffect(() => {
    if (!appData?.user) {
      onClose();
    }
  }, [appData?.user, onClose]);

  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {currentStep === 'payment' ? (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              {renderIcon('times')}
            </button>
          ) : null}
          {isLoading ? (
            <LoadingSpinner 
              size="default"
              text={currentStep === 'amount' ? 'Getting exchange rates...' : 'Initializing payment...'}
            />
          ) : (
            renderStep()
          )}
        </div>
      </div>
    </div>
  );
}