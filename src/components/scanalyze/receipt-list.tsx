
"use client";

import { useReceipts } from '@/context/receipt-context';
import { ReceiptCard } from './receipt-card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileQuestion } from 'lucide-react';

interface ReceiptListProps {
  isProcessing: boolean;
}

export function ReceiptList({ isProcessing }: ReceiptListProps) {
  const { receipts, isLoading } = useReceipts();

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div className="flex flex-col space-y-3" key={i}>
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            ))}
        </div>
    )
  }

  if (receipts.length === 0 && !isProcessing) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg mt-8">
        <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No receipts yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload a receipt to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {receipts.slice().reverse().map((receipt) => (
        <ReceiptCard key={receipt.id} receipt={receipt} />
      ))}
      {isProcessing && (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      )}
    </div>
  );
}
