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

  const rawInput = NEXT_PUBLIC_CDP_API_KEY?.trim() ?? '';

  // Автоматически определяем, что ввел Оператор: полную ссылку или чистый ключ
  const isUrl = rawInput.startsWith('http://') || rawInput.startsWith('https://');

  // Вытаскиваем чистый ключ (хвост ссылки) если ввели URL, иначе оставляем как есть
  const cleanApiKey = isUrl 
    ? rawInput.split('/').pop() ?? ''
    : rawInput;

  // Собираем валидный эндпоинт паймастера
  const paymasterUrl = isUrl 
    ? rawInput 
    : cleanApiKey ? `https://api.developer.coinbase.com/rpc/v1/base/${cleanApiKey}` : undefined;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider 
          apiKey={cleanApiKey || undefined} 
          chain={base}
          config={{
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
