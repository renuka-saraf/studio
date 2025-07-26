
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
  prompt: `You are a helpful AI assistant designed to analyze grocery receipts and provide users with a convenient way to reorder their items through a third-party quick commerce application.

  Analyze the following receipt text:
  {{{receiptText}}}

  Determine if a reorder link can be generated based on the items listed in the receipt.

  If a reorder link can be generated:
  - Create a URL that deep links to the quick commerce application with the items from the receipt added to the cart. For this prototype, you can use a placeholder URL like "https://example.com/cart?items=...". If you are unable to construct a valid url, do not return one.
  - Set the message to "Your items are ready for reorder!"

  If a reorder link cannot be generated (e.g., items are unclear):
  - Explain to the user that a reorder link is not available and state the reason.
  - Try to extract the list of items from the receipt and show it to the user in the message.

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
