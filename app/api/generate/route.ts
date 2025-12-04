import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// Initialize Gemini AI (optional - used for image analysis only)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Available Gemini models - try multiple fallbacks
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro", 
  "gemini-pro",
  "gemini-pro-vision"
];

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function with retry logic
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
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

// Function to generate image using Pollinations AI (free, no API key needed)
async function generateImageWithPollinations(prompt: string): Promise<string> {
  // Enhance prompt for better results
  const enhancedPrompt = `${prompt}, high quality, detailed, professional, 4k, beautiful lighting`;
  const encodedPrompt = encodeURIComponent(enhancedPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;
  
  // Verify the image can be fetched
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to generate image');
  }
  
  return imageUrl;
}

// Function to try Gemini with multiple model fallbacks
async function tryGeminiWithFallback(prompt: string, imageData?: { mimeType: string; data: string }): Promise<string | null> {
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const content = imageData 
        ? [{ inlineData: imageData }, { text: prompt }]
        : [{ text: prompt }];
      
      const result = await model.generateContent(content);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      console.log(`Model ${modelName} failed:`, error.message);
      continue;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;
    const prompt = (form.get("prompt") as string) || "";
    const mode = (form.get("mode") as string) || "generate"; // generate, sketch, transform

    // For text-to-image generation (generate mode without image)
    if (mode === "generate" && !file) {
      try {
        // Generate image directly with Pollinations AI (no Gemini needed)
        const imageUrl = await generateImageWithPollinations(prompt);
        
        return Response.json({
          success: true,
          mode: "generate",
          imageUrl: imageUrl,
          originalPrompt: prompt,
          message: "Image generated successfully",
        });
      } catch (genError: any) {
        console.error("Image generation error:", genError);
        return Response.json({
          success: false,
          error: "Image generation failed",
          details: genError.message || "Failed to generate image"
        }, { status: 500 });
      }
    }

    // For image-based operations (sketch-to-image or transform)
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");
      const mimeType = file.type || "image/png";

      let systemPrompt = "";
      
      if (mode === "sketch") {
        systemPrompt = `You are an AI that transforms sketches into detailed image descriptions.
                        Analyze this sketch and create a detailed prompt that would generate a fully rendered, 
                        professional version of this sketch. Consider: ${prompt || "making it photorealistic and detailed"}.
                        Return ONLY the image generation prompt, nothing else. Be very detailed about colors, lighting, style, and composition.`;
      } else if (mode === "transform") {
        systemPrompt = `You are an AI that creates image transformation prompts.
                        Analyze this image and create a detailed prompt that would generate a transformed version
                        with this change applied: ${prompt}.
                        Return ONLY the image generation prompt, nothing else. Be very detailed.`;
      } else {
        systemPrompt = `Analyze this image and ${prompt ? `respond to: ${prompt}` : "describe what you see in detail"}.`;
      }

      // Try to analyze image with Gemini (with fallback)
      let generationPrompt: string | null = null;
      
      if (process.env.GEMINI_API_KEY) {
        generationPrompt = await tryGeminiWithFallback(systemPrompt, {
          mimeType: mimeType,
          data: base64Image,
        });
      }
      
      // If Gemini fails or no API key, use the original prompt for image generation
      if (!generationPrompt) {
        generationPrompt = prompt || "a detailed artistic image, high quality, professional";
      }

      // For sketch and transform modes, generate the actual image
      if (mode === "sketch" || mode === "transform") {
        try {
          const imageUrl = await generateImageWithPollinations(generationPrompt);
          
          return Response.json({
            success: true,
            mode: mode,
            imageUrl: imageUrl,
            generationPrompt: generationPrompt,
            received: {
              filename: file.name,
              size: buffer.length,
              prompt: prompt,
            },
          });
        } catch (genError: any) {
          return Response.json({
            success: true,
            mode: mode,
            result: generationPrompt,
            imageUrl: null,
            error: "Image generation failed, but analysis completed",
            received: {
              filename: file.name,
              size: buffer.length,
              prompt: prompt,
            },
          });
        }
      }

      return Response.json({
        success: true,
        mode: mode,
        result: generationPrompt,
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
    console.error("API Error:", err);
    
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
