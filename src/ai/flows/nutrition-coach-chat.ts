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

export async function nutritionCoachChat(input: NutritionCoachChatInput): Promise<NutritionCoachChatOutput> {
  return nutritionCoachChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionCoachChatPrompt',
  input: {schema: NutritionCoachChatInputSchema},
  output: {schema: NutritionCoachChatOutputSchema},
  prompt: `You are NutriVision AI, a friendly and expert AI Nutrition Coach.
Your goal is to provide personalized, helpful, and science-based advice about food, nutrition, and health.
Always respond in a compassionate, encouraging, and easy-to-understand manner.

User's question: {{{this}}}`,
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
      return "I'm sorry, I'm having trouble formulating a response right now. Could you please try rephrasing your question?";
    }
    
    return output.advice;
  }
);
