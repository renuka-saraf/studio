"use client";

import { useMemo } from 'react';
import { useReceipts, Receipt } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileQuestion, Utensils, Shirt, Plane, MoreHorizontal, Ticket } from 'lucide-react';
import Image from 'next/image';

const categoryConfig: { [key: string]: { icon: JSX.Element; color: string; } } = {
  food: { icon: <Utensils className="h-6 w-6" />, color: "bg-red-500/10 text-red-700 dark:text-red-400" },
  fashion: { icon: <Shirt className="h-6 w-6" />, color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  travel: { icon: <Plane className="h-6 w-6" />, color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  other: { icon: <MoreHorizontal className="h-6 w-6" />, color: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
};

function PassCard({ receipt }: { receipt: Receipt }) {
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
    const formattedAmount = getFormattedAmount();
    const config = categoryConfig[receipt.category];

    return (
        <div className={`flex items-center space-x-4 rounded-lg border p-4 transition-transform hover:shadow-lg ${config.color}`}>
            <div className="flex-shrink-0">
              <Image src={receipt.imageDataUri} alt="Receipt thumbnail" width={80} height={80} className="object-cover rounded-md aspect-square" data-ai-hint="receipt abstract" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-medium capitalize truncate">{receipt.category} Pass</p>
                    <p className="text-lg font-bold">{formattedAmount}</p>
                </div>
                <p className="text-sm truncate">
                    {new Date(receipt.id).toLocaleString()}
                </p>
            </div>
        </div>
    );
}

export default function PassesPage() {
  const { receipts } = useReceipts();

  const categorizedReceipts = useMemo(() => {
    return receipts.reduce((acc, receipt) => {
      (acc[receipt.category] = acc[receipt.category] || []).push(receipt);
      return acc;
    }, {} as { [key: string]: Receipt[] });
  }, [receipts]);

  const categories = Object.keys(categorizedReceipts);

  if (receipts.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <Ticket className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold">No Passes Available</h3>
        <p className="mt-1 text-sm text-gray-500">Scan a receipt to generate a pass.</p>
      </div>
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
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${categoryConfig[category].color}`}>
                    {categoryConfig[category].icon}
                  </div>
                  <div>
                    <CardTitle className="capitalize text-left">{category}</CardTitle>
                    <CardDescription className="text-left">
                        {categorizedReceipts[category].length} {categorizedReceipts[category].length === 1 ? 'pass' : 'passes'}
                    </CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="space-y-4">
                  {categorizedReceipts[category].slice().reverse().map((receipt) => (
                    <PassCard key={receipt.id} receipt={receipt} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </div>
  );
}
