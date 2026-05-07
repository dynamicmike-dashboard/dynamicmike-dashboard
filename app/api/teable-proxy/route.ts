import { NextResponse } from 'next/server';

const TEABLE_API_URLS = [
  'https://app.teable.io/api',
  'https://app.teable.ai/api'
];

export async function POST(request: Request) {
  try {
    const { path, method, body } = await request.json();
    
    const apiKey = process.env.TEABLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Teable Key Missing in Environment" }, { status: 500 });

    const tryRequest = async (baseUrl: string) => {
      const url = `${baseUrl}${path}`;
      return fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    let response = await tryRequest(TEABLE_API_URLS[0]);
    
    // Fallback to .ai domain if .io is down
    if (!response.ok && (response.status === 404 || response.status === 502 || response.status === 0)) {
      response = await tryRequest(TEABLE_API_URLS[1]);
    }

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Teable API Error: ${response.status}`, details: errText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Teable Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
