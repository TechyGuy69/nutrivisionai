
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
