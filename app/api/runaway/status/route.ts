import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    const response = await fetch(
      `https://api.dev.runwayml.com/v1/tasks/${id}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
          "X-Runway-Version": "2024-11-06",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch video status" },
      { status: 500 }
    );
  }
}
