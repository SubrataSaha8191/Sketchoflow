import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import cloudinary from '@/lib/cloudinary';

export const runtime = "nodejs";

// Runway API base URL - using the dev API for newer key format
const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";

// Helper function to poll for task completion
async function pollTaskStatus(taskId: string, apiKey: string, maxAttempts = 120): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to check task status");
    }

    const task = await response.json();

    if (task.status === "SUCCEEDED") {
      return task;
    } else if (task.status === "FAILED") {
      throw new Error(task.failure || task.failureCode || "Task failed");
    } else if (task.status === "CANCELLED") {
      throw new Error("Task was cancelled");
    }

    // Wait 3 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error("Task timed out - video generation is taking longer than expected");
}

// Helper function to generate image using Gemini for Plan B fallback
async function generateImageWithGemini(prompt: string): Promise<string | null> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.log("Gemini API key not configured, skipping image generation fallback");
    return null;
  }

  // List of models to try for image generation
  const imageModels = [
    "gemini-2.0-flash-exp-image-generation",  // Experimental image gen
    "gemini-2.0-flash-exp",                    // Experimental model
    "gemini-1.5-flash",                        // Fallback for text description
  ];

  const imagePrompt = `Create a high-quality, cinematic still image that represents: ${prompt}. The image should be suitable as a starting frame for video generation.`;

  for (const modelName of imageModels) {
    try {
      console.log(`Trying image generation with model: ${modelName}`);
      
      // Make direct REST API call to Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: imagePrompt }]
              }
            ],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log(`Model ${modelName} failed:`, errorData.error?.message || response.statusText);
        continue;
      }

      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts;

      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            console.log(`Successfully generated image with ${modelName}`);
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (error: any) {
      console.log(`Model ${modelName} exception:`, error.message);
      continue;
    }
  }

  console.error("All Gemini image generation models failed");
  return null;
}

// Plan A: Try text_to_video endpoint directly
async function tryTextToVideo(
  prompt: string, 
  duration: number, 
  aspectRatio: string, 
  apiKey: string
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  // Map aspect ratio to Runway supported values for text_to_video
  const runwayRatio = aspectRatio === "16:9" ? "1280:720" : 
                      aspectRatio === "9:16" ? "720:1280" : 
                      aspectRatio === "1920:1080" ? "1920:1080" :
                      aspectRatio === "1080:1920" ? "1080:1920" : "1280:720";
  
  // Map duration to supported values (4, 6, or 8 seconds for veo3.1)
  const runwayDuration = duration <= 4 ? 4 : duration <= 6 ? 6 : 8;

  try {
    const createResponse = await fetch(`${RUNWAY_API_BASE}/text_to_video`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "veo3.1",
        promptText: prompt,
        ratio: runwayRatio,
        duration: runwayDuration,
        audio: false,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log("text_to_video failed:", error);
      return { success: false, error: error.message || error.error || "text_to_video failed" };
    }

    const createResult = await createResponse.json();
    return { success: true, taskId: createResult.id };
  } catch (error: any) {
    console.log("text_to_video exception:", error.message);
    return { success: false, error: error.message };
  }
}

