import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "anonymous";
    const type = searchParams.get("type"); // Optional filter by type
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build the search expression
    let expression = "folder:sketchoflow/gallery";
    if (type) {
      expression += ` AND tags=${type}`;
    }

    // Fetch resources from Cloudinary
    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc")
      .max_results(limit)
      .with_field("context")
      .with_field("tags")
      .execute();

    const items = result.resources.map((resource: any) => ({
      id: resource.public_id,
      url: resource.secure_url,
      type: resource.context?.type || resource.tags?.[0] || "unknown",
      prompt: resource.context?.prompt || "",
      createdAt: resource.created_at,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      thumbnailUrl: cloudinary.url(resource.public_id, {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        format: "auto",
      }),
    }));

    return NextResponse.json({
      success: true,
      data: items,
      total: result.total_count,
    });
  } catch (err: any) {
    console.error("Cloudinary fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("id");

    if (!publicId) {
      return NextResponse.json({ error: "No id provided" }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Cloudinary delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
