// Inventory Stock Recommendations Flow

'use server';

/**
 * @fileOverview Analyzes monthly inventory receipts and provides recommendations for products going out of stock based on trend analysis.
 *
 * - getInventoryRecommendations - A function that handles the inventory recommendations process.
 * - InventoryRecommendationsInput - The input type for the getInventoryRecommendations function.
 * - InventoryRecommendationsOutput - The return type for the getInventoryRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InventoryRecommendationsInputSchema = z.object({
  receiptData: z
    .string()
    .describe(
      'The monthly inventory receipts data as a string.  Should be a list of products, their quantities and dates.'
    ),
});
export type InventoryRecommendationsInput = z.infer<
  typeof InventoryRecommendationsInputSchema
>;

const InventoryRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'Recommendations for products going out of stock based on trend analysis.'
    ),
});
export type InventoryRecommendationsOutput = z.infer<
  typeof InventoryRecommendationsOutputSchema
>;

export async function getInventoryRecommendations(
  input: InventoryRecommendationsInput
): Promise<InventoryRecommendationsOutput> {
  return inventoryRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventoryRecommendationsPrompt',
  input: {schema: InventoryRecommendationsInputSchema},
  output: {schema: InventoryRecommendationsOutputSchema},
  prompt: `You are an expert inventory analyst. Analyze the monthly inventory receipts data and provide recommendations for products going out of stock based on trend analysis.

Receipt Data:
{{{receiptData}}} `,
});

const inventoryRecommendationsFlow = ai.defineFlow(
  {
    name: 'inventoryRecommendationsFlow',
    inputSchema: InventoryRecommendationsInputSchema,
    outputSchema: InventoryRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
