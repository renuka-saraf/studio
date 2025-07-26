
"use client";

import { useState } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { ReceiptUploader } from '@/components/scanalyze/receipt-uploader';
import { ReceiptList } from '@/components/scanalyze/receipt-list';
import { EmailAuth } from '@/components/scanalyze/email-auth';
import { UsageSelection } from '@/components/scanalyze/usage-selection';
// import { collection, addDoc, doc, setDoc, increment } from 'firebase/firestore';
// import { getFirestore } from 'firebase/firestore';
// import { initializeApp, getApps } from 'firebase/app';


// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// To enable Firebase, uncomment the imports above and the code below.
// Then, replace this placeholder with your project's actual Firebase configuration.
/*
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
*/


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
