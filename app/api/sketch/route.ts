import { NextResponse } from "next/server";
import { imageModel } from "@/lib/gemini";

export async function POST(req: Request) {
  const { sketch, prompt } = await req.json();

  const response = await imageModel.editImage({
    prompt,
    image: {
      inlineData: {
        data: sketch.replace(/^data:image\/png;base64,/, ""),
        mimeType: "image/png",
      },
    },
  });

  const output = response.images?.[0]?.base64;

  return NextResponse.json({ image: output });
}
