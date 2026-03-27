'use server';
/**
 * @fileOverview A Genkit flow for generating recipes based on available ingredients and dietary preferences.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeFromIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients the user currently has.'),
  dietaryPreferences: z
    .array(z.string())
    .optional()
    .describe('Optional dietary preferences or restrictions (e.g., "vegetarian", "gluten-free", "low-carb").'),
});
export type GenerateRecipeFromIngredientsInput = z.infer<typeof GenerateRecipeFromIngredientsInputSchema>;

const GenerateRecipeFromIngredientsOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  prepTime: z.string().describe('Estimated preparation time for the recipe.'),
  cookTime: z.string().describe('Estimated cooking time for the recipe.'),
  servings: z.string().describe('Number of servings the recipe yields.'),
  ingredientsList: z
    .array(z.string())
    .describe('A list of ingredients required for the recipe, including quantities.'),
  instructions: z
    .array(z.string())
    .describe('Step-by-step cooking instructions.'),
  notes: z
    .array(z.string())
    .optional()
    .describe('Any additional notes or tips for the recipe.'),
});
export type GenerateRecipeFromIngredientsOutput = z.infer<typeof GenerateRecipeFromIngredientsOutputSchema>;

export type RecipeResult = {
  data?: GenerateRecipeFromIngredientsOutput;
  error?: string;
};

export async function generateRecipeFromIngredients(
  input: GenerateRecipeFromIngredientsInput
): Promise<RecipeResult> {
  try {
    const { output } = await ai.generate({
      prompt: `You are an expert chef. Create a delicious recipe using: ${input.ingredients.join(', ')}. 
      Preferences: ${input.dietaryPreferences?.join(', ') || 'None'}.`,
      output: { schema: GenerateRecipeFromIngredientsOutputSchema },
    });

    if (!output) {
      return { error: "The AI Chef couldn't formulate a recipe. Try different ingredients." };
    }

    return { data: output };
  } catch (error: any) {
    console.error("Recipe generation flow error:", error);
    return { error: "Failed to generate recipe. Please ensure your GEMINI_API_KEY is active." };
  }
}
