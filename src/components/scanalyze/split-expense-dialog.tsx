
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Receipt, ExpenseItem } from "@/context/receipt-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, UserPlus, Users, Copy, Minus, Plus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

interface SplitExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
}

type PersonSplits = {
  [personName: string]: {
    [itemName: string]: number; // quantity
  };
};

type SplitResult = {
  person: string;
  amount: number;
}

export function SplitExpenseDialog({ isOpen, onClose, receipt }: SplitExpenseDialogProps) {
  const [people, setPeople] = useState<string[]>(["You", ""]);
  const [personSplits, setPersonSplits] = useState<PersonSplits>({});
  const [splitResult, setSplitResult] = useState<SplitResult[] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, receipt]);

  const resetState = () => {
    const initialSplits: PersonSplits = {};
    const initialPeople = ["You", ""];
    initialPeople.forEach(p => {
        if(p) initialSplits[p] = {};
    });
    
    setPeople(initialPeople);
    setPersonSplits(initialSplits);
    setSplitResult(null);
  }
  
  const handleClose = () => {
    resetState();
    onClose();
  }

  const handlePersonNameChange = (index: number, newName: string) => {
    const oldName = people[index];
    const newPeople = [...people];
    newPeople[index] = newName;
    setPeople(newPeople);

    // Update the splits object with the new name
    if (oldName in personSplits) {
        const oldSplitData = personSplits[oldName];
        const newSplits = { ...personSplits };
        delete newSplits[oldName];
        if (newName.trim()) {
            newSplits[newName.trim()] = oldSplitData;
        }
        setPersonSplits(newSplits);
    } else if (newName.trim()){
        const newSplits = { ...personSplits };
        newSplits[newName.trim()] = {};
        setPersonSplits(newSplits);
    }
  };

  const addPerson = () => {
    setPeople([...people, ""]);
  };

  const removePerson = (index: number) => {
    if (people.length > 1) {
      const personNameToRemove = people[index];
      const newPeople = people.filter((_, i) => i !== index);
      setPeople(newPeople);
      
      const newSplits = { ...personSplits };
      delete newSplits[personNameToRemove];
      setPersonSplits(newSplits);
    }
  };
  
  const remainingQuantities = useMemo(() => {
    const remaining: { [itemName: string]: number } = {};
    receipt.items.forEach(item => {
        const assignedQuantity = Object.values(personSplits).reduce((sum, split) => sum + (split[item.item] || 0), 0);
        remaining[item.item] = item.quantity - assignedQuantity;
    });
    return remaining;
  }, [personSplits, receipt.items]);

  const handleQuantityChange = (personName: string, item: ExpenseItem, change: number) => {
    const currentQuantity = personSplits[personName]?.[item.item] || 0;
    const newQuantity = currentQuantity + change;

    if (newQuantity < 0) {
      toast({ variant: "destructive", description: "Quantity cannot be less than 0." });
      return;
    }
    
    if (change > 0 && remainingQuantities[item.item] <= 0) {
      toast({ variant: "destructive", description: `All ${item.quantity} units of ${item.item} have been assigned.` });
      return;
    }

    setPersonSplits(prevSplits => ({
      ...prevSplits,
      [personName]: {
        ...prevSplits[personName],
        [item.item]: newQuantity
      }
    }));
  };

  const calculateSplit = () => {
    const validPeople = people.filter(p => p.trim() !== "");
    if (validPeople.length === 0) {
      toast({ variant: "destructive", title: "Add people to split with." });
      return;
    }

    const finalSplits = { ...personSplits };
    const youPerson = "You";
    if (!finalSplits[youPerson]) {
        finalSplits[youPerson] = {};
    }
    receipt.items.forEach(item => {
        const remaining = remainingQuantities[item.item];
        if (remaining > 0) {
            finalSplits[youPerson][item.item] = (finalSplits[youPerson][item.item] || 0) + remaining;
        }
    });

    const results: SplitResult[] = [];

    validPeople.forEach(person => {
        const personTotal = receipt.items.reduce((sum, item) => {
            const qty = finalSplits[person]?.[item.item] || 0;
            return sum + (item.price * qty);
        }, 0);
        
        if (personTotal > 0) {
            results.push({ person, amount: personTotal });
        }
    });

    setSplitResult(results);
  };

  const copyToClipboard = () => {
    if (splitResult) {
      const summary = splitResult.map(res =>
        `${res.person} owes ${new Intl.NumberFormat("en-US", { style: "currency", currency: receipt.currency }).format(res.amount)}`
      ).join('\n');
      navigator.clipboard.writeText(summary);
      toast({ title: "Copied to clipboard!" });
    }
  }

  const formatCurrency = (amount: number) => {
     try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: receipt.currency || "USD" }).format(amount);
     } catch (e) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", currencyDisplay: 'code' }).format(amount).replace("USD", receipt.currency || "");
     }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Split Expense by Item</DialogTitle>
          <DialogDescription>
            Assign items and quantities to each person to split the bill accurately. Unassigned items default to you.
          </DialogDescription>
        </DialogHeader>
        
        {receipt.items.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-muted-foreground">
            No individual items were extracted to split.
          </div>
        ) : (
          <div className="flex-grow grid md:grid-cols-2 gap-6 overflow-hidden">
              {/* People & Assignments */}
              <div className="flex flex-col gap-4 overflow-hidden">
                  <div className="flex items-center justify-between">
                     <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="h-5 w-5"/>People</h3>
                     <Button variant="outline" size="sm" onClick={addPerson}><UserPlus className="mr-2 h-4 w-4" /> Add</Button>
                  </div>
                  <div className="space-y-2">
                      {people.map((person, index) => (
                      <div key={index} className="flex items-center gap-2">
                          <Input
                              placeholder={`Person ${index + 1}`}
                              value={person}
                              onChange={(e) => handlePersonNameChange(index, e.target.value)}
                              readOnly={index === 0}
                          />
                          {index > 0 && (
                              <Button variant="ghost" size="icon" onClick={() => removePerson(index)}>
                                  <X className="h-4 w-4" />
                              </Button>
                          )}
                      </div>
                      ))}
                  </div>

                  <h3 className="font-semibold text-lg mt-4">Item Assignments</h3>
                  <ScrollArea className="flex-grow border rounded-md">
                      <div className="p-4 space-y-4">
                      {receipt.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="p-2 rounded-md border">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="font-medium truncate pr-2" title={item.item}>{item.item}</Label>
                            <div className="flex-shrink-0 text-right">
                                <Badge variant="secondary">{item.quantity} total</Badge>
                                <Badge variant={remainingQuantities[item.item] > 0 ? 'outline' : 'destructive'} className="ml-2 w-[70px] text-center justify-center">
                                    {remainingQuantities[item.item]} left
                                </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {people.filter(p => p.trim() !== "" && p !== "You").map((personName, personIndex) => (
                                <div key={personIndex} className="flex justify-between items-center">
                                    <Label htmlFor={`${item.item}-${personName}`} className="text-sm text-muted-foreground truncate pr-2">{personName}</Label>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(personName, item, -1)}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            id={`${item.item}-${personName}`}
                                            type="number"
                                            className="h-6 w-12 text-center p-0"
                                            readOnly
                                            value={personSplits[personName]?.[item.item] || 0}
                                        />
                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(personName, item, 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      </div>
                  </ScrollArea>
              </div>
              
              {/* Calculation & Result */}
              <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-lg">Result</h3>
                  <Card className="flex-grow relative flex flex-col">
                      {splitResult ? (
                        <>
                          <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={copyToClipboard}>
                              <Copy className="h-4 w-4" />
                          </Button>
                          <CardContent className="p-0 flex-grow">
                            <ScrollArea className="h-full">
                                <div className="p-4 space-y-3">
                                {splitResult.map((res, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                                      <p className="font-medium">{res.person}</p>
                                      <p className="font-semibold text-lg">{formatCurrency(res.amount)}</p>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                          </CardContent>
                        </>
                      ) : (
                        <div className="m-auto text-center text-muted-foreground p-4">
                            <Wallet className="mx-auto h-10 w-10 mb-2"/>
                            <p>Assign items and click "Calculate Split" to see the results.</p>
                        </div>
                      )}
                  </Card>

                  {splitResult ? (
                    <Button className="w-full" variant="secondary" onClick={() => setSplitResult(null)}>
                        Edit Split
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={calculateSplit}>
                        Calculate Split
                    </Button>
                  )}
              </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
