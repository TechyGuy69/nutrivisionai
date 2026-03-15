'use server';
/**
 * @fileOverview An AI nutrition coach that provides personalized advice based on user questions.
 *
 * - nutritionCoachChat - A function that handles the AI nutrition coaching process.
 * - NutritionCoachChatInput - The input type for the nutritionCoachChat function.
 * - NutritionCoachChatOutput - The return type for the nutritionCoachChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NutritionCoachChatInputSchema = z.object({
  message: z.string().describe('The user\'s question about food, nutrition, or health.'),
});
export type NutritionCoachChatInput = z.infer<typeof NutritionCoachChatInputSchema>;

const NutritionCoachChatOutputSchema = z.object({
  reply: z.string().describe('The personalized advice or answer from the AI nutrition coach.'),
});

/**
 * Handles the AI nutrition coaching process.
 * Acts as a nutrition assistant to answer questions, explain values, and suggest alternatives.
 */
export async function nutritionCoachChat(userMessage: string): Promise<string> {
  try {
    return await nutritionCoachChatFlow({ message: userMessage });
  } catch (error: any) {
    console.error("nutritionCoachChat error:", error);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    throw new Error("Failed to get response from AI coach.");
  }
}

const coachPrompt = ai.definePrompt({
  name: 'nutritionCoachChatPrompt',
  input: { schema: NutritionCoachChatInputSchema },
  output: { schema: NutritionCoachChatOutputSchema },
  system: `You are a helpful nutrition and food assistant. 
  Answer the following user question about food, nutrition, or cooking in a clear and helpful way.
  
  Your capabilities:
  - Answer any food or nutrition related questions accurately.
  - Explain complex nutritional values in simple terms.
  - Suggest healthier alternatives for processed foods.
  - Recommend creative cooking ideas and recipes.
  - Provide actionable diet tips based on user goals.
  
  Tone: Friendly, encouraging, professional, and clear.
  Always emphasize that users should consult medical professionals for specific health conditions.`,
  prompt: `User question: "{{{message}}}"`,
});

const nutritionCoachChatFlow = ai.defineFlow(
  {
    name: 'nutritionCoachChatFlow',
    inputSchema: NutritionCoachChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await coachPrompt(input);
    
    if (!output || !output.reply) {
      throw new Error("The AI coach was unable to formulate a clear response. Please try rephrasing your question.");
    }
    
    return output.reply;
  }
);
