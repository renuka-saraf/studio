
'use server';
/**
 * @fileOverview An AI agent that generates loyalty offers based on purchase history.
 *
 * - generateLoyaltyOffers - Creates personalized offers for users.
 * - LoyaltyOffersInput - The input type for the function.
 * - LoyaltyOffersOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PurchaseHistorySchema = z.object({
  storeName: z.string().describe("The name of the store where the purchase was made."),
  items: z.array(z.string()).describe("A list of item names purchased."),
  totalAmount: z.number().describe("The total amount of the purchase."),
});

export const LoyaltyOffersInputSchema = z.object({
  purchaseHistory: z
    .array(PurchaseHistorySchema)
    .describe("A user's purchase history across different stores."),
});
export type LoyaltyOffersInput = z.infer<typeof LoyaltyOffersInputSchema>;

const OfferSchema = z.object({
    storeName: z.string().describe('The name of the store for which the offer is valid.'),
    offerDetails: z.string().describe('A description of the offer, like "15% off next purchase" or "Buy one get one free on coffee".'),
    reason: z.string().describe('A personalized reason why the user is receiving this offer, e.g., "Because you are a frequent shopper."'),
});

export const LoyaltyOffersOutputSchema = z.object({
  offers: z.array(OfferSchema).describe('A list of personalized loyalty offers.'),
});
export type LoyaltyOffersOutput = z.infer<typeof LoyaltyOffersOutputSchema>;

export async function generateLoyaltyOffers(input: LoyaltyOffersInput): Promise<LoyaltyOffersOutput> {
  return loyaltyOffersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'loyaltyOffersPrompt',
  input: {schema: LoyaltyOffersInputSchema},
  output: {schema: LoyaltyOffersOutputSchema},
  prompt: `You are a marketing AI for a loyalty program. Your goal is to generate relevant and appealing offers for a user based on their purchase history to encourage repeat business.

Analyze the user's purchase history provided below:
{{#each purchaseHistory}}
Store: {{this.storeName}}
Amount: {{this.totalAmount}}
Items: {{#join this.items ", "}}{{/join}}
---
{{/each}}

Based on this history, generate a few compelling offers. For each offer, you must provide:
1.  **storeName**: The name of the store the offer applies to.
2.  **offerDetails**: The specific deal (e.g., "20% off all stationery items").
3.  **reason**: A short, friendly explanation for the offer (e.g., "To thank you for your recent large purchase," or "Since you frequently buy coffee, here's a treat!").

Create offers that are logical and tied to the user's behavior. For example, offer discounts on frequently purchased items or categories. If a user made a large purchase, a simple cashback or percentage off the next purchase is a good reward.`,
});

const loyaltyOffersFlow = ai.defineFlow(
  {
    name: 'loyaltyOffersFlow',
    inputSchema: LoyaltyOffersInputSchema,
    outputSchema: LoyaltyOffersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
