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
    // any[] гарантирует, что внутренние типы RainbowKit и Wagmi не будут конфликтовать при сборке
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [coinbaseWallet] as any[],
        },
        {
          groupName: 'Other Wallets',
          wallets: [rainbowWallet, metaMaskWallet] as any[],
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
