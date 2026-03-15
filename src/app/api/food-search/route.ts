import { NextResponse } from 'next/server';
import { searchFoods, type FoodItemInfo } from '@/ai/flows/food-search-flow';

/**
 * Mapping of USDA Nutrient IDs to our internal fields.
 * Ref: https://fdc.nal.usda.gov/download-datasets.html
 */
const NUTRIENT_MAP: Record<number, keyof FoodItemInfo> = {
  1008: 'calories',     // Energy
  1003: 'protein',      // Protein
  1005: 'carbohydrates',// Carbohydrate, by difference
  1004: 'fat',          // Total lipid (fat)
  2000: 'sugar',        // Sugars, total including NLEA
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const usdaApiKey = process.env.USDA_API_KEY;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    // 1. Try USDA FoodData Central API if key is available
    if (usdaApiKey) {
      try {
        const usdaResponse = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${usdaApiKey}`
        );

        if (usdaResponse.ok) {
          const usdaData = await usdaResponse.json();
          
          if (usdaData.foods && usdaData.foods.length > 0) {
            const mappedResults: FoodItemInfo[] = usdaData.foods.map((food: any) => {
              const info: any = {
                id: food.fdcId?.toString() || food.description.toLowerCase().replace(/\s+/g, '-'),
                name: food.description,
                calories: 0,
                protein: 0,
                carbohydrates: 0,
                fat: 0,
                sugar: 0,
                vitamins: [],
                minerals: [],
                ingredients: food.foodComponents || [],
                healthBenefits: ["High quality USDA verified data"],
                risks: [],
                category: food.foodCategory || "General Food",
              };

              // Map nutrients
              if (food.foodNutrients) {
                food.foodNutrients.forEach((n: any) => {
                  const field = NUTRIENT_MAP[n.nutrientId];
                  if (field) {
                    info[field] = n.value;
                  }
                });
              }

              return info as FoodItemInfo;
            });

            return NextResponse.json(mappedResults);
          }
        }
      } catch (usdaError) {
        console.error('USDA API Error:', usdaError);
        // Fallback to AI if USDA fails
      }
    }

    // 2. Fallback to Gemini AI (Genkit Flow)
    const results = await searchFoods(query);
    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Food search API route caught error:', error);
    
    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      return NextResponse.json({ 
        error: 'Rate Limit Exceeded',
        message: 'The AI service is temporarily busy. Please wait about 60 seconds and try again.' 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch food data',
      message: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 });
  }
}
