'use server';

/**
 * @fileOverview A meal photo analysis AI agent.
 *
 * - analyzeMealPhoto - A function that handles the meal photo analysis process.
 * - AnalyzeMealPhotoInput - The input type for the analyzeMealPhoto function.
 * - AnalyzeMealPhotoOutput - The return type for the analyzeMealPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMealPhotoInput = z.infer<typeof AnalyzeMealPhotoInputSchema>;

const AnalyzeMealPhotoOutputSchema = z.object({
  calories: z.number().describe('Estimated calorie content of the meal.'),
  protein: z.number().describe('Estimated protein content of the meal (in grams).'),
  carbohydrates: z.number().describe('Estimated carbohydrate content of the meal (in grams).'),
  fat: z.number().describe('Estimated fat content of the meal (in grams).'),
  ingredients: z.array(z.string()).describe('List of identified ingredients in the meal.'),
});
export type AnalyzeMealPhotoOutput = z.infer<typeof AnalyzeMealPhotoOutputSchema>;

export async function analyzeMealPhoto(input: AnalyzeMealPhotoInput): Promise<AnalyzeMealPhotoOutput> {
  return analyzeMealPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMealPhotoPrompt',
  input: {schema: AnalyzeMealPhotoInputSchema},
  output: {schema: AnalyzeMealPhotoOutputSchema},
  prompt: `You are a nutrition expert analyzing a photo of a meal to estimate its nutritional content.

  Analyze the provided photo of the meal and estimate the following:

  - Calorie content (in calories)
  - Protein content (in grams)
  - Carbohydrate content (in grams)
  - Fat content (in grams)
  - List of ingredients

  Photo: {{media url=photoDataUri}}

  Provide the output in JSON format.
`,
});

const analyzeMealPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeMealPhotoFlow',
    inputSchema: AnalyzeMealPhotoInputSchema,
    outputSchema: AnalyzeMealPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
