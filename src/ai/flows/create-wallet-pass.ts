// src/ai/flows/create-wallet-pass.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v4 as uuidv4 } from 'uuid';
import { google } from 'googleapis';
// Added imports for JWT creation and file handling
import jws from 'jws';
import fs from 'fs';
import path from 'path';

const CreateWalletPassInputSchema = z.object({
  receipt: z.any().describe('The receipt object'),
});
export type CreateWalletPassInput = z.infer<
  typeof CreateWalletPassInputSchema
>;

const CreateWalletPassOutputSchema = z.object({
  walletUrl: z.string().describe('The Google Wallet URL for the pass.'),
});
export type CreateWalletPassOutput = z.infer<
  typeof CreateWalletPassOutputSchema
>;

// --- UPDATED SETUP INSTRUCTIONS ---
// 1. Enable the Google Wallet API in your Google Cloud project.
// 2. Create a service account in the Google Cloud Console.
// 3. Download the JSON key file for the service account and place it in the
//    root directory of this project as 'service-account-key.json'.
// 4. In the Google Pay & Wallet Console (https://pay.google.com/business/console),
//    go to "Users" and invite your service account's email address,
//    granting it "Developer" access.
// 5. In the Google Pay & Wallet Console, go to "Google Wallet API" and click "Get Started".
//    Make sure your issuer profile is created.
// 6. Update the issuerId below with your Issuer ID from the Wallet Console.

// IMPORTANT: This file must exist in the root of your project. It is gitignored.
const keyFile = 'service-account-key.json';
const keyFilePath = path.resolve(process.cwd(), keyFile);
let key: { client_email: string; private_key: string; };
try {
  key = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
} catch (error) {
    console.error(`Error reading service account key file from ${keyFilePath}. Please ensure it exists and is correctly formatted.`);
    // Let it fail later if the key is needed, to avoid crashing the server on startup
}


const issuerId = '3388000000022974104'; // IMPORTANT: Update with your Issuer ID

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
});

const walletobjects = google.walletobjects({
  version: 'v1',
  auth,
});

async function createPassClass(receipt: any) {
  const classSuffix = `pass_${receipt.category.replace(/\s+/g, '_')}`;
  const classId = `${issuerId}.${classSuffix}`;

  try {
    await walletobjects.genericclass.get({ resourceId: classId });
    console.log(`Class ${classId} already exists.`);
  } catch (error: any) {
    if (error.code === 404) {
      const passClass = {
        id: classId,
        classTemplateInfo: {
          cardTemplateOverride: {
            cardRowTemplateInfos: [
              {
                twoItems: {
                  startItem: {
                    firstValue: {
                      fields: [
                        {
                          fieldPath: "object.textModulesData['description']",
                          defaultValue: {
                            language: 'en-US',
                            value: 'Description',
                          },
                        },
                      ],
                    },
                  },
                  endItem: {
                    firstValue: {
                      fields: [
                        {
                          fieldPath: "object.textModulesData['amount']",
                          defaultValue: {
                            language: 'en-US',
                            value: 'Amount',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      };

      await walletobjects.genericclass.insert({ requestBody: passClass });
      console.log(`Class ${classId} created.`);
    } else {
      throw error;
    }
  }
  return classId;
}

export async function createWalletPass(
  input: CreateWalletPassInput
): Promise<CreateWalletPassOutput> {
  if (!key) {
    throw new Error(`Service account key not found or failed to load from ${keyFile}. Please follow the setup instructions.`);
  }

  const { receipt } = input;
  const classId = await createPassClass(receipt);
  const objectId = `${issuerId}.${uuidv4()}`;

  const passObject = {
    id: objectId,
    classId: classId,
    cardTitle: {
      defaultValue: {
        language: 'en',
        value: 'Scanalyz Receipt',
      },
    },
    header: {
      defaultValue: {
        language: 'en',
        value: `Receipt - ${receipt.category}`,
      },
    },
    heroImage: {
      sourceUri: {
        uri: 'https://placehold.co/1032x336.png',
      },
      contentDescription: {
        defaultValue: {
          language: 'en',
          value: 'Receipt',
        },
      },
    },
    textModulesData: [
      {
        id: 'description',
        header: 'Description',
        body: receipt.text.split('\n').slice(0, 2).join(' / '),
      },
      {
        id: 'amount',
        header: 'Amount',
        body: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: receipt.currency || 'USD',
        }).format(receipt.amount),
      },
    ],
    barcode: {
      type: 'QR_CODE',
      value: objectId,
      alternateText: 'Pass Details',
    },
    hexBackgroundColor: '#4285f4',
  };

  // The 'Save to Google Wallet' button requires a signed JWT.
  // The object is not pre-created via an API call; it's created when the user saves the pass.
  const claims = {
    iss: key.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [], // IMPORTANT: Add your web origins here, e.g., ['https://your-app-domain.com']
    payload: {
      genericObjects: [passObject],
    },
  };

  const token = jws.sign({
    header: { alg: 'RS256', typ: 'JWT' },
    payload: JSON.stringify(claims),
    privateKey: key.private_key,
  });

  const walletUrl = `https://pay.google.com/gp/v/save/${token}`;

  return { walletUrl };
}

const createWalletPassFlow = ai.defineFlow(
  {
    name: 'createWalletPassFlow',
    inputSchema: CreateWalletPassInputSchema,
    outputSchema: CreateWalletPassOutputSchema,
  },
  async (input) => {
    return createWalletPass(input);
  }
);
