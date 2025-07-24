
"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Utensils, ShoppingCart, Loader2, Sparkles, Plane, Shirt, MoreHorizontal } from "lucide-react";
import type { Receipt } from "@/context/receipt-context";
import { mealPlanMaximizer } from "@/ai/flows/meal-plan-maximizer";
import { quickCommerceReorder } from "@/ai/flows/quick-commerce-reorder";
import { Textarea } from "@/components/ui/textarea";

interface ReceiptCardProps {
  receipt: Receipt;
}

const categoryIcons: { [key: string]: JSX.Element } = {
  food: <Utensils className="h-4 w-4" />,
  fashion: <Shirt className="h-4 w-4" />,
  travel: <Plane className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [isMaximizerOpen, setIsMaximizerOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [maximizerResult, setMaximizerResult] = useState("");
  const [reorderResult, setReorderResult] = useState<{ message: string; reorderLink?: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dietaryPrefs, setDietaryPrefs] = useState("");

  const handleMealPlan = async () => {
    setIsLoading(true);
    try {
      const result = await mealPlanMaximizer({
        receiptDetails: receipt.text,
        dietaryPreferences: dietaryPrefs,
      });
      setMaximizerResult(result.recommendations);
    } catch (error) {
      console.error(error);
      setMaximizerResult("Sorry, I couldn't generate recommendations right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async () => {
    setIsLoading(true);
    try {
      const result = await quickCommerceReorder({
        receiptText: receipt.text,
      });
      setReorderResult(result);
    } catch (error) {
      console.error(error);
      setReorderResult({
        message: "Sorry, I couldn't process the reorder request right now.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFormattedAmount = () => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: receipt.currency || "USD",
      }).format(receipt.amount);
    } catch (e) {
      console.warn(`Invalid currency code: ${receipt.currency}. Defaulting to USD display.`);
      // Fallback for invalid currency codes
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "code"
      }).format(receipt.amount).replace("USD", receipt.currency || "");
    }
  };

  const formattedAmount = getFormattedAmount();

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="relative w-full h-48">
            <Image
              src={receipt.imageDataUri}
              alt="Receipt"
              fill
              className="object-cover"
              data-ai-hint="receipt abstract"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <div className="flex justify-between items-start">
            <Badge variant="secondary" className="capitalize flex items-center gap-2">
              {categoryIcons[receipt.category]}
              {receipt.category}
            </Badge>
            <p className="text-xl font-bold text-primary">{formattedAmount}</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 truncate">
            {new Date(receipt.id).toLocaleString()}
          </p>
        </CardContent>
        {receipt.category === "food" && (
          <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-2">
            <Button className="w-full" variant="outline" onClick={() => setIsMaximizerOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4 text-accent" />
              Meal Plan
            </Button>
            <Button className="w-full" onClick={() => { setIsReorderOpen(true); handleReorder(); }}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Reorder
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isMaximizerOpen} onOpenChange={(open) => { setIsMaximizerOpen(open); if(!open) setMaximizerResult('')}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" /> Meal Plan Maximizer
            </DialogTitle>
            <DialogDescription>
              Get smart dietary recommendations based on your receipt. Add any dietary preferences below.
            </DialogDescription>
          </DialogHeader>
          {maximizerResult ? (
             <div className="p-4 bg-secondary rounded-md prose prose-sm max-w-none dark:prose-invert">
                <p>{maximizerResult}</p>
             </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                placeholder="e.g., vegan, gluten-free, low-carb"
                value={dietaryPrefs}
                onChange={(e) => setDietaryPrefs(e.target.value)}
              />
              <Button onClick={handleMealPlan} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Recommendations
              </Button>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReorderOpen} onOpenChange={(open) => { setIsReorderOpen(open); if(!open) setReorderResult(null)}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" /> Quick Reorder
            </DialogTitle>
            <DialogDescription>
              AI is checking for items to reorder from your receipt.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Checking availability...</p>
            </div>
          ) : reorderResult && (
            <div className="p-4 bg-secondary rounded-md space-y-4">
              <p>{reorderResult.message}</p>
              {reorderResult.reorderLink && (
                <Button asChild className="w-full">
                  <a href={reorderResult.reorderLink} target="_blank" rel="noopener noreferrer">
                    Go to Cart
                  </a>
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
