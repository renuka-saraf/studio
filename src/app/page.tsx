"use client";

import { useState } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { ReceiptUploader } from '@/components/scanalyze/receipt-uploader';
import { ReceiptList } from '@/components/scanalyze/receipt-list';
import { EmailAuth } from '@/components/scanalyze/email-auth';
import { UsageSelection } from '@/components/scanalyze/usage-selection';

export default function HomePage() {
  const { userEmail, usageType } = useReceipts();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!userEmail) {
    return <EmailAuth />;
  }

  if (!usageType) {
    return <UsageSelection />;
  }

  return (
    <div className="container mx-auto p-0">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          Scan & Analyze
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Upload a receipt to automatically categorize and understand your spending.
        </p>
      </header>
      
      <ReceiptUploader isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
      
      <div className="my-12">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-lg font-medium text-foreground font-headline">
              Your Receipts
            </span>
          </div>
        </div>
      </div>
      
      <ReceiptList isProcessing={isProcessing} />
    </div>
  );
}