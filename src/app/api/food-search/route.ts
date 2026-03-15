import { NextResponse } from 'next/server';
import { searchFoods } from '@/ai/flows/food-search-flow';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results = await searchFoods(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Food search API error:', error);
    return NextResponse.json({ error: 'Failed to fetch food data' }, { status: 500 });
  }
}
