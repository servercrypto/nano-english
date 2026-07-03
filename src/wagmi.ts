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
    // Настраиваем коннектор Coinbase с явной поддержкой Smart Wallet сессий
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [
            coinbaseWallet.preference({
              options: {
                smartWalletOnly: false,
              }
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

    // Берем твою ссылку Pimlico. Если она пустая — откатываемся на стандартный публичный RPC Base
    const rpcUrl = NEXT_PUBLIC_PIMLICO_RPC_URL ?? 'https://mainnet.base.org';

    const wagmiConfig = createConfig({
      chains: [base],
      multiInjectedProviderDiscovery: false,
      connectors,
      ssr: true,
      transports: {
        // Заставляем Wagmi гнать все транзакции через Pimlico
        [base.id]: http(rpcUrl),
      },
    });

    return wagmiConfig;
  }, [projectId]);
}
