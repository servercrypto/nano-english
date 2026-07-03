'use client';

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
    </div>
  );
}
