"use client";

import { useEffect, useState, useTransition } from 'react';
import { useReceipts, Receipt } from '@/context/receipt-context';
import { getInventoryStockRecommendations } from '@/ai/flows/inventory-stock-recommendations';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, FileQuestion, Lightbulb, Loader2, RefreshCw, ShoppingCart } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout/protected-route';

interface Recommendation {
  item: string;
  reason: string;
  suggestion: string;
}

function InventoryPageContent() {
  const { receipts } = useReceipts();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isPending, startTransition] = useTransition();

  const inventoryReceipts = receipts.filter(r => r.category === 'inventory purchasing');

  const fetchRecommendations = () => {
    if (inventoryReceipts.length > 0) {
      startTransition(async () => {
        const receiptHistory = inventoryReceipts.map(r => ({
          date: new Date(parseInt(r.id)).toISOString(),
          items: r.items,
        }));
        try {
          const result = await getInventoryStockRecommendations({ receiptHistory });
          setRecommendations(result.recommendations);
        } catch (error) {
          console.error("Failed to fetch inventory recommendations:", error);
          // Handle error state in UI
        }
      });
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipts]);

  if (inventoryReceipts.length === 0 && !isPending) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg border-border">
        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold">No Inventory Data</h3>
        <p className="mt-1 text-sm text-muted-foreground">Scan 'inventory purchasing' receipts to get recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Briefcase /> Inventory
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            AI-powered restocking and trend analysis.
          </p>
        </div>
        <Button onClick={fetchRecommendations} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <Alert key={index} className="border-accent">
                <Lightbulb className="h-4 w-4 text-accent" />
                <AlertTitle className="font-bold">{rec.item}</AlertTitle>
                <AlertDescription>
                  <p>{rec.reason}</p>
                  <p className="font-semibold mt-1">{rec.suggestion}</p>
                </AlertDescription>
              </Alert>
            ))
          ) : (
             <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg border-border">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No Recommendations</h3>
                <p className="mt-1 text-sm text-muted-foreground">The AI is analyzing your data. Check back soon.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <InventoryPageContent />
    </ProtectedRoute>
  )
}