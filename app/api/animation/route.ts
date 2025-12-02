import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// CSS Animation generation prompt
const CSS_SYSTEM_PROMPT = `You are an expert CSS animation developer. Generate clean, production-ready CSS animation code based on user descriptions.

RULES:
1. Return ONLY valid CSS code, no explanations
2. Include @keyframes definitions
3. Use modern CSS animation properties
4. Include the main class with all animation properties
5. Use meaningful class names like .animated-element
6. Add vendor prefixes only when necessary
7. Keep animations performant (prefer transform and opacity)
8. Return code wrapped in a JSON object with keys: "css", "html", "react"

Example output format:
{
  "css": ".animated-btn { ... } @keyframes bounce { ... }",
  "html": "<button class=\\"animated-btn\\">Click Me</button>",
  "react": "<button className=\\"animated-btn\\">Click Me</button>"
}`;

// SVG Animation generation prompt
const SVG_SYSTEM_PROMPT = `You are an expert SVG animation developer. Generate clean, production-ready SVG animation code based on user descriptions.

RULES:
1. Return ONLY valid SVG code with embedded animations
2. Use SMIL animations (<animate>, <animateTransform>, etc.) or CSS animations
3. Keep SVG viewBox reasonable (0 0 200 200 or similar)
4. Use meaningful IDs for animated elements
5. Include stroke and fill colors that look good on dark backgrounds
6. Make animations smooth and performant
7. Return code wrapped in a JSON object with keys: "svg", "css" (if using CSS), "react"

Example output format:
{
  "svg": "<svg viewBox=\\"0 0 200 200\\">...</svg>",
  "css": "/* optional CSS if using CSS animations */",
  "react": "const AnimatedSVG = () => (<svg>...</svg>)"
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prompt, duration = "1s", easing = "ease-in-out" } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "css") {
      systemPrompt = CSS_SYSTEM_PROMPT;
      userPrompt = `Create a CSS animation with these specifications:
Description: ${prompt}
Duration: ${duration}
Easing: ${easing}

Generate the CSS animation code that matches this description. Return as JSON with css, html, and react keys.`;
    } else if (type === "svg") {
      systemPrompt = SVG_SYSTEM_PROMPT;
      userPrompt = `Create an SVG animation with these specifications:
Description: ${prompt}
Duration: ${duration}
Easing: ${easing}

Generate the SVG animation code that matches this description. Return as JSON with svg, css (optional), and react keys.`;
    } else {
      return NextResponse.json({ success: false, error: "Invalid type. Use 'css' or 'svg'" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      // If JSON parsing fails, try to extract code from the response
      parsedResponse = {
        css: responseText,
        html: "",
        react: ""
      };
    }

    return NextResponse.json({
      success: true,
      type,
      code: parsedResponse,
      prompt,
      duration,
      easing
    });

  } catch (error: any) {
    console.error("Animation API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate animation" },
      { status: 500 }
    );
  }
}
