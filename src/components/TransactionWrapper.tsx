'use client';

import { useSendCalls } from 'wagmi/experimental';
import { encodeFunctionData } from 'viem';
import { checkInContractAddress, checkInABI } from '../constants';

interface TransactionWrapperProps {
  address: `0x${string}`;
  category?: string;
  stageId?: number;
}

export default function TransactionWrapper({ address, category, stageId }: TransactionWrapperProps) {
  // Используем хук для отправки вызовов смарт-аккаунта (ERC-5792)
  const { sendCalls, isPending, isSuccess, error } = useSendCalls();

  const handleCheckIn = () => {
    if (!category || typeof stageId !== 'number') return;

    // Кодируем параметры функции для отправки внутри пакета call
    const callData = encodeFunctionData({
      abi: checkInABI,
      functionName: 'checkIn',
      args: [category, BigInt(stageId)],
    });

    // Отправляем вызов через wallet_sendCalls, который нативно поддерживает спонсорство газа через RPC транспорта
    sendCalls({
      calls: [
        {
          to: checkInContractAddress,
          data: callData,
          value: BigInt(0),
        },
      ],
    });
  };

  return (
    <div className="flex flex-col w-[450px] max-w-full items-center gap-2">
      <button
        onClick={handleCheckIn}
        disabled={isPending || !category}
        className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold rounded-2xl shadow-xl transition-all transform active:scale-98 uppercase tracking-wider text-sm"
      >
        {isPending ? 'Обробка смарт-виклику...' : category ? `Записати: ${category} (Stage ${stageId})` : 'Чек-ін'}
      </button>

      {isSuccess && (
        <span className="text-xs text-green-400 font-mono animate-fadeIn mt-1">
          Смарт-транзакція успішно виконана! ✅
        </span>
      )}

      {error && (
        <div className="text-[10px] text-red-400 font-mono text-center max-w-full bg-red-500/10 p-2 rounded-xl border border-red-500/20 mt-1">
          Помилка: {error.message.slice(0, 85)}...
        </div>
      )}
    </div>
  );
}
