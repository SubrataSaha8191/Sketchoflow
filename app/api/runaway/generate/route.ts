import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, duration = 5, aspectRatio = "16:9" } = await req.json();

    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Runway API key not configured" }, { status: 401 });
    }

    // Map aspect ratio to Runway supported values for text_to_video
    const runwayRatio = aspectRatio === "16:9" ? "1280:720" : 
                        aspectRatio === "9:16" ? "720:1280" : 
                        aspectRatio === "1920:1080" ? "1920:1080" :
                        aspectRatio === "1080:1920" ? "1080:1920" : "1280:720";
    
    // Map duration to supported values (4, 6, or 8 seconds for veo3.1)
    const runwayDuration = duration <= 4 ? 4 : duration <= 6 ? 6 : 8;

    // Try text_to_video endpoint first (Plan A)
    const response = await fetch("https://api.dev.runwayml.com/v1/text_to_video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "veo3.1",
        promptText: prompt,
        ratio: runwayRatio,
        duration: runwayDuration,
        audio: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: 400 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error generating video" },
      { status: 500 }
    );
  }
}
