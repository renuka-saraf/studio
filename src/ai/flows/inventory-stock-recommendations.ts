
'use server';
/**
 * @fileOverview An AI agent that analyzes inventory receipts and provides restocking recommendations.
 *
 * - getInventoryStockRecommendations - Analyzes purchase history to recommend restocking.
 * - InventoryStockInput - The input type for the function.
 * - InventoryStockOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiptItemSchema = z.object({
  item: z.string(),
  quantity: z.number(),
  price: z.number(),
});

const ReceiptHistorySchema = z.object({
  date: z.string().describe('The date of the purchase in ISO format.'),
  items: z.array(ReceiptItemSchema),
});

const InventoryStockInputSchema = z.object({
  receiptHistory: z
    .array(ReceiptHistorySchema)
    .describe(
      "An array of past inventory purchase receipts, including dates and items purchased."
    ),
});
export type InventoryStockInput = z.infer<typeof InventoryStockInputSchema>;

const RecommendationSchema = z.object({
    item: z.string().describe('The name of the item being recommended for restock.'),
    reason: z.string().describe('The reasoning behind the recommendation, based on trend analysis.'),
    suggestion: z.string().describe('A concrete suggestion, e.g., "Consider ordering 10 units."'),
});

const InventoryStockOutputSchema = z.object({
  recommendations: z
    .array(RecommendationSchema)
    .describe(
      'A list of recommendations for products that may be going out of stock.'
    ),
});
export type InventoryStockOutput = z.infer<typeof InventoryStockOutputSchema>;

export async function getInventoryStockRecommendations(input: InventoryStockInput): Promise<InventoryStockOutput> {
  return inventoryStockFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventoryStockPrompt',
  input: {schema: InventoryStockInputSchema},
  output: {schema: InventoryStockOutputSchema},
  prompt: `You are a business supply chain analyst AI. Your task is to analyze a company's inventory purchase history from receipts and provide proactive restocking recommendations.

Analyze the following purchase history:
{{#each receiptHistory}}
Date: {{this.date}}
Items:
{{#each this.items}}
- {{this.item}} (Quantity: {{this.quantity}}, Price: {{this.price}})
{{/each}}
---
{{/each}}

Based on this data, identify purchasing trends, seasonality, and consumption rates. Determine which items are likely to run out of stock soon.

For each item you identify, provide:
1.  **item**: The name of the product.
2.  **reason**: A brief explanation of why you are recommending it (e.g., "Increased purchase frequency in the last month," "Consistently purchased every week and last purchased 6 days ago.").
3.  **suggestion**: A clear, actionable suggestion (e.g., "Recommend reordering within 3 days," "Suggest increasing next order quantity by 20% to meet demand.").

Focus on the most critical items that need attention. If no clear trends emerge, return an empty recommendations array.`,
});

const inventoryStockFlow = ai.defineFlow(
  {
    name: 'inventoryStockFlow',
    inputSchema: InventoryStockInputSchema,
    outputSchema: InventoryStockOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
