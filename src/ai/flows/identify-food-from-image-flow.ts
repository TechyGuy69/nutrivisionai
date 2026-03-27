'use server';
/**
 * @fileOverview A flow to identify food from an image and provide nutritional information.
 *
 * - identifyFoodFromImage - A function that handles the food identification process from an image.
 * - IdentifyFoodFromImageInput - The input type for the identifyFoodFromImage function.
 * - IdentifyFoodFromImageOutput - The return type for the identifyFoodFromImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyFoodFromImageInputSchema = z.object({
  foodImage: z
    .string()
    .describe(
      "A picture of food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyFoodFromImageInput = z.infer<typeof IdentifyFoodFromImageInputSchema>;

const IdentifyFoodFromImageOutputSchema = z.object({
  identification: z.string().describe('The identified food item.'),
  nutritionalInfo: z.object({
    calories: z.coerce.number().describe('Total calories in kcal.'),
    protein: z.coerce.number().describe('Protein content in grams.'),
    carbohydrates: z.coerce.number().describe('Carbohydrate content in grams.'),
    fat: z.coerce.number().describe('Total fat content in grams.'),
    sugar: z.coerce.number().describe('Sugar content in grams.'),
    vitamins: z
      .array(z.string())
      .describe('A list of key vitamins present.'),
    minerals: z
      .array(z.string())
      .describe('A list of key minerals present.'),
    ingredients: z
      .array(z.string())
      .describe('A list of likely ingredients.'),
    healthBenefits: z
      .array(z.string())
      .describe('A list of health benefits associated with the food.'),
    risks: z
      .array(z.string())
      .describe('A list of potential health risks or allergens.'),
  }),
});
export type IdentifyFoodFromImageOutput = z.infer<typeof IdentifyFoodFromImageOutputSchema>;

/**
 * Identifies food from an image and returns nutritional data.
 * Includes detailed error handling to surface API issues or safety blocks.
 */
export async function identifyFoodFromImage(
  input: IdentifyFoodFromImageInput
): Promise<IdentifyFoodFromImageOutput> {
  try {
    return await identifyFoodFromImageFlow(input);
  } catch (error: any) {
    console.error("identifyFoodFromImage wrapper error:", error);
    
    const message = error.message || "Unknown error occurred during vision analysis.";
    
    if (message.includes('429') || message.includes('quota')) {
      throw new Error("The Vision AI is currently busy (Rate limit reached). Please wait a moment and try again.");
    }
    
    if (message.includes('413')) {
      throw new Error("The image file is too large. Please try a smaller photo.");
    }

    if (message.includes('SAFETY')) {
      throw new Error("The image was flagged by safety filters. Please try a clearer photo of food.");
    }

    // Pass through the original error message to help with debugging production configuration
    throw new Error(`AI Analysis Error: ${message}`);
  }
}

const identifyFoodFromImagePrompt = ai.definePrompt({
  name: 'identifyFoodFromImagePrompt',
  input: { schema: IdentifyFoodFromImageInputSchema },
  output: { schema: IdentifyFoodFromImageOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert food nutritionist. Your task is to analyze the provided image of food, identify the food item, and extract detailed nutritional information.

Image: {{media url=foodImage}}

Based on the image, please provide:
- The identified food item (e.g., "Apple", "Chicken Salad", "Pizza Slice").
- Detailed nutritional information including calories, protein, carbohydrates, fat, and sugar.
- A list of key vitamins and minerals likely present.
- A list of probable ingredients.
- A list of associated health benefits.
- A list of potential health risks or common allergens.

Provide the output in a structured JSON format matching the schema provided.`,
});

const identifyFoodFromImageFlow = ai.defineFlow(
  {
    name: 'identifyFoodFromImageFlow',
    inputSchema: IdentifyFoodFromImageInputSchema,
    outputSchema: IdentifyFoodFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await identifyFoodFromImagePrompt(input);
    if (!output) {
      throw new Error("The AI was unable to generate a response for this image.");
    }
    return output;
  }
);