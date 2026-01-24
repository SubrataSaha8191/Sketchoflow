import { NextResponse } from 'next/server';

export const runtime = "nodejs";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      firebaseToken,
      num_frames = 16,
      num_inference_steps = 30,
      guidance_scale = 9,
      fps = 20,
    } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    if (!firebaseToken) {
      return NextResponse.json({ success: false, error: "Firebase token is required" }, { status: 401 });
    }

    // Forward request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/generate-gif`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`,
      },
      body: JSON.stringify({
        prompt,
        num_frames,
        num_inference_steps,
        guidance_scale,
        fps,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.detail || "Failed to generate GIF"
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      url: data.gif_url,
      video_id: data.video_id,
    });

  } catch (error: any) {
    console.error("Text-to-GIF API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate GIF"
    }, { status: 500 });
  }
}
