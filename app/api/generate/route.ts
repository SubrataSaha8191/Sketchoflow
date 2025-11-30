import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use gemini-1.5-flash which has better free tier limits (15 RPM, 1M tokens/min)
const MODEL_NAME = "gemini-1.5-flash";

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function with retry logic
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error?.status === 429 || error?.message?.includes('429')) {
        // Extract retry delay from error if available
        const retryMatch = error?.message?.match(/retry in (\d+\.?\d*)s/i);
        const waitTime = retryMatch ? parseFloat(retryMatch[1]) * 1000 : baseDelay * Math.pow(2, attempt);
        
        console.log(`Rate limited. Waiting ${Math.round(waitTime / 1000)}s before retry ${attempt + 1}/${maxRetries}`);
        await delay(waitTime);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  throw lastError;
}

export async function POST(req: Request) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { 
          error: "Gemini API key not configured",
          details: "Please add GEMINI_API_KEY to your .env.local file"
        },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get("image") as File | null;
    const prompt = (form.get("prompt") as string) || "";
    const mode = (form.get("mode") as string) || "generate"; // generate, sketch, transform

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // For text-to-image generation (generate mode without image)
    if (mode === "generate" && !file) {
      const result = await callWithRetry(async () => {
        return await model.generateContent([
          {
            text: `Generate a detailed, high-quality image based on this description: ${prompt}. 
                   Focus on creating a visually stunning and creative interpretation.`,
          },
        ]);
      });

      const response = await result.response;
      const text = response.text();

      return Response.json({
        success: true,
        mode: "generate",
        description: text,
        message: "Image generation prompt processed",
      });
    }

    // For image-based operations (sketch-to-image or transform)
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");
      const mimeType = file.type || "image/png";

      let systemPrompt = "";
      
      if (mode === "sketch") {
        systemPrompt = `You are an AI that transforms sketches into detailed, polished images.
                        Analyze this sketch and describe how it would look as a fully rendered, 
                        professional image. Consider: ${prompt || "making it photorealistic and detailed"}.
                        Describe the enhanced version in vivid detail.`;
      } else if (mode === "transform") {
        systemPrompt = `You are an AI that transforms and edits images based on user instructions.
                        Apply this transformation to the image: ${prompt}.
                        Describe the resulting transformed image in detail.`;
      } else {
        systemPrompt = `Analyze this image and ${prompt ? `respond to: ${prompt}` : "describe what you see in detail"}.`;
      }

      const result = await callWithRetry(async () => {
        return await model.generateContent([
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          { text: systemPrompt },
        ]);
      });

      const response = await result.response;
      const text = response.text();

      return Response.json({
        success: true,
        mode: mode,
        result: text,
        received: {
          filename: file.name,
          size: buffer.length,
          prompt: prompt,
        },
      });
    }

    return Response.json(
      { error: "No image or prompt provided" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    
    // Handle rate limit specifically
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Too Many Requests')) {
      // Extract retry time from error message
      const retryMatch = err?.message?.match(/retry in (\d+\.?\d*)s/i);
      const retryAfter = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
      
      return Response.json(
        { 
          error: "Rate limit exceeded",
          details: `Please wait ${retryAfter} seconds and try again. The Gemini free tier allows ~15 requests per minute.`,
          retryAfter: retryAfter
        },
        { status: 429 }
      );
    }
    
    return Response.json(
      { 
        error: "Failed to process with Gemini AI",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
