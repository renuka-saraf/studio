
"use client";

import { useReceipts } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, User } from 'lucide-react';
import { ScanalyzeLogo } from '../icons/logo';

export function UsageModeSelector() {
  const { setUsageMode } = useReceipts();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center items-center">
            <ScanalyzeLogo className="h-12 w-auto" />
          <CardDescription className="pt-2">
            How would you like to use the app?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
            <Button size="lg" variant="outline" onClick={() => setUsageMode('personal')}>
                <User className="mr-2 h-5 w-5" />
                Personal Use
            </Button>
            <Button size="lg" variant="outline" onClick={() => setUsageMode('business')}>
                <Briefcase className="mr-2 h-5 w-5" />
                Business Use
            </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">Your data will be stored separately based on your choice.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
