'use server';
/**
 * @fileOverview A flow to identify food from an image and provide nutritional information.
 * Uses Gemini 2.5 Flash for high-speed visual analysis.
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
 * Identifies food from an image using Gemini 2.5 Flash.
 */
export async function identifyFoodFromImage(
  input: IdentifyFoodFromImageInput
): Promise<IdentifyResult> {
  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { text: 'You are an expert food nutritionist. Analyze the provided image, identify the food, and provide detailed nutritional information. If you cannot identify the food, explain why.' },
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
      return { error: "Gemini 2.5 Flash was unable to generate a response for this image." };
    }

    return { data: output };
  } catch (error: any) {
    console.error("Gemini 2.5 Flash Vision Error:", error);
    const message = error.message || "Unknown analysis error.";
    
    if (message.includes('403')) {
      return { error: "API Key Leaked: Please generate a NEW API key in Google AI Studio and update your environment variables." };
    }
    
    if (message.includes('429')) {
      return { error: "Rate limit reached. Please wait a moment." };
    }
    
    return { error: `Gemini 2.5 Flash Analysis failed: ${message}` };
  }
}
