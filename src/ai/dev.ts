import { config } from 'dotenv';
config();

import '@/ai/flows/nutrition-coach-chat.ts';
import '@/ai/flows/generate-recipe-from-ingredients.ts';
import '@/ai/flows/identify-food-from-image-flow.ts';
import '@/ai/flows/food-search-flow.ts';
