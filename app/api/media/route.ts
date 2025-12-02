import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// Configure fal client with Runway API key
fal.config({
  credentials: process.env.RUNWAY_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prompt, duration = 4, aspectRatio = "16:9" } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    if (type === "gif") {
      // Use fal.ai for GIF generation (AnimateDiff or similar)
      const result = await fal.subscribe("fal-ai/fast-animatediff/text-to-video", {
        input: {
          prompt: prompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy",
          num_frames: 16,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          fps: 8,
          video_size: aspectRatio === "16:9" ? "landscape_16_9" : aspectRatio === "9:16" ? "portrait_16_9" : "square",
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("GIF generation in progress...");
          }
        },
      });

      return NextResponse.json({
        success: true,
        type: "gif",
        url: result.data?.video?.url,
        prompt,
        duration,
      });

    } else if (type === "video") {
      // Use fal.ai Runway Gen-3 for video generation
      const result = await fal.subscribe("fal-ai/runway-gen3/turbo/text-to-video", {
        input: {
          prompt: prompt,
          duration: duration <= 5 ? "5" : "10",
          aspect_ratio: aspectRatio,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Video generation in progress...");
          }
        },
      });

      return NextResponse.json({
        success: true,
        type: "video",
        url: result.data?.video?.url,
        prompt,
        duration,
      });

    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type. Use 'gif' or 'video'" },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("Media Generation Error:", error);
    
    // Handle specific fal.ai errors
    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      return NextResponse.json(
        { success: false, error: "API rate limit reached. Please try again later." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate media" },
      { status: 500 }
    );
  }
}
