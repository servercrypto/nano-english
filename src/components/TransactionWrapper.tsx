'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { checkInContractAddress, checkInABI } from '../constants';

interface TransactionWrapperProps {
  address: `0x${string}`;
  category?: string;
  stageId?: number;
}

export default function TransactionWrapper({ address, category, stageId }: TransactionWrapperProps) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  if (!category || typeof stageId !== 'number') return null;

  const handleCheckIn = () => {
    // 1. Кодируем вызов функции checkIn в базовый байт-код
    const baseData = encodeFunctionData({
      abi: checkInABI,
      functionName: 'checkIn',
      args: [category, BigInt(stageId)],
    });

    // 2. Твой уникальный маркер верификации приложения из панели Base Builders
    const builderCodeSuffix = '62635f346561356c3072360b0080218021802180218021802180218021';

    // 3. Склеиваем байт-код вызова с твоим маркером
    const finalData = `${baseData}${builderCodeSuffix}` as `0x${string}`;

    // 4. Отправляем транзакцию в сыром режиме. Больше никакого конфликта типов.
    writeContract({
      address: checkInContractAddress,
      data: finalData,
    });
  };

  return (
    <div className="flex flex-col w-[450px] max-w-full items-center gap-2">
      <button
        onClick={handleCheckIn}
        disabled={isPending || isConfirming}
        className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold rounded-2xl shadow-xl transition-all transform active:scale-98 uppercase tracking-wider text-sm"
      >
        {isPending ? 'Підписання у гаманці...' : isConfirming ? 'Очікування блоку...' : `Записати: ${category} (Stage ${stageId})`}
      </button>

      {isSuccess && (
        <div className="text-xs text-green-400 font-mono text-center mt-1">
          Успішно записано! ✅ <br />
          <a 
            href={`https://basescan.org/tx/${hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline text-indigo-400"
          >
            Переглянути в BaseScan
          </a>
        </div>
      )}

      {error && (
        <div className="text-[10px] text-red-400 font-mono text-center max-w-full bg-red-500/10 p-2 rounded-xl border border-red-500/20 mt-1">
          Помилка: {error.message.slice(0, 85)}...
        </div>
      )}
    </div>
  );
}
