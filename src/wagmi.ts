'use client';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useMemo } from 'react';
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { NEXT_PUBLIC_WC_PROJECT_ID, NEXT_PUBLIC_PIMLICO_RPC_URL } from './config';

export function useWagmiConfig() {
  const projectId = NEXT_PUBLIC_WC_PROJECT_ID ?? '';
  if (!projectId) {
    throw new Error('To connect to all Wallets you need to provide a NEXT_PUBLIC_WC_PROJECT_ID env variable');
  }

  return useMemo(() => {
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [coinbaseWallet], // Вернули чистый, стабильный вызов
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

    // Принудительно направляем трафик через Pimlico, если ключ на месте
    const rpcUrl = NEXT_PUBLIC_PIMLICO_RPC_URL ?? 'https://mainnet.base.org';

    const wagmiConfig = createConfig({
      chains: [base],
      multiInjectedProviderDiscovery: false,
      connectors,
      ssr: true,
      transports: {
        [base.id]: http(rpcUrl),
      },
    });

    return wagmiConfig;
  }, [projectId]);
}
