// src/ai/flows/create-wallet-pass.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v4 as uuidv4 } from 'uuid';

// Make sure to install googleapis: npm install googleapis
import { google } from 'googleapis';

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

// --- CORRECTED SETUP INSTRUCTIONS ---
// 1. Enable the Google Wallet API in your Google Cloud project.
// 2. Create a service account in the Google Cloud Console.
// 3. Download the JSON key file for the service account.
// 4. In the Google Pay & Wallet Console, go to "Users" and invite your
//    service account's email address, granting it "Developer" access.
// 5. Update the keyFile path and issuerId below.
//
const keyFile = 'service-account-key.json'; // IMPORTANT: Update this path
const issuerId = '3388000000022974104'; // IMPORTANT: Update with your Issuer ID from the Wallet Console

const auth = new google.auth.GoogleAuth({
  keyFile,
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
  const { receipt } = input;
  const classId = await createPassClass(receipt);
  const objectId = `${issuerId}.${uuidv4()}`;

  const passObject = {
    id: objectId,
    classId: classId,
    cardTitle: {
      defaultValue: {
        language: 'en',
        value: 'Scanalyze Receipt',
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

  // The service account, authorized as a "Developer" in the Wallet Console,
  // now has the permission to insert objects.
  const { data } = await walletobjects.genericobject.insert({
    requestBody: passObject,
  });

  // The JWT approach is not needed when inserting objects directly via the API.
  // We construct the save URL from the object ID.
  const walletUrl = `https://pay.google.com/gp/v/save/${data.id}`;

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
