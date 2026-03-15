'use server';
/**
 * @fileOverview A Genkit flow for generating recipes based on available ingredients and dietary preferences.
 *
 * - generateRecipeFromIngredients - A function that handles the recipe generation process.
 * - GenerateRecipeFromIngredientsInput - The input type for the generateRecipeFromIngredients function.
 * - GenerateRecipeFromIngredientsOutput - The return type for the generateRecipeFromIngredients function.
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

export async function generateRecipeFromIngredients(
  input: GenerateRecipeFromIngredientsInput
): Promise<GenerateRecipeFromIngredientsOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeFromIngredientsPrompt',
  input: {schema: GenerateRecipeFromIngredientsInputSchema},
  output: {schema: GenerateRecipeFromIngredientsOutputSchema},
  prompt: `You are an expert chef and recipe generator. Your task is to create a delicious and practical recipe based on the ingredients provided by the user and their dietary preferences.

Ingredients available: 
{{#each ingredients}}
- {{{this}}}
{{/each}}

{{#if dietaryPreferences}}
Dietary Preferences/Restrictions: 
{{#each dietaryPreferences}}
- {{{this}}}
{{/each}}
{{/if}}

Based on the above, please generate a complete recipe. Ensure the recipe is well-structured, easy to follow, and uses the available ingredients creatively. If an ingredient is missing but essential, you may suggest a common pantry staple, but prioritize using the provided ingredients.

Provide the following details in your response:
- Recipe Name
- Estimated Prep Time
- Estimated Cook Time
- Number of Servings
- A detailed list of ingredients with quantities
- Step-by-step cooking instructions
- Any optional notes or tips`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFromIngredientsFlow',
    inputSchema: GenerateRecipeFromIngredientsInputSchema,
    outputSchema: GenerateRecipeFromIngredientsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
