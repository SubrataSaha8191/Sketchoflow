// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";

export async function POST(req: Request) {
  const { image, prompt } = await req.json();

  const payload = {
    image: {
      inlineData: {
        data: image.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: "image/png",
      },
    },
  };

  const result = await generateWithFallback(prompt, payload);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.message || 'Failed to process upload' }, { status: 500 });
  }

  const images = (result.result as any)?.images || (result.result as any)?.image?.images;
  const output = images?.[0]?.base64 || images?.[0]?.image?.imageBase64 || null;

  return NextResponse.json({ success: true, image: output });
}
