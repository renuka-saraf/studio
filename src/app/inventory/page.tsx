"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getInventoryRecommendations } from '@/ai/flows/inventory-stock-recommendations';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetRecommendations = async () => {
    if (!inventoryData.trim()) {
      setError('Please paste your inventory data first.');
      return;
    }
    setError('');
    setIsLoading(true);
    setRecommendations('');
    try {
      const result = await getInventoryRecommendations({ receiptData: inventoryData });
      setRecommendations(result.recommendations);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Inventory Stock Recommendations</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          For business users: Paste your monthly inventory data to get AI-powered stock alerts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Inventory</CardTitle>
          <CardDescription>
            Paste your inventory data below. The data should be a list of products, their quantities, and purchase dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Milk, 50 units, 2023-10-01\nBread, 100 units, 2023-10-02\nMilk, 45 units, 2023-10-15"
            className="min-h-[200px] font-mono"
            value={inventoryData}
            onChange={(e) => setInventoryData(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleGetRecommendations} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Get Recommendations
          </Button>
        </CardContent>
      </Card>
      
      {recommendations && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>AI Recommendations</AlertTitle>
          <AlertDescription className="prose dark:prose-invert max-w-none">
            {recommendations}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
