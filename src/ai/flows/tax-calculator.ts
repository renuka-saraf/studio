
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
import { GstInfo, Receipt } from '@/context/receipt-context';


// Define input/output types for the function, but DO NOT export the Zod schemas.
export type TaxReportInput = Pick<Receipt, 'amount' | 'gstInfo' | 'id'>[];

const TaxReportOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A brief, helpful summary for the user regarding their tax situation based on the provided data.'
    ),
  totalGstPaid: z
    .number()
    .describe('The aggregated total of all GST paid across all receipts.'),
  gstBreakdown: z.record(z.number()).describe('A breakdown of total amounts for each type of GST found (e.g., CGST, SGST, IGST).')
});
export type TaxReportOutput = z.infer<typeof TaxReportOutputSchema>;

// This is the only exported function.
export async function generateTaxReport(receipts: TaxReportInput): Promise<TaxReportOutput> {
  return taxReportFlow(receipts);
}

// Internal Zod schema for the prompt, not exported.
const GstBreakdownItemSchema = z.object({
  taxType: z.string(),
  amount: z.number(),
});

const GstInfoSchema = z.object({
  gstNumber: z.string().optional(),
  gstBreakdown: z.array(GstBreakdownItemSchema).optional(),
});

const TaxReportInputSchema = z.array(
  z.object({
    amount: z.number(),
    gstInfo: GstInfoSchema.optional(),
    id: z.string().describe('The date of the purchase as a stringified timestamp.'),
  })
).describe('An array of receipts containing GST information.');


const prompt = ai.definePrompt({
  name: 'taxReportPrompt',
  input: {schema: TaxReportInputSchema},
  output: {schema: TaxReportOutputSchema},
  prompt: `You are a helpful accounting AI assistant. Your purpose is to analyze a list of receipts and generate a summary to assist a small business owner with their tax return filing, specifically focusing on Goods and Services Tax (GST).

First, calculate the 'totalGstPaid' by summing up the value of every single GST type from every receipt.
Then, create a 'gstBreakdown' by summing up the totals for each individual GST type (like CGST, SGST, IGST) across all receipts.

Then, analyze the aggregated data and provide a concise, user-friendly 'summary'. This summary should:
- State the total GST paid and mention the breakdown.
- Explain what this figure represents (e.g., potential for input tax credit).
- Advise the user to consult with a professional tax advisor for official filing.
- Do NOT provide definitive financial or legal advice.

Here is the list of receipts:
{{#each this}}
- Date: {{this.id}}, Total: {{this.amount}}, GSTIN: {{this.gstInfo.gstNumber}}
  {{#if this.gstInfo.gstBreakdown}}
  GST Breakdown: 
  {{#each this.gstInfo.gstBreakdown}}
  - {{this.taxType}}: {{this.amount}}
  {{/each}}
  {{/if}}
{{/each}}

Generate the 'totalGstPaid', 'gstBreakdown' and the 'summary' and provide the output in the specified JSON format.`,
});

const taxReportFlow = ai.defineFlow(
  {
    name: 'taxReportFlow',
    inputSchema: TaxReportInputSchema,
    outputSchema: TaxReportOutputSchema,
  },
  async (receipts) => {
    // The prompt can calculate the sums, but doing it here is more reliable.
    let totalGstPaid = 0;
    const gstBreakdown: Record<string, number> = {};

    receipts.forEach(receipt => {
        if (receipt.gstInfo && receipt.gstInfo.gstBreakdown) {
            receipt.gstInfo.gstBreakdown.forEach(item => {
                totalGstPaid += item.amount;
                gstBreakdown[item.taxType] = (gstBreakdown[item.taxType] || 0) + item.amount;
            });
        }
    });

    const {output} = await prompt(receipts);
    
    // Ensure the calculated totals are set on the final output.
    output!.totalGstPaid = totalGstPaid;
    output!.gstBreakdown = gstBreakdown;
    
    return output!;
  }
);
