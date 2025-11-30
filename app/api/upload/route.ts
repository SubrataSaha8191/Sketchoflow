// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { imageModel } from "@/lib/gemini";

export async function POST(req: Request) {
  const { image, prompt } = await req.json();

  const res = await imageModel.editImage({
    prompt,
    image: {
      inlineData: {
        data: image.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: "image/png",
      },
    },
  });

  return NextResponse.json({
    image: res.images?.[0]?.base64,
  });
}
