"use client";

import { useState } from 'react';
import { ReceiptUploader } from '@/components/scanalyze/receipt-uploader';
import { ReceiptList } from '@/components/scanalyze/receipt-list';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="container mx-auto p-0">
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-headline">
          Scan & Analyze
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Upload a receipt to automatically categorize and understand your spending.
        </p>
      </header>
      
      <ReceiptUploader isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
      
      <div className="my-12">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-lg font-medium text-gray-900 dark:text-gray-100 font-headline">
              Your Receipts
            </span>
          </div>
        </div>
      </div>
      
      <ReceiptList isProcessing={isProcessing} />
    </div>
  );
}
