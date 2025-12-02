import { groqGenerate } from "@/lib/groq";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const svgPrompt = `
Generate a valid SVG based on the request.
Return ONLY raw <svg> code without explanation.

User request:
${prompt}
`;

  const result = await groqGenerate(svgPrompt);
  return Response.json(result);
}
