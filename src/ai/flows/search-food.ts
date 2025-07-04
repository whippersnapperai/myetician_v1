'use server';

/**
 * @fileOverview An AI agent that searches for food items and their nutritional information.
 *
 * - searchFood - A function that searches for food items.
 * - SearchFoodInput - The input type for the searchFood function.
 * - SearchFoodOutput - The return type for the searchFood function.
 * - FoodItem - The type for a single food item result.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodItemSchema = z.object({
  name: z.string().describe('The name of the food item, including preparation if relevant (e.g., "Chicken Breast, Grilled").'),
  calories: z.number().describe('The estimated number of calories for the given serving size.'),
  protein: z.number().describe('The estimated amount of protein in grams for the given serving size.'),
  carbohydrates: z.number().describe('The estimated amount of carbohydrates in grams for the given serving size.'),
  fat: z.number().describe('The estimated amount of fat in grams for the given serving size.'),
  servingSize: z.string().describe('A common serving size for this food item, e.g., "100g", "1 cup", "1 medium".'),
});
export type FoodItem = z.infer<typeof FoodItemSchema>;

const SearchFoodInputSchema = z.object({
  query: z.string().describe('The food item to search for.'),
});
export type SearchFoodInput = z.infer<typeof SearchFoodInputSchema>;

const SearchFoodOutputSchema = z.object({
  results: z.array(FoodItemSchema).describe('A list of up to 5 matching food items with their nutritional information.'),
});
export type SearchFoodOutput = z.infer<typeof SearchFoodOutputSchema>;

export async function searchFood(input: SearchFoodInput): Promise<SearchFoodOutput> {
  return searchFoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchFoodPrompt',
  input: {schema: SearchFoodInputSchema},
  output: {schema: SearchFoodOutputSchema},
  prompt: `You are a comprehensive food and nutrition database API.
  Based on the user's query, find up to 5 matching food items.
  For each item, provide a common name, a standard serving size, and estimated nutritional information (calories, protein, carbohydrates, fat).
  
  Query: {{{query}}}
  
  Return the results in the specified JSON format. If no matches are found, return an empty array for "results".`,
});

const searchFoodFlow = ai.defineFlow(
  {
    name: 'searchFoodFlow',
    inputSchema: SearchFoodInputSchema,
    outputSchema: SearchFoodOutputSchema,
  },
  async (input) => {
    if (!input.query || input.query.length < 2) return { results: [] };
    const {output} = await prompt(input);
    return output || { results: [] };
  }
);
