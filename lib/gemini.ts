import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_FALLBACK_ORDER = [
  "imagen-3.0-generative",  // main image model
  "gemini-2.0-pro-exp",     // strong fallback
  "gemini-2.0-flash",       // fast fallback
  "gemini-1.5-flash",       // last fallback
];

// Helper to get model instance
const getModel = (modelName: string) =>
  genAI.getGenerativeModel({ model: modelName });

export async function generateWithFallback(prompt: string, optionalData?: any) {
  const errors: any[] = [];

  for (const model of MODEL_FALLBACK_ORDER) {
    try {
      console.log(`🔵 Trying model: ${model}`);

      const modelInstance = getModel(model);

      const result = optionalData
        ? await modelInstance.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  { text: prompt },
                  ...(optionalData ? [optionalData] : []),
                ],
              },
            ],
          })
        : await modelInstance.generateContent(prompt);

      console.log(`🟢 Success using: ${model}`);
      return { success: true, model, result };
    } catch (err) {
      console.warn(`🔴 Failed on model ${model}`);
      errors.push({ model, error: err });
    }
  }

  return {
    success: false,
    message: "All Gemini models failed",
    errors,
  };
}
