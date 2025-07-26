
"use client";

import { useReceipts } from '@/context/receipt-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { usageType, userEmail } = useReceipts();
  const router = useRouter();

  useEffect(() => {
    // If we have an email but no usage type, we are at the selection screen, no need to redirect from other pages yet, let them load.
    // The main check is if usageType becomes null after being set.
    if (!userEmail || !usageType) {
      router.push('/');
    }
  }, [usageType, userEmail, router]);

  // Render a loading state while we check for authentication, to prevent flashes of content
  if (!usageType || !userEmail) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
