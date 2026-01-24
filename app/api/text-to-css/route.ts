import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Placeholder for AI CSS generation
    // Replace with actual AI call to generate CSS from prompt
    const generatedCSS = `/* Generated CSS */
.container {
  /* Add your generated CSS here */
}`;

    return NextResponse.json({ css: generatedCSS });
  } catch (error) {
    console.error('Error generating CSS:', error);
    return NextResponse.json({ error: 'Failed to generate CSS' }, { status: 500 });
  }
}
