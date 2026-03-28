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

// Global caches to reduce AI calls (Server-side, shared within a warm instance)
const searchCache = new Map<string, { data: FoodItemInfo[], timestamp: number }>();
const detailCache = new Map<string, { data: FoodItemInfo, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

/**
 * Searches for food items based on a query.
 * @param query The search query.
 */
export async function searchFoods(query: string): Promise<FoodItemInfo[]> {
  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    const results = await searchFoodsFlow(query);
    if (results && results.length > 0) {
      searchCache.set(cacheKey, { data: results, timestamp: Date.now() });
    }
    return results;
  } catch (error: any) {
    console.error("searchFoods error:", error);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    return [];
  }
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
  prompt: `You are an expert nutritional database engine. 
  
  Search for and provide detailed information for up to 5 food items related to the query: "{{{this}}}".

  IMPORTANT REQUIREMENTS:
  1. Even if the query is a partial match or a complex dish, you MUST return at least one valid food item.
  2. Provide accurate estimated nutritional values per 100g based on standard compositions.
  3. Never return an empty list if there's any possible interpretation of the query as food.
  4. Ensure 'id' is a lowercase, hyphenated string.
  5. Include vitamins, minerals, and category information for all items.`,
});

const searchFoodsFlow = ai.defineFlow(
  {
    name: 'searchFoodsFlow',
    inputSchema: z.string(),
    outputSchema: z.array(FoodItemSchema),
  },
  async (query) => {
    const { output } = await foodSearchPrompt(query);
    if (!output || !output.foods || output.foods.length === 0) {
      return [];
    }
    return output.foods;
  }
);

/**
 * Fetches comprehensive nutritional and health data for a specific food item.
 */
export async function getFoodDetails(idOrName: string): Promise<FoodItemInfo | null> {
  const cacheKey = idOrName.toLowerCase().trim();
  const cached = detailCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    const result = await getFoodDetailsFlow(idOrName);
    if (result) {
      detailCache.set(cacheKey, { data: result, timestamp: Date.now() });
    }
    return result;
  } catch (error: any) {
    console.error("getFoodDetails error:", error);
    // Propagate rate limit error to the UI
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    return null;
  }
}

const getFoodDetailsFlow = ai.defineFlow(
  {
    name: 'getFoodDetailsFlow',
    inputSchema: z.string(),
    outputSchema: FoodItemSchema.nullable(),
  },
  async (idOrName) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a world-class nutritionist. Provide a comprehensive nutritional and health profile for: "${idOrName}". 
      Provide expert-estimated values per 100g if exact lab data is unavailable.`,
      output: { schema: FoodItemSchema },
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      },
    });
    return output || null;
  }
);
