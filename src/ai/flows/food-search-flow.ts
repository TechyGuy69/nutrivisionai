'use server';
/**
 * @fileOverview A flow to search for food items and provide structured nutritional data.
 *
 * - searchFoods - A function that handles searching for food items via AI.
 * - FoodItemInfo - The structured data for a single food item.
 * - getFoodDetails - A function that handles fetching detailed information for a specific food item.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FoodItemSchema = z.object({
  id: z.string().describe('A URL-safe slug or identifier for the food item.'),
  name: z.string().describe('Common name of the food item.'),
  calories: z.coerce.number().describe('Calories per 100g or serving.'),
  protein: z.coerce.number().describe('Protein in grams.'),
  carbohydrates: z.coerce.number().describe('Total carbohydrates in grams.'),
  fat: z.coerce.number().describe('Total fat in grams.'),
  sugar: z.coerce.number().describe('Sugar content in grams.'),
  vitamins: z.array(z.string()).optional().default([]).describe('List of key vitamins.'),
  minerals: z.array(z.string()).optional().default([]).describe('List of key minerals.'),
  ingredients: z.array(z.string()).optional().default([]).describe('Probable ingredients or components.'),
  healthBenefits: z.array(z.string()).optional().default([]).describe('List of health benefits.'),
  risks: z.array(z.string()).optional().default([]).describe('List of potential risks or allergens.'),
  category: z.string().describe('General category (e.g., Fruit, Meat, Cooked Dish).'),
});

export type FoodItemInfo = z.infer<typeof FoodItemSchema>;

const FoodSearchOutputSchema = z.object({
  foods: z.array(FoodItemSchema).describe('A list of matching food items.')
});

/**
 * Searches for food items based on a query.
 * @param query The search query.
 * @returns A promise that resolves to an array of food items.
 */
export async function searchFoods(query: string): Promise<FoodItemInfo[]> {
  return searchFoodsFlow(query);
}

const foodSearchPrompt = ai.definePrompt({
  name: 'foodSearchPrompt',
  input: { schema: z.string() },
  output: { schema: FoodSearchOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert nutritional database engine. Search for and provide detailed information for food items related to the query: "{{{this}}}".

Requirements:
1. Provide a list of up to 5 relevant matches.
2. For each match, provide accurate estimated nutritional values per 100g.
3. If exact data is unavailable, use your expert knowledge to provide your best professional estimate. NEVER say "data unavailable".
4. Include vitamins, minerals, and health insights.
5. Support raw ingredients, prepared snacks, and complex global cooked dishes.
6. Ensure the 'id' is a lowercase, hyphenated version of the name.`,
});

const searchFoodsFlow = ai.defineFlow(
  {
    name: 'searchFoodsFlow',
    inputSchema: z.string(),
    outputSchema: z.array(FoodItemSchema),
  },
  async (query) => {
    try {
      console.log(`Starting food search for: ${query}`);
      const { output } = await foodSearchPrompt(query);
      if (!output || !output.foods) {
        console.warn("Genkit food search returned no output.");
        return [];
      }
      return output.foods;
    } catch (error: any) {
      console.error("Genkit food search error:", error);
      // Log more specific error info if available (e.g. auth errors)
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('403')) {
        console.error("CRITICAL: Gemini API Key appears to be invalid or lacks permissions.");
      }
      return [];
    }
  }
);

/**
 * Fetches comprehensive nutritional and health data for a specific food item.
 * @param idOrName The ID or name of the food item.
 * @returns A promise that resolves to the food item details, or null if not found.
 */
export async function getFoodDetails(idOrName: string): Promise<FoodItemInfo | null> {
  return getFoodDetailsFlow(idOrName);
}

const getFoodDetailsFlow = ai.defineFlow(
  {
    name: 'getFoodDetailsFlow',
    inputSchema: z.string(),
    outputSchema: FoodItemSchema.nullable(),
  },
  async (idOrName) => {
    try {
      console.log(`Fetching detailed food info for: ${idOrName}`);
      const { output } = await ai.generate({
        prompt: `You are an expert nutritionist. Provide comprehensive, expert-verified nutritional and health data for the specific food item: "${idOrName}".
        If this is a complex dish or branded item with unknown exact data, provide your best professional estimate for its nutritional profile per 100g based on standard ingredients.`,
        output: { schema: FoodItemSchema },
        config: {
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        },
      });
      return output || null;
    } catch (error: any) {
      console.error("Genkit get food details error:", error);
      if (error.message?.includes('API_KEY_INVALID')) {
        console.error("CRITICAL: Gemini API Key appears to be invalid.");
      }
      return null;
    }
  }
);
