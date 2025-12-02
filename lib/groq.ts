import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY missing in env");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Default model for code generation
export const GROQ_MODEL = "llama3-70b-8192";

// Generic function to generate any code
export async function groqGenerate(prompt: string) {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    return {
      success: true,
      text: completion.choices[0].message.content,
    };
  } catch (err) {
    console.error("Groq Error:", err);
    return { success: false, error: "Groq failed" };
  }
}
