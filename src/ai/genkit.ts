import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Initializes Genkit with the Google AI plugin.
 * Uses the latest Gemini 2.0 Flash model.
 * 
 * IMPORTANT: 'gemini-2.5-flash' is not currently a valid API identifier for the 
 * Google AI SDK. We have updated it to 'gemini-2.0-flash' which is the 
 * latest available Flash model.
 */
export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY
    })
  ],
  model: 'googleai/gemini-2.0-flash',
});
