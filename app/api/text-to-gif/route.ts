export async function POST(req: Request) {
  const { prompt } = await req.json();

  const gifPrompt = `
Generate an HTML+CSS+JS animation that represents:
${prompt}

Do NOT add explanations.
`;

  const result = await groqGenerate(gifPrompt);
  return Response.json(result);
}
