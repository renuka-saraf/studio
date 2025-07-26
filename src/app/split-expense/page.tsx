
"use client";

import { useState } from 'react';
import { useReceipts, Receipt } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SplitExpenseDialog } from '@/components/scanalyze/split-expense-dialog';
import { Button } from '@/components/ui/button';
import { FileText, Users } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout/protected-route';

function SplitExpensePageContent() {
  const { receipts, isLoading } = useReceipts();
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedReceipt = receipts.find(r => r.id === selectedReceiptId);

  const handleOpenDialog = () => {
    if (selectedReceipt) {
      setIsDialogOpen(true);
    }
  };

  const getFormattedAmount = (receipt: Receipt) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: receipt.currency || "USD",
      }).format(receipt.amount);
    } catch (e) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "code"
      }).format(receipt.amount).replace("USD", receipt.currency || "");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Split an Expense</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Select a receipt to split the bill with others.
        </p>
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Select a Receipt</CardTitle>
          <CardDescription>Choose one of your scanned receipts from the list below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedReceiptId} disabled={isLoading || receipts.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={receipts.length > 0 ? "Select a receipt..." : "No receipts available"} />
            </SelectTrigger>
            <SelectContent>
              {receipts.map(receipt => (
                <SelectItem key={receipt.id} value={receipt.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{receipt.category} - {new Date(parseInt(receipt.id)).toLocaleDateString()}</span>
                    <span className="font-semibold">{getFormattedAmount(receipt)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleOpenDialog} disabled={!selectedReceipt} className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Split Selected Receipt
          </Button>
        </CardContent>
      </Card>

      {receipts.length === 0 && !isLoading && (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold">No Receipts to Split</h3>
          <p className="mt-1 text-sm text-gray-500">Scan a receipt on the main page to get started.</p>
        </div>
      )}

      {selectedReceipt && (
        <SplitExpenseDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          receipt={selectedReceipt}
        />
      )}
    </div>
  );
}


export default function SplitExpensePage() {
  return (
    <ProtectedRoute>
      <SplitExpensePageContent />
    </ProtectedRoute>
  )
}