
"use client";

import { useState } from 'react';
import { useReceipts } from '@/context/receipt-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, KeyRound, Loader2 } from 'lucide-react';

export function EmailAuth() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pinSent, setPinSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, sendPin } = useReceipts();
  const { toast } = useToast();

  const handleSendPin = async () => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Please enter your email.' });
      return;
    }
    setIsLoading(true);
    const success = await sendPin(email);
    if (success) {
      setPinSent(true);
      toast({ title: 'PIN Sent', description: 'A PIN has been sent to your email (check console for simulation).' });
    } else {
      toast({ variant: 'destructive', title: 'Failed to send PIN. Please try again.' });
    }
    setIsLoading(false);
  };

  const handleLogin = () => {
    if (!pin) {
        toast({ variant: 'destructive', title: 'Please enter your PIN.' });
        return;
    }
    setIsLoading(true);
    const success = login(email, pin);
    if (!success) {
      toast({ variant: 'destructive', title: 'Invalid PIN. Please try again.' });
      setIsLoading(false);
    }
    // On success, the main page will render due to context change
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Scanalyze</CardTitle>
          <CardDescription>
            {pinSent ? 'Enter the PIN sent to your email' : 'Sign in with your email to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!pinSent ? (
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium">PIN</label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="pin"
                        type="text"
                        placeholder="123456"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                    />
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!pinSent ? (
            <Button className="w-full" onClick={handleSendPin} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send PIN
            </Button>
          ) : (
            <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
