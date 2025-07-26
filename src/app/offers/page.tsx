
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { generateLoyaltyOffers } from '@/ai/flows/loyalty-offers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Percent, Loader2, RefreshCw, Gift } from 'lucide-react';

interface Offer {
  storeName: string;
  offerDetails: string;
  reason: string;
}

export default function OffersPage() {
  const { receipts } = useReceipts();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchOffers = () => {
    if (receipts.length > 0) {
      startTransition(async () => {
        const purchaseHistory = receipts.map(r => ({
          storeName: r.text.split('\n')[0] || 'Unknown Store', // Simple logic to get store name
          items: r.items.map(i => i.item),
          totalAmount: r.amount,
        }));
        try {
          const result = await generateLoyaltyOffers({ purchaseHistory });
          setOffers(result.offers);
        } catch (error) {
          console.error("Failed to fetch loyalty offers:", error);
          // Handle error
        }
      });
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [receipts]);

  if (receipts.length === 0 && !isPending) {
    return (
       <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <Gift className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold">No Offers Available</h3>
        <p className="mt-1 text-sm text-gray-500">Scan some receipts to unlock personalized loyalty offers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Percent /> Loyalty Offers
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Personalized discounts and deals based on your purchase history.
          </p>
        </div>
        <Button onClick={fetchOffers} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Get New Offers
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isPending ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : (
          offers.map((offer, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle>{offer.storeName}</CardTitle>
                <CardDescription>{offer.reason}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="font-semibold text-accent text-lg">{offer.offerDetails}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
