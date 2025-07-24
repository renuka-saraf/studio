
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
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  monthlyLimit: number | null;
  setMonthlyLimit: (limit: number | null) => void;
  totalExpenses: number;
  dashboardAnalysis: AnalyzeExpensesOutput | null;
  setDashboardAnalysis: Dispatch<SetStateAction<AnalyzeExpensesOutput | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pin: string) => boolean;
  logout: () => void;
  sendPin: (email: string) => Promise<boolean>;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(1000);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<AnalyzeExpensesOutput | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const addReceipt = (receiptData: Omit<Receipt, 'id'>) => {
    const newReceipt = { ...receiptData, id: Date.now().toString() };
    setReceipts((prev) => [...prev, newReceipt]);
  };
  
  const sendPin = async (email: string) => {
    // In a real app, you'd call an AI flow or backend service to send a PIN.
    // For this prototype, we'll just log it and move to the PIN entry step.
    console.log(`Simulating sending PIN to ${email}. In a real app, an email would be sent.`);
    setUserEmail(email);
    return true;
  };

  const login = (email: string, pin: string) => {
    // In a real app, you would verify the PIN against a backend service.
    // For this prototype, we'll accept any PIN for the given email.
    if (userEmail === email && pin.length > 0) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  
  const logout = () => {
      setIsAuthenticated(false);
      setUserEmail(null);
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
    isAuthenticated,
    login,
    logout,
    sendPin,
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
