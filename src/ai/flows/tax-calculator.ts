
'use server';
/**
 * @fileOverview An AI agent that generates tax reports based on receipt data.
 *
 * - generateTaxReport - Generates a summary for tax returns from receipts.
 * - TaxReportInput - The input type for the function.
 * - TaxReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GstInfoSchema = z.object({
  gstNumber: z.string().describe('The GST Identification Number.'),
  gstAmount: z.number().describe('The total GST amount paid on the receipt.'),
});

export const TaxReportInputSchema = z.object({
  receipts: z
    .array(
      z.object({
        totalAmount: z.number(),
        gstInfo: GstInfoSchema,
        date: z.string().describe('The date of the purchase in ISO format.'),
      })
    )
    .describe(
      'An array of receipts containing GST information.'
    ),
});
export type TaxReportInput = z.infer<typeof TaxReportInputSchema>;

export const TaxReportOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A brief, helpful summary for the user regarding their tax situation based on the provided data.'
    ),
  totalGstPaid: z
    .number()
    .describe('The aggregated total of all GST paid across all receipts.'),
});
export type TaxReportOutput = z.infer<typeof TaxReportOutputSchema>;

export async function generateTaxReport(input: TaxReportInput): Promise<TaxReportOutput> {
  return taxReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taxReportPrompt',
  input: {schema: TaxReportInputSchema},
  output: {schema: TaxReportOutputSchema},
  prompt: `You are a helpful accounting AI assistant. Your purpose is to analyze a list of receipts and generate a summary to assist a small business owner with their tax return filing, specifically focusing on Goods and Services Tax (GST).

First, calculate the 'totalGstPaid' by summing up the 'gstAmount' from every single receipt provided in the input.

Then, analyze the aggregated data and provide a concise, user-friendly 'summary'. This summary should:
- State the total GST paid.
- Explain what this figure represents (e.g., potential for input tax credit).
- Advise the user to consult with a professional tax advisor for official filing.
- Do NOT provide definitive financial or legal advice.

Here is the list of receipts:
{{#each receipts}}
- Date: {{this.date}}, Total: {{this.totalAmount}}, GSTIN: {{this.gstInfo.gstNumber}}, GST Paid: {{this.gstInfo.gstAmount}}
{{/each}}

Generate the 'totalGstPaid' and the 'summary' and provide the output in the specified JSON format.`,
});

const taxReportFlow = ai.defineFlow(
  {
    name: 'taxReportFlow',
    inputSchema: TaxReportInputSchema,
    outputSchema: TaxReportOutputSchema,
  },
  async input => {
    // The prompt can calculate the sum, but doing it here is more reliable.
    const totalGstPaid = input.receipts.reduce(
      (sum, receipt) => sum + (receipt.gstInfo.gstAmount || 0),
      0
    );

    const {output} = await prompt(input);
    
    // Ensure the calculated total is set on the final output.
    output!.totalGstPaid = totalGstPaid;
    
    return output!;
  }
);
