
"use client";

import { useState, useRef, type Dispatch, type SetStateAction, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, Loader2, Video, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useReceipts, type Receipt } from '@/context/receipt-context';
import { categorizeExpense } from '@/ai/flows/categorize-expense';
import {extractText} from '@/ai/flows/extract-text';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { collection, addDoc, doc, setDoc, increment } from 'firebase/firestore';
// import { getFirestore } from 'firebase/firestore';


interface ReceiptUploaderProps {
  isProcessing: boolean;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
}

export function ReceiptUploader({ isProcessing, setIsProcessing }: ReceiptUploaderProps) {
  const { addReceipt, userEmail, usageType } = useReceipts();
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = async (dataUri: string) => {
    if (!usageType || !userEmail) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User or usage type not identified. Please log in again.",
        });
        return;
    }

    setIsProcessing(true);
    setShowScanner(true);
    setPreview(dataUri);

    try {
      const extractedTextResponse = await extractText({
        photoDataUri: dataUri,
      });

      const receiptText = extractedTextResponse.extractedText;
      
      const result = await categorizeExpense({
        receiptDataUri: dataUri,
        receiptText: receiptText,
        usageType: usageType
      });
      
      const newReceiptForState: Omit<Receipt, 'id'> = {
        imageDataUri: dataUri,
        text: receiptText,
        category: result.category,
        amount: result.amount,
        currency: result.currency,
        items: result.items || [],
        gstInfo: result.gstInfo,
      };
      
      // const db = getFirestore();

      // const receiptDataForFirestore = {
      //   userEmail: userEmail,
      //   timestamp: new Date(),
      //   items: result.items || [],
      //   category: result.category,
      //   confidence: result.confidence || 0,
      //   totalAmount: result.amount || 0,
      //   currency: result.currency,
      //   gstInfo: result.gstInfo,
      //   rawData: receiptText, 
      //   imageDataUri: dataUri,
      // };

      try {
        // const docRef = await addDoc(collection(db, `users/${userEmail}/receipts`), receiptDataForFirestore);
        // console.log('Receipt document written with ID: ', docRef.id);

        // const spendingSummaryRef = doc(db, `users/${userEmail}/spendingSummary`, result.category);
        // await setDoc(spendingSummaryRef, {
        //   userEmail: userEmail,
        //   category: result.category,
        //   totalSpent: increment(result.amount || 0),
        //   lastUpdated: new Date(),
        // }, { merge: true }); 
        // console.log('Spending summary updated for category: ', result.category);

        addReceipt(newReceiptForState);

        toast({
          title: "Receipt Categorized!",
          description: `Expense added to '${result.category}' with ${Math.round((result.confidence || 0) * 100)}% confidence.`,
        });

      } catch (error) {
        console.error("Error saving data to Firebase:", error);
        addReceipt(newReceiptForState); // Still add to local state on DB error
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong saving your data.",
          description: "Failed to save receipt data to the database. It is saved locally.",
        });
      }
      
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
  };


  useEffect(() => {
    if (isCameraDialogOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraDialogOpen, toast]);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      processImage(dataUri);
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

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/png');
            processImage(dataUri);
            setIsCameraDialogOpen(false);
        }
    }
  };


  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
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
          <Button variant="outline" disabled={isProcessing} size="lg" onClick={() => setIsCameraDialogOpen(true)}>
            <Camera className="mr-2 h-5 w-5" />
            Use Camera
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Scan Receipt</DialogTitle>
            <DialogDescription>
              Position your receipt in the frame and click capture.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <video ref={videoRef} className={cn("w-full aspect-video rounded-md bg-black", hasCameraPermission === false ? 'hidden' : 'block')} autoPlay muted playsInline />
            {hasCameraPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-2">Requesting camera...</p>
                </div>
            )}
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <Ban className="h-4 w-4" />
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                        To use the camera, you need to grant permission in your browser settings.
                    </AlertDescription>
                </Alert>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCameraDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCapture} disabled={!hasCameraPermission}>
              <Camera className="mr-2 h-4 w-4" /> Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
