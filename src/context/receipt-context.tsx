"use client";

import { createContext, useContext, useState, useMemo, ReactNode, Dispatch, SetStateAction } from 'react';
import { type AnalyzeExpensesOutput } from '@/ai/flows/expense-analysis-dashboard';

export interface Receipt {
  id: string;
  imageDataUri: string;
  text: string;
  category: 'food' | 'fashion' | 'travel' | 'other';
  amount: number;
  currency: string;
}

interface ReceiptContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Receipt) => void;
  monthlyLimit: number | null;
  setMonthlyLimit: (limit: number | null) => void;
  totalExpenses: number;
  dashboardAnalysis: AnalyzeExpensesOutput | null;
  setDashboardAnalysis: Dispatch<SetStateAction<AnalyzeExpensesOutput | null>>;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(1000);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<AnalyzeExpensesOutput | null>(null);

  const addReceipt = (receipt: Receipt) => {
    setReceipts((prev) => [...prev, receipt]);
  };

  const totalExpenses = useMemo(() => {
    return receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  }, [receipts]);

  const value = {
    receipts,
    addReceipt,
    monthlyLimit,
    setMonthlyLimit,
    totalExpenses,
    dashboardAnalysis,
    setDashboardAnalysis,
  };

  return (
    <ReceiptContext.Provider value={value}>
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipts() {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
}
