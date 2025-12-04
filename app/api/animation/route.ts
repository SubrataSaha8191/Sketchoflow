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
9. FORMAT CSS WITH PROPER INDENTATION - each property on its own line, 2-space indentation
10. Use newline characters (\\n) in the JSON string to preserve formatting

CRITICAL CSS FORMATTING:
- Each CSS property MUST be on its own line
- Use 2-space indentation inside selectors
- Opening brace on same line as selector
- Closing brace on its own line
- Blank line between rule sets
- @keyframes should have each keyframe on separate lines with proper indentation

For the "react" key, generate a COMPLETE, SELF-CONTAINED React component that includes:
- A functional component with proper TypeScript/JSX syntax
- styled-components wrapper with all CSS embedded OR a StyledWrapper component pattern
- All @keyframes and styles defined inside the styled component
- Export statement at the end
- The component should be copy-paste ready, like component libraries (react-bits, uiverse, etc.)

Example React output format:
\`\`\`
import styled from 'styled-components';

const AnimatedButton = () => {
  return (
    <StyledWrapper>
      <button className="animated-btn">Click Me</button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div\`
  .animated-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    animation: bounce 1s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% { 
      transform: translateY(0); 
    }
    50% { 
      transform: translateY(-10px); 
    }
  }
\`;

export default AnimatedButton;
\`\`\`

Example CSS output (MUST follow this format):
\`\`\`
.animated-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
\`\`\`

Example output JSON format (note the \\n for newlines):
{
  "css": ".animated-btn {\\n  padding: 12px 24px;\\n  background: cyan;\\n  border: none;\\n  border-radius: 8px;\\n  color: white;\\n  cursor: pointer;\\n  animation: bounce 1s ease-in-out infinite;\\n}\\n\\n@keyframes bounce {\\n  0%, 100% {\\n    transform: translateY(0);\\n  }\\n  50% {\\n    transform: translateY(-10px);\\n  }\\n}",
  "html": "<button class=\\"animated-btn\\">Click Me</button>",
  "react": "import styled from 'styled-components';\\n\\nconst AnimatedButton = () => {...}"
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
8. FORMAT ALL CODE WITH PROPER INDENTATION - each property/attribute on its own line where appropriate
9. Use newline characters (\\n) in the JSON string to preserve formatting

CRITICAL FORMATTING:
- SVG should have proper indentation with 2 spaces
- Each element on its own line
- CSS properties each on their own line with 2-space indentation
- @keyframes should have each keyframe properly indented

For the "react" key, generate a COMPLETE, SELF-CONTAINED React component that includes:
- A functional component with proper TypeScript/JSX syntax
- styled-components wrapper with all CSS embedded OR a StyledWrapper component pattern
- The SVG directly embedded in JSX with proper React attributes (className instead of class, camelCase attributes)
- All @keyframes and styles defined inside the styled component with proper indentation
- Export statement at the end
- The component should be copy-paste ready, like component libraries (react-bits, uiverse, etc.)

Example React output format:
\`\`\`
import styled from 'styled-components';

const AnimatedSVG = () => {
  return (
    <StyledWrapper>
      <svg viewBox="0 0 200 200" className="animated-svg">
        <circle cx="100" cy="100" r="50" className="circle" />
      </svg>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div\`
  .animated-svg {
    width: 200px;
    height: 200px;
  }
  
  .circle {
    fill: #667eea;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
\`;

export default AnimatedSVG;
\`\`\`

Example output JSON format (note the \\n for newlines and proper indentation):
{
  "svg": "<svg viewBox=\\"0 0 200 200\\">\\n  <circle cx=\\"100\\" cy=\\"100\\" r=\\"50\\" />\\n</svg>",
  "css": ".circle {\\n  fill: #667eea;\\n  animation: pulse 2s ease-in-out infinite;\\n}\\n\\n@keyframes pulse {\\n  0%, 100% {\\n    transform: scale(1);\\n  }\\n  50% {\\n    transform: scale(1.1);\\n  }\\n}",
  "react": "import styled from 'styled-components';\\n\\nconst AnimatedSVG = () => {\\n  return (\\n    <StyledWrapper>\\n      <svg>...</svg>\\n    </StyledWrapper>\\n  );\\n};\\n\\nconst StyledWrapper = styled.div\`\\n  .circle {\\n    fill: #667eea;\\n  }\\n\`;\\n\\nexport default AnimatedSVG;"
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
