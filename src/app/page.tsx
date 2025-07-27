"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReceipts } from '@/context/receipt-context';
import { ReceiptUploader } from '@/components/scanalyze/receipt-uploader';
import { EmailAuth } from '@/components/scanalyze/email-auth';
import { UsageSelection } from '@/components/scanalyze/usage-selection';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react';

export default function HomePage() {
  const { userEmail, usageType, receipts } = useReceipts();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

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
          Upload a receipt to automatically categorize and store it as a digital pass.
        </p>
      </header>
      
      <ReceiptUploader isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
      
      {receipts.length > 0 && (
         <div className="mt-12 text-center">
            <Button size="lg" onClick={() => router.push('/passes')}>
                <Ticket className="mr-2 h-5 w-5" />
                View Your Passes ({receipts.length})
            </Button>
        </div>
      )}
    </div>
  );
}
