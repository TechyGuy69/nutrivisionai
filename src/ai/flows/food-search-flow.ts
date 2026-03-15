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
  vitamins: z.array(z.string()).describe('List of key vitamins.'),
  minerals: z.array(z.string()).describe('List of key minerals.'),
  ingredients: z.array(z.string()).describe('Probable ingredients or components.'),
  healthBenefits: z.array(z.string()).describe('List of health benefits.'),
  risks: z.array(z.string()).describe('List of potential risks or allergens.'),
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
  prompt: `You are an expert nutritional database. Search for and provide detailed information for food items related to the query: "{{{this}}}".

Requirements:
1. Provide a list of up to 5 relevant matches.
2. For each match, provide accurate estimated nutritional values per 100g.
3. Include vitamins, minerals, and health insights.
4. Support raw foods, ingredients, and complex cooked dishes (global cuisines).
5. Ensure the 'id' is a lowercase, hyphenated version of the name.`,
});

const searchFoodsFlow = ai.defineFlow(
  {
    name: 'searchFoodsFlow',
    inputSchema: z.string(),
    outputSchema: z.array(FoodItemSchema),
  },
  async (query) => {
    try {
      const { output } = await foodSearchPrompt(query);
      return output?.foods || [];
    } catch (error) {
      console.error("Genkit food search prompt error:", error);
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
      const { output } = await ai.generate({
        prompt: `Provide comprehensive nutritional and health data for the specific food item: "${idOrName}".`,
        output: { schema: FoodItemSchema },
      });
      return output || null;
    } catch (error) {
      console.error("Genkit get food details error:", error);
      return null;
    }
  }
);
