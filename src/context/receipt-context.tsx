
"use client";

import { createContext, useContext, useState, useMemo, ReactNode, Dispatch, SetStateAction } from 'react';
import { type AnalyzeExpensesOutput } from '@/ai/flows/expense-analysis-dashboard';
import { sendAuthPin } from '@/ai/flows/send-auth-pin';

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

// In a real app, this would be stored in a database, not in memory.
let simulatedPinStore: { [email: string]: string } = {};

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
    // This now calls our AI flow to simulate sending a PIN.
    console.log(`Requesting PIN for ${email}...`);
    try {
      const result = await sendAuthPin({ email });
      if (result.success) {
        // In a real app, the PIN would be sent via email, not returned here.
        // We store it in our simulated store for verification.
        simulatedPinStore[email] = result.pincode;
        console.log(`PIN for ${email} is ${result.pincode} (for simulation purposes).`);
        setUserEmail(email);
        return true;
      }
    } catch (error) {
        console.error("Error sending PIN:", error);
    }
    return false;
  };

  const login = (email: string, pin: string) => {
    // In a real app, you would call a backend service to verify the PIN.
    // For this prototype, we check against our simulated in-memory store.
    const expectedPin = simulatedPinStore[email];
    if (userEmail === email && expectedPin && expectedPin === pin) {
      setIsAuthenticated(true);
      delete simulatedPinStore[email]; // PIN is used, so we delete it.
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
