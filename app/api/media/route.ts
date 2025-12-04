import { NextRequest, NextResponse } from "next/server";

// Runway API base URL - using the dev API for newer key format
const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";

// Helper function to poll for task completion
async function pollTaskStatus(taskId: string, apiKey: string, maxAttempts = 120): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to check task status");
    }

    const task = await response.json();

    if (task.status === "SUCCEEDED") {
      return task;
    } else if (task.status === "FAILED") {
      throw new Error(task.failure || task.failureCode || "Task failed");
    } else if (task.status === "CANCELLED") {
      throw new Error("Task was cancelled");
    }

    // Wait 3 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error("Task timed out - video generation is taking longer than expected");
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RUNWAY_API_KEY;

    // Check if API key is configured
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Runway API key not configured. Please add RUNWAY_API_KEY to your environment variables." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, prompt, duration = 5, aspectRatio = "16:9" } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Map aspect ratio to Runway format
    const runwayAspectRatio = aspectRatio === "16:9" ? "16:9" : 
                              aspectRatio === "9:16" ? "9:16" : "16:9";

    // Map duration to Runway supported values (5 or 10 seconds)
    const runwayDuration = duration <= 5 ? 5 : 10;

    if (type === "gif" || type === "video") {
      // Use Runway Gen-3 Alpha Turbo for video generation
      // Note: image_to_video requires an image, but we can use a placeholder or generate one
      const createResponse = await fetch(`${RUNWAY_API_BASE}/image_to_video`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify({
          model: "gen3a_turbo",
          promptText: prompt,
          duration: runwayDuration,
          ratio: runwayAspectRatio,
          watermark: false,
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        
        if (createResponse.status === 401) {
          return NextResponse.json(
            { success: false, error: "Unauthorized: Invalid Runway API key. Please check your RUNWAY_API_KEY." },
            { status: 401 }
          );
        }
        
        if (createResponse.status === 429) {
          return NextResponse.json(
            { success: false, error: "Rate limit reached. Please try again later." },
            { status: 429 }
          );
        }

        throw new Error(error.message || error.error || "Failed to create video task");
      }

      const createResult = await createResponse.json();
      const taskId = createResult.id;

      if (!taskId) {
        throw new Error("No task ID returned from Runway API");
      }

      // Poll for completion
      const completedTask = await pollTaskStatus(taskId, apiKey);

      // Get the output URL
      const outputUrl = completedTask.output?.[0] || completedTask.artifacts?.[0]?.url;

      if (!outputUrl) {
        throw new Error("No output URL in completed task");
      }

      return NextResponse.json({
        success: true,
        type: type,
        url: outputUrl,
        prompt,
        duration: runwayDuration,
      });

    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type. Use 'gif' or 'video'" },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("Media Generation Error:", error);
    
    // Handle specific errors
    if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid Runway API key. Please check your credentials." },
        { status: 401 }
      );
    }
    
    if (error.message?.includes("quota") || error.message?.includes("limit") || error.message?.includes("429")) {
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
