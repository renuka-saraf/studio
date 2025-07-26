
"use client";

import { useState } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { ReceiptUploader } from '@/components/scanalyze/receipt-uploader';
import { ReceiptList } from '@/components/scanalyze/receipt-list';
import { EmailAuth } from '@/components/scanalyze/email-auth';
import { UsageSelection } from '@/components/scanalyze/usage-selection';
import { collection, addDoc, doc, setDoc, increment } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';


// Your web app's Firebase configuration (paste the one you copied)
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "scanalyze-8x740.firebaseapp.com",
  projectId: "scanalyze-8x740",
  storageBucket: "scanalyze-8x740.appspot.com",
  messagingSenderId: "213425288049",
  appId: "1:213425288049:web:a1b2c3d4e5f6g7h8i9j0",
  // measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
if (getApps().length === 0) {
  try {
    const app = initializeApp(firebaseConfig);
    // Get a reference to the Firestore service
    const db = getFirestore(app);
    console.log("Firestore database reference obtained!");
  } catch (error) {
      if (error instanceof Error) {
          console.error("Firebase initialization error:", error);
      }
  }
}


export default function HomePage() {
  const { userEmail, usageType } = useReceipts();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!userEmail) {
    return <EmailAuth />;
  }

  if (!usageType) {
    return <UsageSelection />;
  }

  return (
    <div className="container mx-auto p-0">
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-headline">
          Scan & Analyze
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Upload a receipt to automatically categorize and understand your spending.
        </p>
      </header>
      
      <ReceiptUploader isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
      
      <div className="my-12">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-lg font-medium text-gray-900 dark:text-gray-100 font-headline">
              Your Receipts
            </span>
          </div>
        </div>
      </div>
      
      <ReceiptList isProcessing={isProcessing} />
    </div>
  );
}
