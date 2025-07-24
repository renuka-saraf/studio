'use server';

/**
 * @fileOverview AI-powered expense analysis dashboard flow.
 *
 * - analyzeExpenses - A function that analyzes user expenses and provides insights.
 * - AnalyzeExpensesInput - The input type for the analyzeExpenses function.
 * - AnalyzeExpensesOutput - The return type for the analyzeExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeExpensesInputSchema = z.object({
  receiptsData: z.array(
    z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      extractedText: z.string().describe('The extracted text from the receipt.'),
      category: z.string().describe('The category of the expense.'),
    })
  ).describe('An array of receipts data with photo, text, and category.'),
  monthlyExpenseLimit: z.number().optional().describe('The user-defined monthly expense limit.'),
});
export type AnalyzeExpensesInput = z.infer<typeof AnalyzeExpensesInputSchema>;

const AnalyzeExpensesOutputSchema = z.object({
  summary: z.string().describe('A summary of spending patterns.'),
  insights: z.array(z.string()).describe('Key insights into the user expenses.'),
  recommendations: z.array(z.string()).describe('Recommendations based on spending patterns.'),
  limitExceeded: z.boolean().optional().describe('Whether the monthly expense limit is exceeded.'),
  amountExceededBy: z.number().optional().describe('The amount by which the limit is exceeded.'),
});
export type AnalyzeExpensesOutput = z.infer<typeof AnalyzeExpensesOutputSchema>;

export async function analyzeExpenses(input: AnalyzeExpensesInput): Promise<AnalyzeExpensesOutput> {
  return analyzeExpensesFlow(input);
}

const analyzeExpensesPrompt = ai.definePrompt({
  name: 'analyzeExpensesPrompt',
  input: {schema: AnalyzeExpensesInputSchema},
  output: {schema: AnalyzeExpensesOutputSchema},
  prompt: `You are an AI assistant that analyzes user spending patterns based on uploaded receipts.

  Analyze the following receipts data and provide a summary of spending patterns, key insights, and recommendations.

  Receipts Data:
  {{#each receiptsData}}
  - Category: {{this.category}}
    Extracted Text: {{this.extractedText}}
  {{/each}}

  {{#if monthlyExpenseLimit}}
  The user has set a monthly expense limit of {{monthlyExpenseLimit}}.
  Track expenses against this limit, and if the limit is exceeded, indicate by how much and provide tips on reducing expenses.
  {{/if}}

  Provide the output in a structured format with a summary, insights, and recommendations.
  Also if monthlyExpenseLimit was set, provide limitExceeded and amountExceededBy boolean flags.
  `,
});

const analyzeExpensesFlow = ai.defineFlow(
  {
    name: 'analyzeExpensesFlow',
    inputSchema: AnalyzeExpensesInputSchema,
    outputSchema: AnalyzeExpensesOutputSchema,
  },
  async input => {
    const {output} = await analyzeExpensesPrompt(input);
    return output!;
  }
);
