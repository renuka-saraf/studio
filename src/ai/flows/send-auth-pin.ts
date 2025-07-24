
'use server';
/**
 * @fileOverview An AI agent that handles sending a simulated authentication PIN.
 *
 * - sendAuthPin - A function that simulates generating and sending a PIN.
 * - SendAuthPinInput - The input type for the sendAuthPin function.
 * - SendAuthPinOutput - The return type for the sendAuthPin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendAuthPinInputSchema = z.object({
  email: z.string().email().describe('The email address to send the PIN to.'),
});
export type SendAuthPinInput = z.infer<typeof SendAuthPinInputSchema>;

const SendAuthPinOutputSchema = z.object({
    success: z.boolean().describe('Whether the PIN was sent successfully.'),
    pincode: z.string().describe('The generated PIN code. In a real app, this would not be returned.'),
});
export type SendAuthPinOutput = z.infer<typeof SendAuthPinOutputSchema>;

export async function sendAuthPin(input: SendAuthPinInput): Promise<SendAuthPinOutput> {
  return sendAuthPinFlow(input);
}

const sendAuthPinFlow = ai.defineFlow(
  {
    name: 'sendAuthPinFlow',
    inputSchema: SendAuthPinInputSchema,
    outputSchema: SendAuthPinOutputSchema,
  },
  async (input) => {
    // In a real application, you would integrate with an email service provider (e.g., SendGrid, Mailgun) here.
    // 1. Generate a secure random 6-digit PIN.
    const pincode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Store the PIN and email (e.g., in a database like Firestore) with an expiration time.
    //    For this prototype, we will return the PIN directly to the client to simulate the process.
    console.log(`Generated PIN ${pincode} for ${input.email}.`);
    console.log(`In a real app, you would now send an email to ${input.email} with this PIN.`);
    
    // 3. Use the email service's API to send the email.
    //    Example: await sendEmail({ to: input.email, subject: 'Your PIN Code', body: `Your PIN is ${pincode}` });

    // For this simulation, we'll just return success and the PIN.
    return {
        success: true,
        pincode: pincode,
    };
  }
);