// Plan B: Generate image with Gemini, then use image_to_video
async function tryImageToVideo(
  prompt: string,
  duration: number,
  aspectRatio: string,
  apiKey: string
): Promise<{ success: boolean; taskId?: string; url?: string; error?: string }> {
  // Step 1: Generate image with Gemini
  console.log("Plan B: Generating image with Gemini...");
  const imageDataUri = await generateImageWithGemini(prompt);
  
  if (!imageDataUri) {
    return { success: false, error: "Failed to generate image with Gemini" };
  }

  console.log("Plan B: Image generated, sending to Runway image_to_video...");

  // Map aspect ratio to Runway supported values for image_to_video
  const runwayRatio = aspectRatio === "16:9" ? "1280:720" : 
                      aspectRatio === "9:16" ? "720:1280" : 
                      aspectRatio === "1:1" ? "960:960" : "1280:720";
  
  // Map duration to supported values (5 or 10 seconds for gen3a_turbo)
  const runwayDuration = duration <= 5 ? 5 : 10;

  try {
    const createResponse = await fetch(`${RUNWAY_API_BASE}/image_to_video`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        promptImage: imageDataUri,
        promptText: prompt,
        ratio: runwayRatio,
        duration: runwayDuration,
        watermark: false,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({}));
      console.log("image_to_video failed:", error);
      // Fall through to try HF image->video as a fallback
    } else {
      const createResult = await createResponse.json();
      return { success: true, taskId: createResult.id };
    }
  } catch (error: any) {
    console.log("image_to_video exception:", error.message);
    // Fall through to try HF image->video
  }

  // Try Hugging Face image->video as a fallback (server-side image -> HF model)
  try {
    console.log("Runway image_to_video failed; trying Hugging Face image->video...");
    const hfResult = await tryHfImageToVideo(imageDataUri, prompt, "video", duration);
    if (hfResult.success && hfResult.url) {
      return { success: true, url: hfResult.url };
    }
    return { success: false, error: hfResult.error || "HF image->video failed" };
  } catch (err: any) {
    console.log("HF image->video exception:", err?.message || err);
    return { success: false, error: err?.message || "image->video failed" };
  }
}


