"use client";

import { ExpenseDashboard } from '@/components/scanalyze/expense-dashboard';
import { ExpenseTracker } from '@/components/scanalyze/expense-tracker';
import { ProtectedRoute } from '@/components/layout/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            AI-powered insights into your spending.
          </p>
        </div>

        <ExpenseTracker />
        
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-lg font-medium font-headline">
              Spending Analysis
            </span>
          </div>
        </div>
        
        <ExpenseDashboard />
      </div>
    </ProtectedRoute>
  );
}