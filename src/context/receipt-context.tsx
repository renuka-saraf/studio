
"use client";

import { createContext, useContext, useState, useMemo, ReactNode, Dispatch, SetStateAction } from 'react';
import { type AnalyzeExpensesOutput } from '@/ai/flows/expense-analysis-dashboard';

export interface GstBreakdownItem {
  taxType: string;
  amount: number;
}

export interface GstInfo {
    gstNumber?: string;
    gstBreakdown?: GstBreakdownItem[];
}

export interface ExpenseItem {
  item: string;
  price: number;
  quantity: number;
  expiryDate?: string;
}

export interface Receipt {
  id: string;
  imageDataUri: string;
  text: string;
  category: 'grocery' | 'dining' | 'fashion' | 'travel' | 'utilities' | 'inventory purchasing' | 'stationery' | 'maintenance' | 'other';
  amount: number;
  currency: string;
  items: ExpenseItem[];
  gstInfo?: GstInfo;
}

type UsageType = 'personal' | 'business';

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
  usageType: UsageType | null;
  setUsageType: (type: UsageType) => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(1000);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<AnalyzeExpensesOutput | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [usageType, setUsageTypeState] = useState<UsageType | null>(null);

  const addReceipt = (receiptData: Omit<Receipt, 'id'>) => {
    const newReceipt = { ...receiptData, id: Date.now().toString() };
    setReceipts((prev) => [...prev, newReceipt]);
  };
  
  const login = (email: string) => {
    setUserEmail(email);
  }

  const setUsageType = (type: UsageType) => {
    setUsageTypeState(type);
  }
  
  const logout = () => {
    // This function now performs a full reset of the app state.
    setUserEmail(null);
    setUsageTypeState(null);
    setReceipts([]);
    setDashboardAnalysis(null);
    setMonthlyLimit(1000);
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
    usageType,
    setUsageType,
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
