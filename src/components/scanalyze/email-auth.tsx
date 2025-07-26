
"use client";

import { useState } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanalyzeLogo } from '../icons/logo';
import { useToast } from '@/hooks/use-toast';

export function EmailAuth() {
  const { login } = useReceipts();
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleLogin = () => {
    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return;
    }
    login(email);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center items-center space-y-4">
          <ScanalyzeLogo className="h-16 w-auto" />
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>
            Enter your email to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              required
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            Continue with Email
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            We'll use your email to securely store your receipt data.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
