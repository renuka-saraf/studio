// src/app/passes/page.tsx
"use client";

import { useMemo, useState } from 'react';
import { useReceipts, Receipt } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Utensils, Shirt, Plane, MoreHorizontal, Ticket, Wheat } from 'lucide-react';
import { Chatbot } from '@/components/scanalyze/chatbot';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { Button } from '@/components/ui/button';
import { createWalletPass } from '@/ai/flows/create-wallet-pass'; // Import the backend flow

const categoryConfig: { [key: string]: { icon: JSX.Element; color: string; } } = {
  grocery: { icon: <Wheat className="h-6 w-6" />, color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  dining: { icon: <Utensils className="h-6 w-6" />, color: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  fashion: { icon: <Shirt className="h-6 w-6" />, color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  travel: { icon: <Plane className="h-6 w-6" />, color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  other: { icon: <MoreHorizontal className="h-6 w-6" />, color: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
};

function PassCard({ receipt }: { receipt: Receipt }) {
    const [isAddingToWallet, setIsAddingToWallet] = useState(false);
    const getFormattedAmount = () => {
        try {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: receipt.currency || "USD",
          }).format(receipt.amount);
        } catch (e) {
          console.warn(`Invalid currency code: ${receipt.currency}. Defaulting to USD display.`);
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            currencyDisplay: "code"
          }).format(receipt.amount).replace("USD", receipt.currency || "");
        }
    };

    const handleAddToWallet = async () => {
        setIsAddingToWallet(true);
        try {
            // Call the server-side flow to create the pass
            const { walletUrl } = await createWalletPass({ receipt });
            // Open the generated URL to let the user save the pass
            window.open(walletUrl, '_blank');
        } catch (error) {
            console.error('Error creating wallet pass:', error);
            // You can add user-facing error handling here, e.g., a toast notification
        } finally {
            setIsAddingToWallet(false);
        }
    };

    const formattedAmount = getFormattedAmount();
    const config = categoryConfig[receipt.category] || categoryConfig.other;
    const summary = receipt.text.split('\n').slice(0, 2).join(' / ');

    return (
        <div className={`flex items-center space-x-4 rounded-lg border p-4 transition-transform hover:shadow-lg ${config.color}`}>
            <div className={`flex-shrink-0 h-20 w-20 rounded-md flex items-center justify-center ${config.color}`}>
              <FileText className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium capitalize truncate">{receipt.category} Pass</p>
                        <p className="text-sm text-muted-foreground mt-1 truncate" title={summary}>{summary}</p>
                    </div>
                    <p className="text-lg font-bold flex-shrink-0 ml-4">{formattedAmount}</p>
                </div>
                 <div className="flex justify-between items-center mt-2">
                    <p className="text-sm">
                        {new Date(parseInt(receipt.id)).toLocaleString()}
                    </p>
                    <Button onClick={handleAddToWallet} disabled={isAddingToWallet} size="sm">
                        {isAddingToWallet ? 'Adding...' : 'Add to Google Wallet'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function PassesPageContent() {
  const { receipts, isLoading } = useReceipts();

  const categorizedData = useMemo(() => {
    const data = receipts.reduce((acc, receipt) => {
      const category = receipt.category || 'other';
      if (!acc[category]) {
        acc[category] = { receipts: [], total: 0, currency: receipt.currency };
      }
      acc[category].receipts.push(receipt);
      acc[category].total += receipt.amount;
      return acc;
    }, {} as { [key: string]: { receipts: Receipt[], total: number, currency: string } });

    return Object.entries(data)
      .sort(([, a], [, b]) => b.total - a.total)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as typeof data);
  }, [receipts]);

  const categories = Object.keys(categorizedData);
  
  const getFormattedTotal = (total: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(total);
    } catch {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", currencyDisplay: 'code' }).format(total).replace("USD", currency || "USD");
    }
  };
  
  if (isLoading) {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="mt-2 h-6 w-3/4" />
            </div>
            <div className="space-y-4">
                <Card><CardHeader><Skeleton className="h-12 w-full" /></CardHeader></Card>
                <Card><CardHeader><Skeleton className="h-12 w-full" /></CardHeader></Card>
                <Card><CardHeader><Skeleton className="h-12 w-full" /></CardHeader></Card>
            </div>
        </div>
    )
  }

  if (receipts.length === 0) {
    return (
      <>
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
          <Ticket className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold">No Passes Available</h3>
          <p className="mt-1 text-sm text-gray-500">Scan a receipt to generate a pass.</p>
        </div>
        <Chatbot />
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Your Passes</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Summarized and categorized passes from your receipts.
        </p>
      </div>

      <Accordion type="multiple" defaultValue={categories} className="w-full space-y-4">
        {categories.map((category) => (
          <Card key={category}>
            <AccordionItem value={category} className="border-b-0">
              <AccordionTrigger className="p-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${categoryConfig[category]?.color || categoryConfig['other'].color}`}>
                      {categoryConfig[category]?.icon || categoryConfig['other'].icon}
                    </div>
                    <div>
                      <CardTitle className="capitalize text-left">{category}</CardTitle>
                      <CardDescription className="text-left">
                          {categorizedData[category].receipts.length} {categorizedData[category].receipts.length === 1 ? 'pass' : 'passes'}
                      </CardDescription>
                    </div>
                  </div>
                   <div className="text-right">
                      <p className="text-xl font-bold">{getFormattedTotal(categorizedData[category].total, categorizedData[category].currency)}</p>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="space-y-4">
                  {categorizedData[category].receipts.slice().reverse().map((receipt) => (
                    <PassCard key={receipt.id} receipt={receipt} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
      <Chatbot />
    </div>
  );
}

export default function PassesPage() {
    return (
        <ProtectedRoute>
            <PassesPageContent />
        </ProtectedRoute>
    )
}