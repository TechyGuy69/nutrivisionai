import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Initializes Genkit with the Google AI plugin.
 * Uses the requested Gemini 2.5 Flash model.
 */
export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
