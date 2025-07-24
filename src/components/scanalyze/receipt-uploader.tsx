"use client";

import { useState, useRef, type Dispatch, type SetStateAction } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useReceipts, type Receipt } from '@/context/receipt-context';
import { categorizeExpense } from '@/ai/flows/categorize-expense';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ReceiptUploaderProps {
  isProcessing: boolean;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
}

export function ReceiptUploader({ isProcessing, setIsProcessing }: ReceiptUploaderProps) {
  const { addReceipt } = useReceipts();
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    setShowScanner(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setPreview(dataUri);

      setTimeout(async () => {
        try {
          const mockReceiptText = "Receipt for groceries: milk, bread, eggs.";
          
          const result = await categorizeExpense({
            receiptDataUri: dataUri,
            receiptText: mockReceiptText,
          });
          
          const newReceipt: Receipt = {
            id: new Date().toISOString(),
            imageDataUri: dataUri,
            text: mockReceiptText,
            category: result.category,
            amount: parseFloat((Math.random() * (200 - 10) + 10).toFixed(2)),
          };
          
          addReceipt(newReceipt);
          toast({
            title: "Receipt Categorized!",
            description: `Expense added to '${result.category}' with ${Math.round(result.confidence * 100)}% confidence.`,
          });
          
        } catch (error) {
          console.error("Categorization failed:", error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Failed to categorize the receipt. Please try again.",
          });
        } finally {
          setIsProcessing(false);
          setShowScanner(false);
          setPreview(null);
        }
      }, 2500);
    };
    reader.readAsDataURL(file);
  };
  
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  return (
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-none sm:rounded-lg">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center p-8 border-2 border-dashed cursor-pointer transition-colors h-64",
              isDragActive ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            {isProcessing && preview ? (
              <div className="relative w-full h-full">
                  <Image src={preview} alt="Receipt preview" fill className="rounded-lg object-contain" />
                  {showScanner && <div className="absolute top-0 left-0 w-full h-full scanner-animation rounded-lg" />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                      <Loader2 className="h-12 w-12 animate-spin text-white" />
                      <p className="text-white mt-4 text-lg font-medium">Scanning & Analyzing...</p>
                  </div>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg font-medium">
                  {isDragActive ? "Drop the files here ..." : "Drag & drop a receipt image"}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">or use the buttons below</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4 flex justify-center gap-4">
          <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} size="lg">
            <Upload className="mr-2 h-5 w-5" />
            Upload File
          </Button>
          <Button variant="outline" disabled={isProcessing} size="lg">
            <Camera className="mr-2 h-5 w-5" />
            Use Camera
          </Button>
        </CardFooter>
      </Card>
  );
}
