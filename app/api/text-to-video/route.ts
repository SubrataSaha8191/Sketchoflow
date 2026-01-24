import { NextResponse } from 'next/server';

export const runtime = "nodejs";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      firebaseToken,
      frames_per_clip = 16,
      num_clips = 5,
      num_inference_steps = 30,
      guidance_scale = 9,
      fps = 8,
    } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    if (!firebaseToken) {
      return NextResponse.json({ success: false, error: "Firebase token is required" }, { status: 401 });
    }

    // Forward request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`,
      },
      body: JSON.stringify({
        prompt,
        frames_per_clip,
        num_clips,
        num_inference_steps,
        guidance_scale,
        fps,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.detail || "Failed to generate video"
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      url: data.video_url,
      video_id: data.video_id,
      total_frames: data.total_frames,
    });

  } catch (error: any) {
    console.error("Text-to-Video API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate video"
    }, { status: 500 });
  }
}
