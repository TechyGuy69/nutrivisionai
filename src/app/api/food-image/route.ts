
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

  // Fallback image if API key is missing or no result found
  const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(query)}/1000/500`;

  if (!apiKey || apiKey === '') {
    return NextResponse.json({ url: fallbackUrl });
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=1&apiKey=${apiKey}`
    );

    if (!response.ok) {
      console.warn('Spoonacular API request failed with status:', response.status);
      return NextResponse.json({ url: fallbackUrl });
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0 && data.results[0].image) {
      return NextResponse.json({ url: data.results[0].image });
    }

    return NextResponse.json({ url: fallbackUrl });

  } catch (error) {
    console.error('Food image API route error:', error);
    return NextResponse.json({ url: fallbackUrl });
  }
}
