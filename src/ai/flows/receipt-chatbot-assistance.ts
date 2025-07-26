'use server';

/**
 * @fileOverview AI-powered chatbot assistance for receipt-related queries.
 *
 * - receiptChatbot - A function that provides chatbot assistance for receipt-related queries.
 * - ReceiptChatbotInput - The input type for the receiptChatbot function.
 * - ReceiptChatbotOutput - The return type for the receiptChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Performs a Google web search to answer user questions when information is not present in the receipt data.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.string().describe('The search results from the web.'),
  },
  async (input) => {
    // In a real production application, you would implement a call to a web search API here (e.g., Google Custom Search API).
    // For this prototype, we will return a placeholder response to simulate the search functionality.
    console.log(`Simulating web search for: ${input.query}`);
    return `Simulated web search results for "${input.query}". In a real app, this would contain actual data from the web.`;
  }
);


const ReceiptChatbotInputSchema = z.object({
  receiptData: z
    .string()
    .describe('A JSON string of receipt data, containing details such as items, prices, category, amount, and date.'),
  query: z.string().describe('The user query related to the receipt data.'),
  language: z.string().optional().describe('The language in which the query should be answered.'),
});
export type ReceiptChatbotInput = z.infer<typeof ReceiptChatbotInputSchema>;

const ReceiptChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type ReceiptChatbotOutput = z.infer<typeof ReceiptChatbotOutputSchema>;

export async function receiptChatbot(input: ReceiptChatbotInput): Promise<ReceiptChatbotOutput> {
  return receiptChatbotFlow(input);
}

const receiptChatbotPrompt = ai.definePrompt({
  name: 'receiptChatbotPrompt',
  input: {schema: ReceiptChatbotInputSchema},
  output: {schema: ReceiptChatbotOutputSchema},
  tools: [webSearch],
  prompt: `You are a chatbot assistant specialized in answering questions about uploaded receipts. You can also analyze spending patterns.

  You are able to understand multiple languages and respond accordingly, and are able to take voice input.

  Use the following JSON receipt data to answer the user's question. If the information is not available in the receipt data, use the Google web search tool with the user's query to find the answer.

  When asked about spending, analyze the provided receipt data to answer questions like "Which category did I spend the most in?".

  If the language is provided, respond in that language.

  Receipt Data: {{{receiptData}}}
  User Query: {{{query}}}
  {{#if language}}
  Respond in: {{{language}}}
  {{/if}}
  `,
});

const receiptChatbotFlow = ai.defineFlow(
  {
    name: 'receiptChatbotFlow',
    inputSchema: ReceiptChatbotInputSchema,
    outputSchema: ReceiptChatbotOutputSchema,
  },
  async input => {
    const {output} = await receiptChatbotPrompt(input);
    return output!;
  }
);
