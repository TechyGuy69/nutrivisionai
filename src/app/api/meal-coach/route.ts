import { NextResponse } from 'next/server';
import { nutritionCoachChat } from '@/ai/flows/nutrition-coach-chat';

export const dynamic = 'force-dynamic';

/**
 * API Route for the AI Healthy Meal Coach.
 * Handles POST requests containing a user message and returns an AI-generated reply.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'A valid message string is required' }, { status: 400 });
    }

    // Call the Genkit-powered nutrition coach flow
    const reply = await nutritionCoachChat(message);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Meal Coach API Error:', error);

    // Provide a more user-friendly message for rate limits (429)
    if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json(
        { reply: "I'm currently assisting many users. Please wait about 60 seconds before your next question so I can give you my full attention!" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { reply: "I'm temporarily unavailable. Please try again in a few moments." },
      { status: 500 }
    );
  }
}
