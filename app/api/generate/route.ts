export const runtime = "nodejs"; 

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    const desc = form.get("desc") || "";

    if (!file) {
      return Response.json({ error: "No image uploaded" }, { status: 400 });
    }

    // Convert uploaded file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // TODO: call your Gemini NanoBanana model here
    // const aiOutput = await callGemini(buffer, desc);

    return Response.json({
      success: true,
      message: "API route working!",
      received: {
        filename: file.name,
        size: buffer.length,
        description: desc,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
