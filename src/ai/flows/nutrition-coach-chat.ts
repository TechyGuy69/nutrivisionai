'use server';
/**
 * @fileOverview An AI nutrition coach that provides personalized advice based on user questions.
 *
 * - nutritionCoachChat - A function that handles the AI nutrition coaching process.
 * - NutritionCoachChatInput - The input type for the nutritionCoachChat function.
 * - NutritionCoachChatOutput - The return type for the nutritionCoachChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionCoachChatInputSchema = z
  .string()
  .describe('The user\'s question about food, nutrition, or health.');
export type NutritionCoachChatInput = z.infer<typeof NutritionCoachChatInputSchema>;

const NutritionCoachChatOutputSchema = z.object({
  advice: z.string().describe('The personalized advice from the AI nutrition coach.')
});
export type NutritionCoachChatOutput = string;

/**
 * Handles the AI nutrition coaching process.
 * Acts as a nutrition assistant to answer questions, explain values, and suggest alternatives.
 */
export async function nutritionCoachChat(input: NutritionCoachChatInput): Promise<NutritionCoachChatOutput> {
  try {
    return await nutritionCoachChatFlow(input);
  } catch (error: any) {
    console.error("nutritionCoachChat error:", error);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    throw new Error("Failed to get response from AI coach.");
  }
}

const prompt = ai.definePrompt({
  name: 'nutritionCoachChatPrompt',
  input: {schema: NutritionCoachChatInputSchema},
  output: {schema: NutritionCoachChatOutputSchema},
  system: `You are NutriVision AI, a world-class nutrition assistant and expert coach. 
  Your goal is to provide science-based, helpful, and compassionate advice.
  
  Responsibilities:
  1. Answer any food or nutrition related questions accurately.
  2. Explain complex nutritional values in simple terms.
  3. Suggest healthier alternatives for processed foods.
  4. Recommend creative cooking ideas and recipes.
  5. Provide actionable diet tips based on user goals.
  
  Tone: Friendly, encouraging, professional, and clear.
  Always emphasize that users should consult medical professionals for specific health conditions.`,
  prompt: `User's question or topic: "{{{this}}}"`,
});

const nutritionCoachChatFlow = ai.defineFlow(
  {
    name: 'nutritionCoachChatFlow',
    inputSchema: NutritionCoachChatInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output || !output.advice) {
      return "I'm sorry, I'm having trouble formulating a nutrition tip right now. Could you please try rephrasing your question?";
    }
    
    return output.advice;
  }
);
