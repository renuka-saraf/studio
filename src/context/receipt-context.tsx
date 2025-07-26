
"use client";

import { createContext, useContext, useState, useMemo, ReactNode, Dispatch, SetStateAction } from 'react';
import { type AnalyzeExpensesOutput } from '@/ai/flows/expense-analysis-dashboard';
import { Timestamp } from 'firebase/firestore';

export interface ExpenseItem {
  item: string;
  price: number;
  quantity: number;
  // timestamp= Timestamp;

}

export interface Receipt {
  id: string;
  imageDataUri: string;
  text: string;
  category: 'grocery' | 'dining' | 'fashion' | 'travel' | 'other';
  amount: number;
  currency: string;
  items: ExpenseItem[];
}

type UsageMode = 'personal' | 'business' | null;

interface ReceiptContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  monthlyLimit: number | null;
  setMonthlyLimit: (limit: number | null) => void;
  totalExpenses: number;
  dashboardAnalysis: AnalyzeExpensesOutput | null;
  setDashboardAnalysis: Dispatch<SetStateAction<AnalyzeExpensesOutput | null>>;
  isLoading: boolean;
  usageMode: UsageMode;
  setUsageMode: (mode: UsageMode) => void;
  logout: () => void;
  userEmail: string | null;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(1000);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<AnalyzeExpensesOutput | null>(null);
  const [usageMode, setUsageModeState] = useState<UsageMode>(null);

  const addReceipt = (receiptData: Omit<Receipt, 'id'>) => {
    const newReceipt = { ...receiptData, id: Date.now().toString() };
    setReceipts((prev) => [...prev, newReceipt]);
  };
  
  const setUsageMode = (mode: UsageMode) => {
    setUsageModeState(mode);
  }
  
  const logout = () => {
      setUsageModeState(null);
      // Optionally clear other state on logout
      setReceipts([]);
      setDashboardAnalysis(null);
  }

  const totalExpenses = useMemo(() => {
    return receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  }, [receipts]);
  
  // The userEmail can be derived from the usage mode for simplified identification
  const userEmail = usageMode ? `${usageMode}-user@example.com` : null;

  const value = {
    receipts,
    addReceipt,
    monthlyLimit,
    setMonthlyLimit,
    totalExpenses,
    dashboardAnalysis,
    setDashboardAnalysis,
    isLoading: false,
    usageMode,
    setUsageMode,
    logout,
    userEmail,
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