// Plan C1: Try Hugging Face image->video conversion using the Gemini-generated image
async function tryHfImageToVideo(
  imageDataUrl: string,
  prompt: string,
  type: "video" | "gif",
  duration: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfApiKey) {
    return { success: false, error: "Hugging Face API key not configured" };
  }

  console.log("Plan C1: Attempting Hugging Face image->video conversion...");

  // Candidate HF image-to-video or image+prompt-capable models
  const models = [
    // These are candidates that sometimes accept an image + prompt; availability varies
    { name: 'damo-vilab/text-to-video-ms-1.7b', expectContentType: 'video/mp4' },
    { name: 'Wan-AI/Wan2.1-T2V-14B', expectContentType: 'video/mp4' },
    { name: 'THUDM/CogVideoX-2b', expectContentType: 'video/mp4' },
    { name: 'ByteDance/AnimateDiff-Lightning', expectContentType: 'image/gif' },
  ];

  for (const modelConfig of models) {
    try {
      console.log(`Trying HF model ${modelConfig.name} for image->video`);

      const candidateUrls = [
        `https://router.huggingface.co/models/${modelConfig.name}`,
        `https://router.huggingface.co/models/${modelConfig.name}/invoke`,
        `https://api-inference.huggingface.co/models/${modelConfig.name}`,
      ];

      for (const url of candidateUrls) {
        try {
          const body = {
            inputs: {
              image: imageDataUrl,
              prompt: prompt,
            },
            parameters: {
              num_frames: type === 'gif' ? 16 : 49,
              duration: duration,
            },
          };

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${hfApiKey}`,
              'Content-Type': 'application/json',
              Accept: '*/*',
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            console.log(`HF ${modelConfig.name} (${url}) returned ${res.status}: ${errBody.substring(0,200)}`);
            // Try next URL
            continue;
          }

          const contentType = res.headers.get('content-type') || '';

          if (contentType.includes('application/json') || contentType.includes('text/')) {
            const json = await res.json().catch(() => null);
            if (json && json.error) {
              console.log(`HF ${modelConfig.name} error JSON:`, json.error);
              continue;
            }

            // Try to extract base64 or data URL
            const possible = json?.data || json?.output || json?.[0] || json;
            if (typeof possible === 'string') {
              if (possible.startsWith('data:')) {
                return { success: true, url: possible };
              }

              // If it's base64, wrap it
              if (/^[A-Za-z0-9+/=\n]+$/.test(possible.trim())) {
                const dataUrl = `data:${modelConfig.expectContentType};base64,${possible}`;
                return { success: true, url: dataUrl };
              }
            }

            console.log(`HF ${modelConfig.name} returned JSON but no media found`);
            continue;
          }

          // Binary response
          const arrayBuffer = await res.arrayBuffer();
          if (arrayBuffer.byteLength > 0) {
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const dataUrl = `data:${modelConfig.expectContentType};base64,${base64}`;
            console.log(`✅ HF ${modelConfig.name} image->video succeeded (${Math.round(arrayBuffer.byteLength/1024)} KB)`);
            return { success: true, url: dataUrl };
          }

        } catch (err: any) {
          console.log(`HF model ${modelConfig.name} at ${url} error:`, err?.message || err);
          continue;
        }
      }
    } catch (err: any) {
      console.log(`HF model ${modelConfig.name} exception:`, err?.message || err);
      continue;
    }
  }

  return { success: false, error: 'All HF image->video attempts failed' };
}

// Plan C: Use Replicate as final fallback
async function tryReplicateGeneration(
  prompt: string,
  type: "video" | "gif"
): Promise<{ success: boolean; url?: string; error?: string }> {
  const replicateApiKey = process.env.REPLICATE_API_KEY;
  
  if (!replicateApiKey) {
    return { success: false, error: "Replicate API key not configured" };
  }

  const replicate = new Replicate({
    auth: replicateApiKey,
  });

  console.log(`Plan C: Using Replicate for ${type} generation...`);

  // Helper to wait with exponential backoff for rate limiting
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Video models to try in order - using model names without version hash (uses latest)
  // These are verified working models from Replicate's text-to-video collection
  const videoModels = [
    {
      name: "Zeroscope-V2-XL",
      model: "anotherjesse/zeroscope-v2-xl", // 299k runs - reliable
      input: (p: string) => ({
        prompt: p,
        num_frames: 24,
        fps: 8,
        width: 576,
        height: 320,
      })
    },
    {
      name: "CogVideoX-5B",
      model: "cuuupid/cogvideox-5b", // 2.5k runs
      input: (p: string) => ({
        prompt: p,
        num_frames: 49,
        guidance_scale: 6,
        num_inference_steps: 50,
      })
    },
    {
      name: "VideoCrafter",
      model: "cjwbw/videocrafter", // 133k runs
      input: (p: string) => ({
        prompt: p,
        video_length: 16,
        fps: 8,
      })
    },
    {
      name: "Hunyuan-Video",
      model: "tencent/hunyuan-video", // 115k runs
      input: (p: string) => ({
        prompt: p,
        video_length: 65,
        infer_steps: 50,
        flow_shift: 7.0,
      })
    },
    {
      name: "LTX-Video",
      model: "lightricks/ltx-video", // 162k runs, real-time generation
      input: (p: string) => ({
        prompt: p,
        num_frames: 97,
        width: 768,
        height: 512,
      })
    },
  ];

  // GIF/Animation models to try in order - verified working
  const gifModels = [
    {
      name: "HotShot-XL",
      model: "lucataco/hotshot-xl", // 863k runs - most popular
      input: (p: string) => ({
        prompt: p,
        negative_prompt: "blurry, low quality, distorted",
        steps: 30,
      })
    },
    {
      name: "AnimateDiff",
      model: "lucataco/animate-diff", // 321k runs
      input: (p: string) => ({
        prompt: p,
        n_prompt: "bad quality, worse quality, blurry",
        num_frames: 16,
        num_inference_steps: 25,
        guidance_scale: 7.5,
      })
    },
    {
      name: "AnimateDiff-Prompt-Travel",
      model: "zsxkib/animatediff-prompt-travel", // 5.7k runs
      input: (p: string) => ({
        prompt: p,
        n_prompt: "bad quality, blurry",
        steps: 25,
      })
    },
    {
      name: "AnimateDiff-Illusions",
      model: "zsxkib/animatediff-illusions", // 10.5k runs
      input: (p: string) => ({
        prompt: p,
        n_prompt: "blurry, low quality",
        num_inference_steps: 25,
      })
    },
  ];

  const models = type === "video" ? videoModels : gifModels;
  let lastError: string = "";
  let retryDelay = 1000; // Start with 1 second delay for rate limiting

  for (const modelConfig of models) {
    // Try each model up to 2 times (for rate limit recovery)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Trying ${modelConfig.name}${attempt > 0 ? ` (retry ${attempt})` : ""}...`);
        
        const output = await replicate.run(
          modelConfig.model as `${string}/${string}`,
          { input: modelConfig.input(prompt) }
        );

        // Handle different output formats from Replicate
        let outputUrl: string | undefined;
        
        if (typeof output === "string") {
          outputUrl = output;
        } else if (Array.isArray(output) && output.length > 0) {
          outputUrl = typeof output[0] === "string" ? output[0] : undefined;
        } else if (output && typeof output === "object") {
          const obj = output as Record<string, any>;
          outputUrl = obj.output || obj.video || obj.gif || obj.url;
          if (Array.isArray(outputUrl) && outputUrl.length > 0) {
            outputUrl = outputUrl[0];
          }
        }

        if (outputUrl && typeof outputUrl === "string") {
          console.log(`✅ ${modelConfig.name} succeeded!`);
          return { success: true, url: outputUrl };
        }
        
        console.log(`${modelConfig.name} returned no valid output, trying next...`);
        break; // No retry needed if output format issue
        
      } catch (error: any) {
        lastError = error.message || "Unknown error";
        console.log(`${modelConfig.name} failed: ${lastError}`);
        
        // Handle rate limiting (429) with retry
        if (error.message?.includes("429") || error.message?.includes("rate")) {
          if (attempt === 0) {
            console.log(`Rate limited, waiting ${retryDelay / 1000}s before retry...`);
            await wait(retryDelay);
            retryDelay *= 2; // Exponential backoff
            continue; // Retry same model
          }
        }
        
        // Handle invalid version errors - skip to next model
        if (error.message?.includes("Invalid version") || error.message?.includes("422")) {
          console.log(`Model version issue, skipping to next model...`);
          break;
        }
        
        break; // Don't retry for other errors
      }
    }
  }

  return { success: false, error: `All Replicate models failed. Last error: ${lastError}` };
}

