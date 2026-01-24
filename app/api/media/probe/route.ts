import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const HF_MODELS = [
  'damo-vilab/text-to-video-ms-1.7b',
  'ali-vilab/modelscope-text-to-video-synthesis',
  'THUDM/CogVideoX-2b',
  'THUDM/CogVideoX-5b',
  'Wan-AI/Wan2.1-T2V-14B',
  'ByteDance/AnimateDiff-Lightning',
];

const ENDPOINT_PATTERNS = [
  (m: string) => `https://router.huggingface.co/models/${m}`,
  (m: string) => `https://router.huggingface.co/models/${m}/invoke`,
  (m: string) => `https://api-inference.huggingface.co/models/${m}`,
  (m: string) => `https://api-inference.huggingface.co/models/${m}/invoke`,
];

const DEFAULT_PROMPT = 'A serene ocean sunset with waves gently rolling onto the beach.';
const DEFAULT_TIMEOUT_MS = 15000;

async function probeEndpoint(url: string, apiKey: string, bodyObj: any) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(bodyObj),
      signal: controller.signal as any,
    });

    const contentType = res.headers.get('content-type') || '';

    // Try to capture a short preview safely
    let preview = '';
    if (contentType.includes('application/json') || contentType.includes('text/')) {
      try {
        const json = await res.json();
        preview = JSON.stringify(json).slice(0, 600);
      } catch (e) {
        preview = '<failed to parse JSON preview>';
      }
    } else {
      // binary preview: only capture size
      const buffer = await res.arrayBuffer();
      preview = `binary:${buffer.byteLength} bytes`;
    }

    clearTimeout(id);

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      contentType,
      preview,
    };
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      return { ok: false, error: 'timeout' };
    }
    return { ok: false, error: err.message || String(err) };
  }
}

export async function GET(request: NextRequest) {
  // Only allow this probe on server side with env keys configured.
  const hfApiKey = process.env.HUGGINGFACE_API_KEY || null;
  const runwayKey = process.env.RUNWAY_API_KEY || null;
  const replicateKey = process.env.REPLICATE_API_KEY || null;
  const geminiKey = process.env.GEMINI_API_KEY || null;

  const keys = {
    huggingface: !!hfApiKey,
    runway: !!runwayKey,
    replicate: !!replicateKey,
    gemini: !!geminiKey,
  };

  if (!hfApiKey && !runwayKey && !replicateKey && !geminiKey) {
    return NextResponse.json({ success: false, error: 'No provider API keys found in environment. Set HUGGINGFACE_API_KEY, RUNWAY_API_KEY, REPLICATE_API_KEY or GEMINI_API_KEY and retry.' }, { status: 400 });
  }

  const results: any[] = [];

  if (hfApiKey) {
    for (const model of HF_MODELS) {
      for (const pattern of ENDPOINT_PATTERNS) {
        const url = pattern(model);
        try {
          // Minimal body that most HF router endpoints will accept
          const body = { inputs: DEFAULT_PROMPT, parameters: { num_frames: 8 } };
          const res = await probeEndpoint(url, hfApiKey, body);
          results.push({ provider: 'huggingface', model, url, ...res });
        } catch (err: any) {
          results.push({ provider: 'huggingface', model, url, ok: false, error: err?.message || String(err) });
        }
      }
    }
  }

  // Quick Runway ping (if key present) - use a GET to the /tasks endpoint for a harmless auth check
  if (runwayKey) {
    try {
      const res = await fetch('https://api.dev.runwayml.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${runwayKey}`, 'X-Runway-Version': '2024-11-06' },
      });

      results.push({ provider: 'runway', ok: res.ok, status: res.status, statusText: res.statusText });
    } catch (err: any) {
      results.push({ provider: 'runway', ok: false, error: err.message || String(err) });
    }
  }

  // Quick Replicate check
  if (replicateKey) {
    try {
      const res = await fetch('https://api.replicate.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Token ${replicateKey}` },
      });
      results.push({ provider: 'replicate', ok: res.ok, status: res.status, statusText: res.statusText });
    } catch (err: any) {
      results.push({ provider: 'replicate', ok: false, error: err.message || String(err) });
    }
  }

  // Gemini key presence only (we can't probe private google endpoint without proper usage)
  if (geminiKey) {
    results.push({ provider: 'gemini', ok: true, note: 'GEMINI_API_KEY present - server-side tests require specific Google API usage (not probed here).' });
  }

  return NextResponse.json({ success: true, keys, results });
}
