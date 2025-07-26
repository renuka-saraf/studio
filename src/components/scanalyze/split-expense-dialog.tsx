
"use client";

import { useState, useMemo } from "react";
import type { Receipt, ExpenseItem } from "@/context/receipt-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, UserPlus, Users, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SplitExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
}

export function SplitExpenseDialog({ isOpen, onClose, receipt }: SplitExpenseDialogProps) {
  const [selectedItems, setSelectedItems] = useState<ExpenseItem[]>(receipt.items);
  const [people, setPeople] = useState<string[]>(["You", ""]);
  const [splitResult, setSplitResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleItemToggle = (item: ExpenseItem) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.item === item.item && i.price === item.price)
        ? prev.filter((i) => !(i.item === item.item && i.price === item.price))
        : [...prev, item]
    );
  };

  const handlePersonChange = (index: number, name: string) => {
    const newPeople = [...people];
    newPeople[index] = name;
    setPeople(newPeople);
  };

  const addPerson = () => {
    setPeople([...people, ""]);
  };

  const removePerson = (index: number) => {
    if (people.length > 2) {
      const newPeople = [...people];
      newPeople.splice(index, 1);
      setPeople(newPeople);
    }
  };

  const total = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);

  const calculateSplit = () => {
    const validPeople = people.filter(p => p.trim() !== "");
    if (validPeople.length === 0) {
      toast({
        variant: "destructive",
        title: "No one to split with!",
        description: "Please add at least one person to split the expense.",
      });
      return;
    }
    
    const amountPerPerson = total / validPeople.length;
    
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: receipt.currency,
    }).format(amountPerPerson);

    const result = `Each of the ${validPeople.length} people owes ${formattedAmount}.\n\n- ${validPeople.join('\n- ')}`;
    setSplitResult(result);
  };

  const resetState = () => {
    setSelectedItems(receipt.items);
    setPeople(["You", ""]);
    setSplitResult(null);
    onClose();
  }

  const copyToClipboard = () => {
    if (splitResult) {
      navigator.clipboard.writeText(splitResult);
      toast({ title: "Copied to clipboard!" });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetState}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Split Expense</DialogTitle>
          <DialogDescription>
            Select items to include and add people to split the bill with.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto p-1">
            {/* Items List */}
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg">Items from Receipt</h3>
                <ScrollArea className="flex-grow border rounded-md p-4">
                    <div className="space-y-2">
                    {receipt.items.length > 0 ? receipt.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`item-${index}`}
                                    checked={selectedItems.some((i) => i.item === item.item && i.price === item.price)}
                                    onCheckedChange={() => handleItemToggle(item)}
                                />
                                <Label htmlFor={`item-${index}`} className="cursor-pointer truncate">{item.item}</Label>
                            </div>
                            <span className="flex-shrink-0 ml-2">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: receipt.currency }).format(item.price)}
                            </span>
                        </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No individual items were extracted from this receipt.</p>
                    )}
                    </div>
                </ScrollArea>
            </div>
            {/* People & Calculation */}
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="h-5 w-5"/>Split With</h3>
                <div className="space-y-2">
                    {people.map((person, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            placeholder={`Person ${index + 1}`}
                            value={person}
                            onChange={(e) => handlePersonChange(index, e.target.value)}
                            readOnly={index === 0}
                        />
                        {index > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removePerson(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    ))}
                </div>
                 <Button variant="outline" onClick={addPerson}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Person
                </Button>
                
                <div className="mt-auto space-y-4">
                     <div className="flex justify-between items-center text-xl font-bold p-4 bg-secondary rounded-md">
                        <span>Total Selected:</span>
                        <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: receipt.currency }).format(total)}</span>
                    </div>

                    {splitResult ? (
                        <div className="p-4 border border-dashed rounded-md space-y-2 relative">
                            <h4 className="font-semibold">Split Result</h4>
                            <pre className="whitespace-pre-wrap text-sm bg-muted p-2 rounded-sm font-sans">{splitResult}</pre>
                             <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={copyToClipboard}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button className="w-full" onClick={calculateSplit}>Calculate Split</Button>
                    )}
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={resetState}>
            Close
          </Button>
          {splitResult && (
             <Button onClick={() => {setSplitResult(null); setSelectedItems(receipt.items); setPeople(["You", ""]);}}>
                Reset
             </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