// Plan D: Use Hugging Face Inference API as final fallback
async function tryHuggingFaceGeneration(
  prompt: string,
  type: "video" | "gif"
): Promise<{ success: boolean; url?: string; error?: string }> {
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!hfApiKey) {
    return { success: false, error: "Hugging Face API key not configured" };
  }

  console.log(`Plan D: Using Hugging Face for ${type} generation...`);

  // Helper to wait for model loading
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Video models on Hugging Face Inference API
  const videoModels = [
    {
      name: "CogVideoX-2b",
      model: "THUDM/CogVideoX-2b",
      contentType: "video/mp4",
    },
    {
      name: "CogVideoX-5b",
      model: "THUDM/CogVideoX-5b",
      contentType: "video/mp4",
    },
    {
      name: "Wan2.1-T2V-14B",
      model: "Wan-AI/Wan2.1-T2V-14B",
      contentType: "video/mp4",
    },
  ];

  // GIF/Animation models on Hugging Face
  const gifModels = [
    {
      name: "AnimateDiff-Lightning",
      model: "ByteDance/AnimateDiff-Lightning",
      contentType: "image/gif",
    },
    {
      name: "AnimateDiff",
      model: "guoyww/animatediff",
      contentType: "image/gif",
    },
  ];

  const models = type === "video" ? videoModels : gifModels;
  let lastError: string = "";

  for (const modelConfig of models) {
    // Try each model up to 3 times (for model loading)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`Trying HF ${modelConfig.name}${attempt > 0 ? ` (attempt ${attempt + 1})` : ""}...`);

        // Try multiple router URL patterns to handle variations in HF routing
        const candidateUrls = [
          `https://router.huggingface.co/models/${modelConfig.model}`,
          `https://router.huggingface.co/models/${modelConfig.model}/invoke`,
          `https://router.huggingface.co/api/models/${modelConfig.model}/invoke`,
          `https://router.huggingface.co/api/models/${modelConfig.model}`,
        ];

        let response: Response | null = null;
        let lastFetchError: any = null;

        for (const url of candidateUrls) {
          try {
            console.log(`-> HF try URL: ${url}`);
            response = await fetch(url, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${hfApiKey}`,
                "Content-Type": "application/json",
                Accept: "*/*",
              },
              body: JSON.stringify({
                inputs: prompt,
                parameters: {
                  num_frames: type === "gif" ? 16 : 49,
                },
              }),
            });

            // If we got any response, stop trying alternative URLs
            if (response) break;
          } catch (err: any) {
            lastFetchError = err;
            console.log(`HF fetch to ${url} error:`, String(err));
            response = null;
            continue;
          }
        }

        if (!response) {
          lastError = lastFetchError ? String(lastFetchError) : 'No response from HF endpoints';
          console.log(`HF all URL patterns failed: ${lastError}`);
          break;
        }

        // Handle common router responses: model loading (503) or errors (JSON)
        if (response.status === 503) {
          const data = await response.json().catch(() => ({}));
          if (typeof data.error === "string" && data.error.toLowerCase().includes("loading")) {
            const waitTime = data.estimated_time || 20;
            console.log(`Model ${modelConfig.name} is loading, waiting ${waitTime}s...`);
            await wait(Math.min(waitTime * 1000, 30000)); // Max 30s wait
            continue; // Retry
          }
        }

        if (!response.ok) {
          // Try to parse JSON error, otherwise fallback to status
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData.error || errorData.message || `HTTP ${response.status}`;
          console.log(`HF ${modelConfig.name} failed: ${lastError}`);
          break; // Try next model
        }

        // Some HF router responses return JSON with base64, others return binary blobs.
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json") || contentType.includes("text/")) {
          const json = await response.json().catch(() => null);
          // If the model returned an error field, handle it
          if (json && json.error) {
            lastError = json.error;
            console.log(`HF ${modelConfig.name} returned error JSON: ${lastError}`);
            break;
          }

          // Some HF endpoints return { data: "base64..." } or similar
          if (json && typeof json === "object") {
            // try common fields
            const possible = json.data || json.output || json[0] || json;
            if (typeof possible === "string" && possible.startsWith("data:")) {
              return { success: true, url: possible };
            }
            if (typeof possible === "string") {
              // assume base64 payload
              const dataUrl = `data:${modelConfig.contentType};base64,${possible}`;
              return { success: true, url: dataUrl };
            }
          }

          console.log(`HF ${modelConfig.name} returned JSON but couldn't extract media`);
          break;
        }

        // Default: treat response as binary media
        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength > 0) {
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const dataUrl = `data:${modelConfig.contentType};base64,${base64}`;
          console.log(`✅ HF ${modelConfig.name} succeeded! (${Math.round(arrayBuffer.byteLength / 1024)}KB)`);
          return { success: true, url: dataUrl };
        }

        console.log(`HF ${modelConfig.name} returned empty response`);
        break;
        
      } catch (error: any) {
        lastError = error.message || "Unknown error";
        console.log(`HF ${modelConfig.name} exception: ${lastError}`);
        
        // Don't retry on network errors
        if (error.message?.includes("fetch")) {
          break;
        }
      }
    }
  }

  return { success: false, error: `All Hugging Face models failed. Last error: ${lastError}` };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prompt, duration = 5, aspectRatio = "16:9" } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    if (type !== "gif" && type !== "video") {
      return NextResponse.json(
        { success: false, error: "Invalid type. Use 'gif' or 'video'" },
        { status: 400 }
      );
    }

    const runwayApiKey = process.env.RUNWAY_API_KEY;
    let taskId: string | undefined;
    let generationMethod: string = "";
    let outputUrl: string | undefined;

    // Plan A: Try Runway text_to_video endpoint first (if API key exists)
    if (runwayApiKey) {
      console.log("Attempting Plan A: Runway text_to_video...");
      const textToVideoResult = await tryTextToVideo(prompt, duration, aspectRatio, runwayApiKey);
      
      if (textToVideoResult.success && textToVideoResult.taskId) {
        taskId = textToVideoResult.taskId;
        generationMethod = "runway_text_to_video";
        console.log("Plan A succeeded, task ID:", taskId);
        
        // Poll for completion
        const completedTask = await pollTaskStatus(taskId, runwayApiKey);
        outputUrl = completedTask.output?.[0] || completedTask.artifacts?.[0]?.url;
      } else {
        console.log("Plan A failed:", textToVideoResult.error);
        
        // Plan B: Fall back to Gemini image generation + Runway image_to_video
        console.log("Attempting Plan B: Gemini image + Runway image_to_video...");
        const imageToVideoResult = await tryImageToVideo(prompt, duration, aspectRatio, runwayApiKey);
        
        if (imageToVideoResult.success) {
          if (imageToVideoResult.taskId) {
            taskId = imageToVideoResult.taskId;
            generationMethod = "gemini_runway_image_to_video";
            console.log("Plan B succeeded (Runway), task ID:", taskId);
            // Poll for completion
            const completedTask = await pollTaskStatus(taskId, runwayApiKey);
            outputUrl = completedTask.output?.[0] || completedTask.artifacts?.[0]?.url;
          } else if (imageToVideoResult.url) {
            // Some providers (e.g., HF image->video) may return an immediate data URL
            outputUrl = imageToVideoResult.url;
            generationMethod = "gemini_hf_image_to_video";
            console.log("Plan B succeeded via HF image->video, URL received");
          }
        } else {
          console.log("Plan B failed:", imageToVideoResult.error);
        }
      }
    } else {
      console.log("Runway API key not configured, skipping Plans A and B");
    }

    // Plan C: Use Replicate as fallback
    if (!outputUrl) {
      console.log("Attempting Plan C: Replicate fallback...");
      const replicateResult = await tryReplicateGeneration(prompt, type);
      
      if (replicateResult.success && replicateResult.url) {
        outputUrl = replicateResult.url;
        generationMethod = "replicate";
        console.log("Plan C succeeded with Replicate");
      } else {
        console.log("Plan C failed:", replicateResult.error);
      }
    }

    // Plan D: Use Hugging Face as final fallback
    if (!outputUrl) {
      console.log("Attempting Plan D: Hugging Face fallback...");
      const hfResult = await tryHuggingFaceGeneration(prompt, type);
      
      if (hfResult.success && hfResult.url) {
        outputUrl = hfResult.url;
        generationMethod = "huggingface";
        console.log("Plan D succeeded with Hugging Face");
      } else {
        console.log("Plan D failed:", hfResult.error);
        throw new Error(`Generation failed.`);
      }
    }

    if (!outputUrl) {
      throw new Error("No output URL generated");
    }

    // If Cloudinary is configured and output is a data: URL or large base64, upload it to Cloudinary
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      if (cloudName && outputUrl && outputUrl.startsWith('data:')) {
        console.log('Uploading generated media to Cloudinary to avoid large data URLs...');
        const uploadResult = await cloudinary.uploader.upload(outputUrl, {
          folder: 'sketchoflow/outputs',
          resource_type: 'auto',
          overwrite: false,
        });
        if (uploadResult && uploadResult.secure_url) {
          outputUrl = uploadResult.secure_url;
          console.log('Uploaded to Cloudinary:', outputUrl);
        }
      }
    } catch (err: any) {
      console.log('Cloudinary upload failed:', err?.message || err);
      // Non-fatal: we'll continue returning the original data URL
    }

    return NextResponse.json({
      success: true,
      type: type,
      url: outputUrl,
      prompt,
      generationMethod,
      duration: duration,
    });

  } catch (error: any) {
    console.error("Media Generation Error:", error);
    
    // Handle specific errors
    if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid API key. Please check your credentials." },
        { status: 401 }
      );
    }
    
    if (error.message?.includes("quota") || error.message?.includes("limit") || error.message?.includes("429")) {
      return NextResponse.json(
        { success: false, error: "API rate limit reached. Please try again later." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate media" },
      { status: 500 }
    );
  }
}
