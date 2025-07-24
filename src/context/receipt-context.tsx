
"use client";

import { createContext, useContext, useState, useMemo, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { type AnalyzeExpensesOutput } from '@/ai/flows/expense-analysis-dashboard';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

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
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

const SETTINGS_DOC_ID = 'user-settings';

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyLimit, setMonthlyLimitState] = useState<number | null>(null);
  const [dashboardAnalysis, setDashboardAnalysis] = useState<AnalyzeExpensesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch receipts
        const querySnapshot = await getDocs(collection(db, 'receipts'));
        const receiptsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Receipt));
        setReceipts(receiptsData);

        // Fetch monthly limit
        const settingsDoc = await getDoc(doc(db, 'settings', SETTINGS_DOC_ID));
        if (settingsDoc.exists()) {
          setMonthlyLimitState(settingsDoc.data().monthlyLimit);
        } else {
          setMonthlyLimitState(1000); // Default value
        }
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const addReceipt = async (receiptData: Omit<Receipt, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'receipts'), receiptData);
      setReceipts((prev) => [...prev, { ...receiptData, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding receipt to Firestore:", error);
    }
  };

  const setMonthlyLimit = async (limit: number | null) => {
    try {
      await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), { monthlyLimit: limit });
      setMonthlyLimitState(limit);
    } catch (error) {
      console.error("Error setting monthly limit:", error);
    }
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
    isLoading,
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
