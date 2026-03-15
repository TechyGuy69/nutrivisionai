import { NextResponse } from 'next/server';

/**
 * API Route to fetch a relevant food image from Spoonacular.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // Fallback image using a generic high-quality food placeholder
  const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(query)}-food/1000/500`;

  if (!apiKey || apiKey === '') {
    console.warn('Spoonacular API key is missing. Using fallback placeholder.');
    return NextResponse.json({ url: fallbackUrl });
  }

  try {
    // Search for recipes to get a relevant image
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=1&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.error('Spoonacular API request failed:', response.status);
      return NextResponse.json({ url: fallbackUrl });
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0 && data.results[0].image) {
      // Use the actual food image from Spoonacular
      return NextResponse.json({ url: data.results[0].image });
    }

    // If no results, try searching for food ingredients specifically
    const ingredientResponse = await fetch(
      `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(query)}&number=1&apiKey=${apiKey}`
    );

    if (ingredientResponse.ok) {
      const ingData = await ingredientResponse.json();
      if (ingData.results && ingData.results.length > 0 && ingData.results[0].image) {
        // Spoonacular ingredient images follow a specific pattern
        const ingImageUrl = `https://spoonacular.com/cdn/ingredients_500x500/${ingData.results[0].image}`;
        return NextResponse.json({ url: ingImageUrl });
      }
    }

    return NextResponse.json({ url: fallbackUrl });

  } catch (error) {
    console.error('Food image API route error:', error);
    return NextResponse.json({ url: fallbackUrl });
  }
}
