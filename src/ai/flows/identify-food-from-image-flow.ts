'use server';
/**
 * @fileOverview A flow to identify food from an image and provide nutritional information.
 *
 * - identifyFoodFromImage - A function that handles the food identification process from an image.
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
      .describe('A list of potential health risks or common allergens.'),
  }),
});
export type IdentifyFoodFromImageOutput = z.infer<typeof IdentifyFoodFromImageOutputSchema>;

export type IdentifyResult = {
  data?: IdentifyFoodFromImageOutput;
  error?: string;
};

/**
 * Identifies food from an image and returns nutritional data.
 * Returns a structured object to avoid generic 500 errors in production.
 */
export async function identifyFoodFromImage(
  input: IdentifyFoodFromImageInput
): Promise<IdentifyResult> {
  try {
    const { output } = await ai.generate({
      prompt: [
        { text: 'You are an expert food nutritionist. Analyze the provided image, identify the food, and provide detailed nutritional information.' },
        { media: { url: input.foodImage } }
      ],
      output: { schema: IdentifyFoodFromImageOutputSchema },
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    if (!output) {
      return { error: "The AI was unable to analyze this image. Please try a clearer photo." };
    }

    return { data: output };
  } catch (error: any) {
    console.error("identifyFoodFromImage error:", error);
    const message = error.message || "Unknown analysis error.";
    
    if (message.includes('429') || message.includes('quota')) {
      return { error: "The AI is currently busy. Please wait 60 seconds." };
    }
    
    return { error: `Analysis failed: ${message}. Check your API configuration.` };
  }
}
