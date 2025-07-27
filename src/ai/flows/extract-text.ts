
'use server';
/**
 * @fileOverview A text extraction AI agent that uses Google Cloud Vision API.
 *
 * - extractText - A function that handles the text extraction process from an image.
 * - ExtractTextInput - The input type for the extractText function.
 * - ExtractTextOutput - The return type for the extractText function.
 */
import {ImageAnnotatorClient} from '@google-cloud/vision';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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

const extractTextFlow = ai.defineFlow(
  {
    name: 'extractTextFlow',
    inputSchema: ExtractTextInputSchema,
    outputSchema: ExtractTextOutputSchema,
  },
  async (input: ExtractTextInput) => {
    try {
      // Create a client
      const client = new ImageAnnotatorClient();

      // Convert data URI to a buffer
      const base64Data = input.photoDataUri.split(',')[1];
      
      const imageRequest = {
        image: {
          content: base64Data,
        },
      };

      // Performs text detection on the image file
      const [result] = await client.textDetection(imageRequest);
      const detections = result.textAnnotations;
      
      if (detections && detections.length > 0 && detections[0].description) {
        return {
          extractedText: detections[0].description,
        };
      } else {
        return {
            extractedText: ""
        }
      }

    } catch (error) {
      console.error('GOOGLE_CLOUD_VISION_ERROR:', error);
      throw new Error('Failed to process image with Cloud Vision API.');
    }
  }
);
