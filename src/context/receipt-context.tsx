
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

interface ReceiptContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  monthlyLimit: number | null;
  setMonthlyLimit: (limit: number | null) => void;
  totalExpenses: number;
  dashboardAnalysis: AnalyzeExpensesOutput | null;
  setDashboardAnalysis: Dispatch<SetStateAction<AnalyzeExpensesOutput | null>>;
  isLoading: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(1000);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<AnalyzeExpensesOutput | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const addReceipt = (receiptData: Omit<Receipt, 'id'>) => {
    const newReceipt = { ...receiptData, id: Date.now().toString() };
    setReceipts((prev) => [...prev, newReceipt]);
  };
  
  const login = (email: string) => {
    setUserEmail(email);
  }
  
  const logout = () => {
      setUserEmail(null);
      setReceipts([]);
      setDashboardAnalysis(null);
  }

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
    isLoading: false,
    userEmail,
    login,
    logout,
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
