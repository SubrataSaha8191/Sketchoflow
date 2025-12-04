import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, type, prompt, userId } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Upload to Cloudinary with metadata
    const result = await cloudinary.uploader.upload(image, {
      folder: "sketchoflow/gallery",
      resource_type: "auto",
      context: {
        type: type || "unknown",
        prompt: prompt || "",
        userId: userId || "anonymous",
        createdAt: new Date().toISOString(),
      },
      tags: [type || "generation", "sketchoflow"],
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.public_id,
        url: result.secure_url,
        type,
        prompt,
        createdAt: new Date().toISOString(),
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
