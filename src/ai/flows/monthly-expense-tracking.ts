'use server';

/**
 * @fileOverview Tracks monthly expenses against a user-defined limit and sends reminders.
 *
 * - trackExpenses -  The main function to track expenses and send reminders.
 * - TrackExpensesInput - The input type for the trackExpenses function.
 * - TrackExpensesOutput - The return type for the trackExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrackExpensesInputSchema = z.object({
  monthlyLimit: z.number().describe('The user-defined monthly expense limit.'),
  totalExpenses: z.number().describe('The total expenses for the current month.'),
  userId: z.string().describe('Unique identifier for the user.'),
});
export type TrackExpensesInput = z.infer<typeof TrackExpensesInputSchema>;

const TrackExpensesOutputSchema = z.object({
  reminderMessage: z.string().describe('The reminder message to send to the user.'),
});
export type TrackExpensesOutput = z.infer<typeof TrackExpensesOutputSchema>;

export async function trackExpenses(input: TrackExpensesInput): Promise<TrackExpensesOutput> {
  return trackExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trackExpensesPrompt',
  input: {schema: TrackExpensesInputSchema},
  output: {schema: TrackExpensesOutputSchema},
  prompt: `You are a personal finance assistant. You will receive the user's monthly expense limit and total expenses for the month.

You will generate a reminder message based on the following rules:

- If the total expenses are greater than the monthly limit, the message should warn the user that they are exceeding their limit.
- If the total expenses are close to the monthly limit (e.g., within 10%), the message should warn the user that they are approaching their limit.
- If the total expenses are significantly below the monthly limit, the message should congratulate the user on managing their spending well.
- Otherwise, the message should inform the user of their current spending status relative to their limit.

Monthly Limit: {{{monthlyLimit}}}
Total Expenses: {{{totalExpenses}}}
User ID: {{{userId}}}`,
});

const trackExpensesFlow = ai.defineFlow(
  {
    name: 'trackExpensesFlow',
    inputSchema: TrackExpensesInputSchema,
    outputSchema: TrackExpensesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
