import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";

export async function POST(req: Request) {
  const { sketch, prompt } = await req.json();

  // Pass image data as optional payload to the model fallback helper
  const payload = {
    image: {
      inlineData: {
        data: sketch.replace(/^data:image\/png;base64,/, ""),
        mimeType: "image/png",
      },
    },
  };

  const result = await generateWithFallback(prompt, payload);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.message || 'Failed to generate' }, { status: 500 });
  }

  // Support multiple response shapes for image data
  const images = (result.result as any)?.images || (result.result as any)?.image?.images;
  const output = images?.[0]?.base64 || images?.[0]?.image?.imageBase64 || null;

  return NextResponse.json({ success: true, image: output });
}
