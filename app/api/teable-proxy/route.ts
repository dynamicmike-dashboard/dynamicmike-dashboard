import { NextResponse } from 'next/server';

const TEABLE_API_URLS = [
  'https://app.teable.io/api',
  'https://app.teable.ai/api'
];

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  try {
    const { path, method, body } = await request.json();
    
    const apiKey = process.env.TEABLE_API_KEY || process.env.VITE_TEABLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Teable Key Missing in Environment" }, { status: 500, headers: corsHeaders(origin) });

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
    
    if (!response.ok && (response.status === 404 || response.status === 502 || response.status === 0)) {
      response = await tryRequest(TEABLE_API_URLS[1]);
    }

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Teable API Error: ${response.status}`, details: errText }, { status: response.status, headers: corsHeaders(origin) });
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: corsHeaders(origin) });

  } catch (error: any) {
    console.error("Teable Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(origin) });
  }
}
