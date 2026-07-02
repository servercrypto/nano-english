'use client';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import type {
  TransactionError,
  TransactionResponse,
} from '@coinbase/onchainkit/transaction';
import type { Address, ContractFunctionParameters } from 'viem';
import {
  BASE_SEPOLIA_CHAIN_ID,
  mintABI,
  mintContractAddress,
  checkInContractAddress,
  checkInABI,
} from '../constants';

interface TransactionWrapperProps {
  address: Address;
  category?: string;
  stageId?: number;
}

export default function TransactionWrapper({ address, category, stageId }: TransactionWrapperProps) {
  
  // Динамическая сборка полезной нагрузки (Payload) транзакции
  const contracts = (() => {
    if (category && typeof stageId === 'number') {
      // Контур нашего смарт-контракта чек-инов
      return [
        {
          address: checkInContractAddress,
          abi: checkInABI,
          functionName: 'checkIn',
          args: [category, BigInt(stageId)],
        },
      ];
    }
    
    // Дефолтный контур минта OnchainKit
    return [
      {
        address: mintContractAddress,
        abi: mintABI,
        functionName: 'mint',
        args: [address],
      },
    ];
  })() as unknown as ContractFunctionParameters[];

  const handleError = (err: TransactionError) => {
    console.error('Transaction error:', err);
  };

  const handleSuccess = (response: TransactionResponse) => {
    console.log('Transaction successful', response);
  };

  return (
    <div className="flex w-[450px]">
      <Transaction
        contracts={contracts}
        className="w-[450px]"
        chainId={BASE_SEPOLIA_CHAIN_ID}
        onError={handleError}
        onSuccess={handleSuccess}
      >
        <TransactionButton 
          text={category ? `Check-in: ${category} (Stage ${stageId})` : "Mint NFT"}
          className="mt-0 mr-auto ml-auto w-[450px] max-w-full text-[white]" 
        />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  );
}
