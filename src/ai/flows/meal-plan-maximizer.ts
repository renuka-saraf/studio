// This is a server-side file.
'use server';

/**
 * @fileOverview Provides AI-powered dietary recommendations based on a food receipt.
 *
 * - mealPlanMaximizer - A function that generates dietary recommendations.
 * - MealPlanMaximizerInput - The input type for the mealPlanMaximizer function.
 * - MealPlanMaximizerOutput - The return type for the mealPlanMaximizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MealPlanMaximizerInputSchema = z.object({
  receiptDetails: z
    .string()
    .describe('The extracted details from the food receipt.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('The user specified dietary preferences and restrictions.'),
});
export type MealPlanMaximizerInput = z.infer<typeof MealPlanMaximizerInputSchema>;

const MealPlanMaximizerOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('Dietary recommendations based on the receipt details.'),
});
export type MealPlanMaximizerOutput = z.infer<typeof MealPlanMaximizerOutputSchema>;

export async function mealPlanMaximizer(input: MealPlanMaximizerInput): Promise<MealPlanMaximizerOutput> {
  return mealPlanMaximizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mealPlanMaximizerPrompt',
  input: {
    schema: MealPlanMaximizerInputSchema,
  },
  output: {
    schema: MealPlanMaximizerOutputSchema,
  },
  prompt: `You are a dietary expert. You will provide dietary recommendations to the user based on the contents of their food receipt.  Take into account any dietary preferences specified.

Receipt Details: {{{receiptDetails}}}
Dietary Preferences: {{{dietaryPreferences}}}

Provide recommendations in a short paragraph.
`,
});

const mealPlanMaximizerFlow = ai.defineFlow(
  {
    name: 'mealPlanMaximizerFlow',
    inputSchema: MealPlanMaximizerInputSchema,
    outputSchema: MealPlanMaximizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
