
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { generateTaxReport, TaxReportInput } from '@/ai/flows/tax-calculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Loader2, RefreshCw, LandPlot } from 'lucide-react';

export default function TaxReportPage() {
  const { receipts } = useReceipts();
  const [report, setReport] = useState<{ summary: string; totalGstPaid: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const gstReceipts = receipts.filter(r => r.gstInfo && r.gstInfo.gstAmount);

  const fetchReport = () => {
    if (gstReceipts.length > 0) {
      startTransition(async () => {
        const reportInput: TaxReportInput = {
          receipts: gstReceipts.map(r => ({
            totalAmount: r.amount,
            gstInfo: {
              gstNumber: r.gstInfo?.gstNumber || 'N/A',
              gstAmount: r.gstInfo?.gstAmount || 0,
            },
            date: new Date(parseInt(r.id)).toISOString(),
          }))
        };
        try {
          const result = await generateTaxReport(reportInput);
          setReport(result);
        } catch (error) {
          console.error("Failed to generate tax report:", error);
          // Handle error
        }
      });
    }
  };

  useEffect(() => {
    fetchReport();
  }, [receipts]);
  
  const getFormattedAmount = (amount: number) => {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: receipts.find(r => r.currency)?.currency || "USD",
        }).format(amount);
      } catch (e) {
        return `$${amount.toFixed(2)}`;
      }
  };


  if (gstReceipts.length === 0 && !isPending) {
    return (
       <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <LandPlot className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold">No GST Data Found</h3>
        <p className="mt-1 text-sm text-gray-500">Scan receipts with GST information to generate a tax report.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <FileText /> Tax Calculator
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            AI-generated summary of your GST payments for tax filing.
          </p>
        </div>
        <Button onClick={fetchReport} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Generate Report
        </Button>
      </div>

      {isPending || !report ? (
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Year-to-Date GST Summary</CardTitle>
            <CardDescription>
              Total GST Paid: <span className="font-bold text-primary">{getFormattedAmount(report.totalGstPaid)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p>{report.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
