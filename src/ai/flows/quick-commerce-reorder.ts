
'use server';
/**
 * @fileOverview An AI agent that provides an option to reorder groceries from a receipt via a third-party quick commerce application.
 *
 * - quickCommerceReorder - A function that initiates the reordering process.
 * - QuickCommerceReorderInput - The input type for the quickCommerceReorder function.
 * - QuickCommerceReorderOutput - The return type for the quickCommerceReorder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuickCommerceReorderInputSchema = z.object({
  receiptText: z
    .string()
    .describe('The extracted text content from the grocery receipt.'),
});
export type QuickCommerceReorderInput = z.infer<typeof QuickCommerceReorderInputSchema>;

const QuickCommerceReorderOutputSchema = z.object({
  reorderLink: z
    .string()
    .optional()
    .describe(
      'A URL linking to a third-party quick commerce application with the items from the receipt pre-loaded in the cart, if available.'
    ),
  message: z
    .string()
    .describe(
      'A message to the user indicating whether the reorder link is available and any other relevant information.'
    ),
});
export type QuickCommerceReorderOutput = z.infer<typeof QuickCommerceReorderOutputSchema>;

export async function quickCommerceReorder(input: QuickCommerceReorderInput): Promise<QuickCommerceReorderOutput> {
  return quickCommerceReorderFlow(input);
}

const quickCommerceReorderPrompt = ai.definePrompt({
  name: 'quickCommerceReorderPrompt',
  input: {schema: QuickCommerceReorderInputSchema},
  output: {schema: QuickCommerceReorderOutputSchema},
  prompt: `You are a helpful AI assistant designed to analyze grocery receipts and provide users with a convenient way to reorder their items through the quick commerce application StarQuik (https://www.starquik.com/).

  Analyze the following receipt text:
  {{{receiptText}}}

  Your task is to extract the item names from the receipt and construct a search URL for starquik.com.

  1.  Identify and list the grocery items from the receipt text.
  2.  Combine the item names into a single string, with each item separated by a space.
  3.  Construct a URL using the format: \`https://www.starquik.com/search?q=ITEM1+ITEM2+ITEM3\`. Ensure the query is properly URL-encoded (e.g., spaces become '+').
  4.  Set the 'reorderLink' to this generated URL.
  5.  Set the 'message' to "Your items are ready to be reordered on StarQuik. Click the link to search for them."

  If you cannot clearly identify any items from the receipt:
  - Do not generate a reorderLink.
  - Set the 'message' to "I couldn't identify the items from your receipt clearly enough to create a reorder link."

  Ensure that the response is clear, concise, and user-friendly.
  `,
});

const quickCommerceReorderFlow = ai.defineFlow(
  {
    name: 'quickCommerceReorderFlow',
    inputSchema: QuickCommerceReorderInputSchema,
    outputSchema: QuickCommerceReorderOutputSchema,
  },
  async input => {
    const {output} = await quickCommerceReorderPrompt(input);
    return output!;
  }
);
