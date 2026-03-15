import { NextResponse } from 'next/server';
import { nutritionCoachChat } from '@/ai/flows/nutrition-coach-chat';

/**
 * API Route for the AI Healthy Meal Coach.
 * Handles POST requests containing a user message and returns an AI-generated reply.
 */
export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Call the Genkit-powered nutrition coach flow
    const reply = await nutritionCoachChat(message);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Meal Coach API Error:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json(
        { reply: "The AI coach is currently busy (Rate limit reached). Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { reply: "AI coach is temporarily unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
