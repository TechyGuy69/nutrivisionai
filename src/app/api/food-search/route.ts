
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
    // If results is an empty array, it might be due to a silent error in the flow
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Food search API route caught error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch food data',
      message: error.message 
    }, { status: 500 });
  }
}
