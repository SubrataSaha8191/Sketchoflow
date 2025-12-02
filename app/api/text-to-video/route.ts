export async function POST(req: Request) {
  const { prompt } = await req.json();

  const videoPrompt = `
Generate a JSON storyboard for a short animation video.

Structure:
{
  "duration": number,
  "fps": 24,
  "scenes": [
    {
      "id": 1,
      "duration": number,
      "description": string,
      "cssAnimation": "...",
      "svgElements": [...]
    }
  ]
}

User request: ${prompt}
`;

  const result = await groqGenerate(videoPrompt);
  return Response.json(result);
}
