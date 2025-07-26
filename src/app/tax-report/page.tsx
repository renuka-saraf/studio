
"use client";

import { useMemo } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, LandPlot } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ProtectedRoute } from '@/components/layout/protected-route';

function TaxReportPageContent() {
  const { receipts } = useReceipts();

  const gstData = useMemo(() => {
    const gstReceipts = receipts.filter(r => r.gstInfo && r.gstInfo.gstBreakdown && r.gstInfo.gstBreakdown.length > 0);
    
    let totalGstPaid = 0;
    const gstBreakdown: Record<string, number> = {};

    gstReceipts.forEach(receipt => {
      if (receipt.gstInfo && receipt.gstInfo.gstBreakdown) {
        receipt.gstInfo.gstBreakdown.forEach(item => {
          totalGstPaid += item.amount;
          gstBreakdown[item.taxType] = (gstBreakdown[item.taxType] || 0) + item.amount;
        });
      }
    });

    return {
      gstReceipts,
      totalGstPaid,
      gstBreakdown,
      hasGstData: gstReceipts.length > 0
    };
  }, [receipts]);
  
  const getFormattedAmount = (amount: number) => {
      try {
        const currency = receipts.find(r => r.currency)?.currency || "USD";
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(amount);
      } catch (e) {
        return `$${amount.toFixed(2)}`;
      }
  };

  if (!gstData.hasGstData) {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <FileText /> Tax Summary
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A summary of total GST paid based on your scanned receipts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aggregated GST Payments</CardTitle>
          <CardDescription>
            Total GST Paid: <span className="font-bold text-primary">{getFormattedAmount(gstData.totalGstPaid)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This report summarizes the Goods and Services Tax (GST) found on your receipts. This can be helpful for tracking business expenses and for reference during tax filing. Always consult a professional tax advisor for official filings.
          </p>
          
          {Object.keys(gstData.gstBreakdown).length > 0 && (
            <>
              <Separator />
              <h3 className="font-semibold text-lg">Tax Breakdown</h3>
              <div className="space-y-2 rounded-md border p-4">
                {Object.entries(gstData.gstBreakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-muted-foreground uppercase">{key}</span>
                    <span className="font-medium">{getFormattedAmount(value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}


export default function TaxReportPage() {
    return (
        <ProtectedRoute>
            <TaxReportPageContent />
        </ProtectedRoute>
    )
}