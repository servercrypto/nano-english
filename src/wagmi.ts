'use client';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useMemo } from 'react';
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { NEXT_PUBLIC_WC_PROJECT_ID } from './config';

export function useWagmiConfig() {
  const projectId = NEXT_PUBLIC_WC_PROJECT_ID ?? '';
  if (!projectId) {
    throw new Error('To connect to all Wallets you need to provide a NEXT_PUBLIC_WC_PROJECT_ID env variable');
  }

  return useMemo(() => {
    // Конфигурируем плагин Coinbase под стандарты Base Smart Wallet для работы Base Pay
    const configuredCoinbaseWallet = coinbaseWallet({
      appName: 'Nano English - Tan-Tan',
      preference: 'smartWalletOnly',
    });

    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [configuredCoinbaseWallet],
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
      multiInjectedProviderDiscovery: true,
      connectors,
      ssr: true,
      transports: {
        [base.id]: http(),
      },
    });

    return wagmiConfig;
  }, [projectId]);
}
