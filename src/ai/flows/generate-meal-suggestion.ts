'use server';

/**
 * @fileOverview An AI agent that suggests food items and portion sizes based on a user's past logged meals and dietary preferences.
 *
 * - generateMealSuggestion - A function that generates meal suggestions.
 * - GenerateMealSuggestionInput - The input type for the generateMealSuggestion function.
 * - GenerateMealSuggestionOutput - The return type for the generateMealSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMealSuggestionInputSchema = z.object({
  pastMeals: z
    .string()
    .describe("A stringified JSON array of the user's past meals, including food items and portion sizes."),
  dietaryPreferences: z
    .string()
    .describe('A description of the user\u2019s dietary preferences and restrictions.'),
});
export type GenerateMealSuggestionInput = z.infer<typeof GenerateMealSuggestionInputSchema>;

const GenerateMealSuggestionOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A stringified JSON array of suggested food items and portion sizes.'),
});
export type GenerateMealSuggestionOutput = z.infer<typeof GenerateMealSuggestionOutputSchema>;

export async function generateMealSuggestion(input: GenerateMealSuggestionInput): Promise<GenerateMealSuggestionOutput> {
  return generateMealSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealSuggestionPrompt',
  input: {schema: GenerateMealSuggestionInputSchema},
  output: {schema: GenerateMealSuggestionOutputSchema},
  prompt: `You are a helpful AI assistant that suggests food items and portion sizes to a user based on their past meals and dietary preferences.

The user has provided the following information:

Past Meals: {{{pastMeals}}}
Dietary Preferences: {{{dietaryPreferences}}}

Based on this information, suggest some food items and portion sizes that the user might want to eat. Return the suggestions as a JSON array.
`,
});

const generateMealSuggestionFlow = ai.defineFlow(
  {
    name: 'generateMealSuggestionFlow',
    inputSchema: GenerateMealSuggestionInputSchema,
    outputSchema: GenerateMealSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
