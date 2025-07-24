"use client";

import { useState, useEffect, useTransition } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { trackExpenses } from '@/ai/flows/monthly-expense-tracking';
import { Info, Loader2, PartyPopper, TrendingDown, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExpenseTracker() {
  const { totalExpenses, monthlyLimit, setMonthlyLimit } = useReceipts();
  const [localLimit, setLocalLimit] = useState(monthlyLimit ? String(monthlyLimit) : '');
  const [reminder, setReminder] = useState<{ message: string; type: 'info' | 'warning' | 'success' } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSetLimit = () => {
    const newLimit = parseFloat(localLimit);
    if (!isNaN(newLimit) && newLimit > 0) {
      setMonthlyLimit(newLimit);
      toast({ title: 'Success', description: `Monthly limit updated to $${newLimit.toFixed(2)}.`});
    } else {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a valid number for the limit.'});
    }
  };

  useEffect(() => {
    if (monthlyLimit && totalExpenses > 0) {
        startTransition(async () => {
            try {
                const result = await trackExpenses({
                    monthlyLimit,
                    totalExpenses,
                    userId: 'user-123',
                });

                let type: 'info' | 'warning' | 'success' = 'info';
                const msg = result.reminderMessage.toLowerCase();
                if (msg.includes('exceeding') || msg.includes('approaching')) {
                    type = 'warning';
                } else if (msg.includes('congratulate') || msg.includes('well')) {
                    type = 'success';
                }
                
                setReminder({ message: result.reminderMessage, type });
            } catch (error) {
                console.error('Failed to get expense reminder:', error);
            }
        });
    }
  }, [totalExpenses, monthlyLimit]);

  const progress = monthlyLimit ? Math.min((totalExpenses / monthlyLimit) * 100, 100) : 0;
  
  const getReminderIcon = () => {
    if (isPending) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!reminder) return <Info className="h-4 w-4" />;
    switch (reminder.type) {
      case 'success': return <PartyPopper className="h-4 w-4" />;
      case 'warning': return <TrendingDown className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expense Tracker</CardTitle>
        <CardDescription>Set a budget and track your spending throughout the month.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label htmlFor="limit" className="text-sm font-medium">Monthly Limit ($)</label>
            <Input
              id="limit"
              type="number"
              placeholder="e.g., 1000"
              value={localLimit}
              onChange={(e) => setLocalLimit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetLimit()}
            />
          </div>
          <Button onClick={handleSetLimit}>Set Limit</Button>
        </div>
        
        {monthlyLimit !== null && (
          <div className="space-y-2">
            <div className="flex justify-between font-medium">
              <span>Spent</span>
              <span>
                ${totalExpenses.toFixed(2)} / ${monthlyLimit.toFixed(2)}
              </span>
            </div>
            <Progress value={progress} />
            {(reminder || isPending) && (
               <Alert className={
                reminder?.type === 'success' ? 'border-green-500 text-green-700 [&>svg]:text-green-700' :
                reminder?.type === 'warning' ? 'border-yellow-500 text-yellow-700 [&>svg]:text-yellow-700' : ''
               }>
                {getReminderIcon()}
                <AlertTitle>AI Tip</AlertTitle>
                <AlertDescription>
                  {isPending && !reminder ? "Analyzing your progress..." : reminder?.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
