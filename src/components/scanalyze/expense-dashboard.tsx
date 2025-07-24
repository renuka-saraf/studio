"use client";

import { useEffect, useState, useTransition } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { analyzeExpenses } from '@/ai/flows/expense-analysis-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lightbulb, BarChart, FileQuestion, Loader2, Sparkles } from 'lucide-react';

export function ExpenseDashboard() {
  const { receipts, monthlyLimit, dashboardAnalysis, setDashboardAnalysis } = useReceipts();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (receipts.length > 0) {
      startTransition(async () => {
        try {
          const receiptsData = receipts.map(r => ({
            photoDataUri: r.imageDataUri,
            extractedText: r.text,
            category: r.category,
          }));
          
          const result = await analyzeExpenses({ receiptsData, monthlyExpenseLimit: monthlyLimit ?? undefined });
          setDashboardAnalysis(result);
        } catch (error) {
          console.error('Failed to analyze expenses:', error);
          setDashboardAnalysis({
              summary: "Error analyzing expenses.",
              insights: ["Could not connect to the analysis service."],
              recommendations: ["Please try again later."],
          });
        }
      });
    }
  }, [receipts, monthlyLimit]);

  if (receipts.length === 0) {
    return (
       <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold">No Data for Analysis</h3>
        <p className="mt-1 text-sm text-gray-500">Upload some receipts to see your dashboard.</p>
      </div>
    );
  }

  if (isPending || !dashboardAnalysis) {
    return (
      <div className="space-y-6">
        <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {dashboardAnalysis.limitExceeded && (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                    <CardTitle className="text-destructive">Spending Limit Exceeded</CardTitle>
                    <CardDescription className="text-destructive/80">
                        You've gone over your monthly budget by ${dashboardAnalysis.amountExceededBy?.toFixed(2)}.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart className="text-primary"/> Spending Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="prose dark:prose-invert max-w-none">{dashboardAnalysis.summary}</p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent" /> Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 prose dark:prose-invert max-w-none">
              {dashboardAnalysis.insights.map((insight, i) => <li key={i}>{insight}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 prose dark:prose-invert max-w-none">
              {dashboardAnalysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
