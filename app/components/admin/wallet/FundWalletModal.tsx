import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faTimes, 
  faCopy, 
  faWallet 
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
import type { 
  PaymentMethod, 
  PaymentDetails, 
  PaymentApiResponse 
} from '../../../types/wallet';

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

export default function FundWalletModal({ onClose }: FundWalletModalProps) {
  const { appData } = useAppState();
  const [currentStep, setCurrentStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!appData?.user) {
      onClose();
    }
  }, [appData?.user, onClose]);
  
  const handleProceed = async () => {
    const user = appData?.user;
    if (!user) return;
  
    console.log("Handling proceed with current step: ", currentStep);
    
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
          return;
        }
  
        const response = convertToPaymentResponse(apiResponse);
        console.log("Converted payment response:", response);
  
        if (response.success && response.data) {
          const paymentData: PaymentDetails = {
            orderId: response.data.orderId,
            amount: response.data.amount,
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
          setCurrentStep('method');
        }
      } catch (error) {
        console.error('Failed to get exchange rates:', error);
      }
    } else if (currentStep === 'method' && selectedMethod) {
      try {
        const requestData = {
          functionName: 'initializePayment',
          amount,
          currency: selectedMethod,
          orderId: paymentDetails?.orderId,
        };
        console.log('Data sent to API (initializePayment):', requestData);
  
        const apiResponse = await securedApi.callBackendFunction(requestData);
        console.log('Payment Initialization Response:', apiResponse);
  
        if (!apiResponse || !apiResponse.data) {
          console.error('API response does not contain the expected data:', apiResponse);
          return;
        }
  
        const response = convertToPaymentResponse(apiResponse);
        console.log("Converted payment initialization response:", response);
  
        if (response.success && response.data) {
          const updatedPaymentDetails: PaymentDetails = {
            orderId: response.data.orderId,
            amount: response.data.amount,
            currency: selectedMethod,
            address: selectedMethod === 'BTC'
              ? user.btcAddress
              : selectedMethod === 'ETH'
              ? user.ethAddress
              : user.usdtAddress,
            timeRemaining: response.data.timeRemaining,
            exchangeRate: response.data.exchangeRate,
            btcAmount: response.data.btcAmount,
            ethAmount: response.data.ethAmount,
            usdtAmount: response.data.usdtAmount,
            usdAmount: amount
          };
  
          setPaymentDetails(updatedPaymentDetails);
          setCurrentStep('payment');
        }
      } catch (error) {
        console.error('Payment initialization failed:', error);
      }
    }
  };

  if (!appData?.user) {
    return null;
  }

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

    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => setCurrentStep('method')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {renderIcon('arrowLeft')}
          </button>
          <h3 className="text-xl font-bold text-gray-900 ml-2">Payment</h3>
        </div>
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-500">Time remaining {paymentDetails?.timeRemaining}</div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Send this amount</div>
            <div className="text-xl font-bold">
              {selectedMethod === 'BTC' ? paymentDetails?.btcAmount :
               selectedMethod === 'ETH' ? paymentDetails?.ethAmount :
               paymentDetails?.usdtAmount} {selectedMethod}
            </div>
            <div className="text-sm text-gray-500">
              {selectedMethod === 'BTC' ? '(Bitcoin Network)' :
               selectedMethod === 'ETH' ? '(Mainnet - ERC-20)' :
               '(ERC-20)'}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <QRCodeSVG
              value={paymentDetails?.address || ''}
              size={200}
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
            >
              {renderIcon('copy')}
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <a
            href={walletUri}
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            {renderIcon('wallet')}
            Open in Wallet
          </a>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg text-sm">
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          {renderIcon('times')}
        </button>
        {renderStep()}
      </div>
    </div>
  );
}