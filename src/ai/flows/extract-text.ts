
'use server';
/**
 * @fileOverview A text extraction AI agent.
 *
 * - extractText - A function that handles the text extraction process from an image.
 * - ExtractTextInput - The input type for the extractText function.
 * - ExtractTextOutput - The return type for the extractText function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractTextInput = z.infer<typeof ExtractTextInputSchema>;

const ExtractTextOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the image.'),
});
export type ExtractTextOutput = z.infer<typeof ExtractTextOutputSchema>;

export async function extractText(input: ExtractTextInput): Promise<ExtractTextOutput> {
  return extractTextFlow(input);
}


// Define a prompt to perform OCR using the Gemini model.
const extractTextPrompt = ai.definePrompt({
    name: 'extractTextPrompt',
    input: { schema: ExtractTextInputSchema },
    output: { schema: ExtractTextOutputSchema },
    prompt: `You are an Optical Character Recognition (OCR) specialist. Your only task is to extract all text from the provided image, exactly as it appears. Do not summarize, interpret, or format the text in any way.

Image: {{media url=photoDataUri}}`
});

const extractTextFlow = ai.defineFlow(
  {
    name: 'extractTextFlow',
    inputSchema: ExtractTextInputSchema,
    outputSchema: ExtractTextOutputSchema,
  },
  async (input: ExtractTextInput) => {
    const { output } = await extractTextPrompt(input);
    return output!;
  }
);
