'use client';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useMemo } from 'react';
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors'; // Импортируем нативный коннектор из Wagmi
import { NEXT_PUBLIC_WC_PROJECT_ID } from './config';

export function useWagmiConfig() {
  const projectId = NEXT_PUBLIC_WC_PROJECT_ID ?? '';
  if (!projectId) {
    throw new Error('To connect to all Wallets you need to provide a NEXT_PUBLIC_WC_PROJECT_ID env variable');
  }

  return useMemo(() => {
    // 1. Создаем нативный инстанс Coinbase Wallet SDK с флагами твоего Mini App
    const nativeCoinbaseConnector = coinbaseWallet({
      appName: 'Nano English - Tan-Tan',
      preference: 'smartWalletOnly', // Заставляем кошелек открываться в режиме Smart Wallet
    });

    // 2. Интегрируем его в массив RainbowKit как кастомный коннектор
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [
            () => ({
              id: 'coinbase',
              name: 'Coinbase Wallet',
              iconUrl: 'https://images.ctfassets.net/q5ulk4w65864/4mG2vO7ElY0mI0MS6q3l7S/376246e6a6a6839bc4f30cd418e38d74/coinbase-wallet-logo.png',
              iconBackground: '#fff',
              downloadUrls: { ios: 'https://apps.apple.com/app/coinbase-wallet/id1278383455' },
              createConnector: (walletDetails) => nativeCoinbaseConnector, // Подменяем нативный коннектор
            })
          ],
        },
        {
          groupName: 'Other Wallets',
          wallets: [rainbowWallet, metaMaskWallet],
        },
      ],
      {
        appName: 'Nano English - Tan-Tan',
        projectId,
      },
    );

    const wagmiConfig = createConfig({
      chains: [base],
      multiInjectedProviderDiscovery: false,
      connectors,
      ssr: true,
      transports: {
        [base.id]: http(),
      },
    });

    return wagmiConfig;
  }, [projectId]);
}
