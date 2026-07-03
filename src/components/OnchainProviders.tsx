'use client';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { base } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { NEXT_PUBLIC_CDP_API_KEY } from '../config';
import { useWagmiConfig } from '../wagmi';

type Props = { children: ReactNode };
const queryClient = new QueryClient();

function OnchainProviders({ children }: Props) {
  const wagmiConfig = useWagmiConfig();

  // Создаем легитимный эндпоинт для нативного паймастера Coinbase на основе твоего API-ключа
  const paymasterUrl = NEXT_PUBLIC_CDP_API_KEY 
    ? `https://api.developer.coinbase.com/rpc/v1/base/${NEXT_PUBLIC_CDP_API_KEY}`
    : undefined;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider 
          apiKey={NEXT_PUBLIC_CDP_API_KEY} 
          chain={base}
          config={{
            // Передаем полную ссылку паймастера, собранную на сервере из твоего ключа
            paymaster: paymasterUrl, 
          }}
        >
          <RainbowKitProvider modalSize="compact">
            {children}
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default OnchainProviders;
