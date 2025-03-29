import { Alchemy, Network } from 'alchemy-sdk';
import Moralis from 'moralis';

export const initializeBlockchain = async () => {
  const alchemyConfig = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: process.env.NEXT_PUBLIC_ALCHEMY_NETWORK as Network,
  };

  const alchemy = new Alchemy(alchemyConfig);

  await Moralis.start({
    apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
  });

  return {
    alchemy,
    Moralis,
  };
};

export const getWalletBalance = async (address: string) => {
  const alchemy = new Alchemy(alchemyConfig);
  const balance = await alchemy.core.getBalance(address);
  return balance.toString();
};

export const getTransactionHistory = async (address: string) => {
  const response = await Moralis.EvmApi.transaction.getWalletTransactions({
    address,
    chain: process.env.NEXT_PUBLIC_ALCHEMY_NETWORK as any,
  });

  return response.result.map(tx => ({
    id: tx.hash,
    type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
    amount: tx.value.toString(),
    address: tx.from.toLowerCase() === address.toLowerCase() ? tx.to : tx.from,
    timestamp: new Date(tx.blockTimestamp).getTime(),
    status: 'completed',
  }));
};