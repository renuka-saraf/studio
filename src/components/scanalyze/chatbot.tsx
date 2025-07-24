"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReceipts } from '@/context/receipt-context';
import { receiptChatbot } from '@/ai/flows/receipt-chatbot-assistance';
import { BotMessageSquare, Mic, Loader2, User, Sparkles, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isListening, setIsListening] = useState(false);
  const { receipts } = useReceipts();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toast({ variant: 'destructive', title: 'Voice recognition not supported in your browser.'});
        return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event: any) => {
        let errorMessage = event.error;
        if (event.error === 'not-allowed') {
            errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
        } else if (event.error === 'no-speech') {
            errorMessage = "No speech detected. Please try again.";
        }
        toast({ variant: 'destructive', title: 'Voice recognition error', description: errorMessage });
        setIsListening(false);
    };
    recognitionRef.current.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setInput(speechResult);
        handleSubmit(speechResult);
    };

    recognitionRef.current.start();
  };

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isPending) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    startTransition(async () => {
      try {
        const receiptData = JSON.stringify(receipts.map(r => ({
          id: r.id,
          date: new Date(r.id).toLocaleString(),
          category: r.category,
          amount: r.amount,
          currency: r.currency,
          items: r.text.split('\n').slice(0, 10).join(', ') // A summary of items
        })));
        
        if (!receipts || receipts.length === 0) {
          setMessages((prev) => [...prev, { role: 'assistant', content: "I don't have any receipt information yet. Please upload a receipt first." }]);
          return;
        }
        
        const result = await receiptChatbot({ receiptData, query });
        setMessages((prev) => [...prev, { role: 'assistant', content: result.response }]);
      } catch (error) {
        console.error('Chatbot error:', error);
        setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
      }
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50">
        <BotMessageSquare className="h-8 w-8" />
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>AI Assistant</SheetTitle>
            <SheetDescription>Ask me anything about your uploaded receipts.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow my-4 pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Avatar><AvatarFallback><BotMessageSquare /></AvatarFallback></Avatar>
                    <div className="p-3 rounded-lg bg-secondary"><p className="text-sm">Hello! How can I help you with your expenses today?</p></div>
                </div>
              {messages.map((message, index) => (
                <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && (<Avatar><AvatarFallback><Sparkles className="text-accent" /></AvatarFallback></Avatar>)}
                  <div className={cn('p-3 rounded-lg max-w-[80%]', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (<Avatar><AvatarFallback><User /></AvatarFallback></Avatar>)}
                </div>
              ))}
              {isPending && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar><AvatarFallback><Sparkles className="text-accent" /></AvatarFallback></Avatar>
                    <div className="p-3 rounded-lg bg-secondary"><Loader2 className="h-5 w-5 animate-spin"/></div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }} className="flex w-full items-center space-x-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." disabled={isPending} />
              <Button type="button" variant="outline" size="icon" onClick={handleVoiceInput} disabled={isPending}>
                <Mic className={cn("h-4 w-4", isListening && "text-destructive animate-pulse")} />
              </Button>
              <Button type="submit" disabled={isPending || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
