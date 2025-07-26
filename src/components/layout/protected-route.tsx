
"use client";

import { useReceipts } from '@/context/receipt-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { usageType, userEmail } = useReceipts();
  const router = useRouter();

  useEffect(() => {
    // If there's no email or usageType, redirect to the start of the flow.
    // This is the core logic that protects the route.
    if (!userEmail || !usageType) {
      router.push('/');
    }
  }, [usageType, userEmail, router]);

  // While checking, or if redirection is in progress, show a loading spinner.
  // This prevents the protected content from flashing on the screen after logout.
  if (!usageType || !userEmail) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only if the user is fully authenticated, render the page content.
  return <>{children}</>;
}
