"use client";

import { useReceipts } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User, LogOut } from 'lucide-react';
import { ScanalyzeLogo } from '../icons/logo';
import { Button } from '../ui/button';

export function UsageSelection() {
  const { userEmail, setUsageType, logout } = useReceipts();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-2xl text-center">
        <ScanalyzeLogo className="h-24 w-auto mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {userEmail}!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          How are you using Scanalyze today?
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="text-center cursor-pointer hover:shadow-lg hover:border-primary transition-all transform hover:-translate-y-1 bg-card"
            onClick={() => setUsageType('personal')}
          >
            <CardHeader>
              <User className="h-12 w-12 mx-auto text-primary" />
            </CardHeader>
            <CardContent>
              <CardTitle>Personal</CardTitle>
              <CardDescription className="mt-2">For personal expense tracking and budgeting.</CardDescription>
            </CardContent>
          </Card>
          <Card 
            className="text-center cursor-pointer hover:shadow-lg hover:border-primary transition-all transform hover:-translate-y-1 bg-card"
            onClick={() => setUsageType('business')}
          >
            <CardHeader>
              <Building className="h-12 w-12 mx-auto text-primary" />
            </CardHeader>
            <CardContent>
              <CardTitle>Business</CardTitle>
              <CardDescription className="mt-2">For business expenses and accounting.</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
            <Button variant="link" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Go back
            </Button>
        </div>
      </div>
    </div>
  );
}