'use client';

import { useState } from 'react';
import { 
  Transaction, 
  TransactionButton, 
  TransactionSponsor, 
  TransactionStatus, 
  TransactionStatusAction, 
  TransactionStatusLabel 
} from '@coinbase/onchainkit/transaction';
import { checkInContractAddress, checkInABI } from '../constants';
import { base } from 'wagmi/chains';

interface TransactionWrapperProps {
  address: `0x${string}`;
  category?: string;
  stageId?: number;
}

export default function TransactionWrapper({ address, category, stageId }: TransactionWrapperProps) {
  const [debugError, setDebugError] = useState<string | null>(null);

  if (!category || typeof stageId !== 'number') return null;

  const contracts = [
    {
      address: checkInContractAddress,
      abi: checkInABI,
      functionName: 'checkIn',
      args: [category, BigInt(stageId)],
    }
  ] as any;

  return (
    <div className="flex flex-col w-[450px] max-w-full items-center gap-2">
      <Transaction 
        contracts={contracts}
        chainId={base.id}
        className="w-full"
        onError={(err) => {
          console.error('OnchainKit Error:', err);
          setDebugError(JSON.stringify(err, null, 2) || err.message || 'Unknown OnchainKit Error');
        }}
      >
        <TransactionButton 
          className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl transition-all transform active:scale-98 uppercase tracking-wider text-sm"
          text={`Записати: ${category} (Stage ${stageId})`}
        />
        <TransactionSponsor />
        <TransactionStatus>
          <TransactionStatusLabel className="text-xs text-green-400 font-mono" />
          <TransactionStatusAction className="text-xs text-indigo-400" />
        </TransactionStatus>
      </Transaction>

      {/* Вывод отладочного лога прямо на экран iPad в случае сбоя */}
      {debugError && (
        <div className="w-full mt-2 p-3 bg-red-950/80 border border-red-500/30 rounded-xl text-[10px] text-red-400 font-mono text-left whitespace-pre-wrap max-h-[150px] overflow-y-auto">
          <strong className="text-red-300 block mb-1">CDP/Paymaster Debug Log:</strong>
          {debugError}
        </div>
      )}
    </div>
  );
}
