import { NextResponse } from 'next/server';

const TEABLE_API_URLS = [
  'https://app.teable.io/api',
  'https://app.teable.ai/api'
];

function getCorsHeaders(origin: string | null) {
  // Allow any subdomain of inspiringspeakerspdc.com or dynamicmike.com
  const allowedOrigins = [
    'https://dynamicmike.com',
    'https://dynamicmike-dashboard.vercel.app',
    'https://agenda.inspiringspeakerspdc.com'
  ];
  
  const responseOrigin = (origin && (allowedOrigins.includes(origin) || origin.endsWith('.inspiringspeakerspdc.com'))) 
    ? origin 
    : '*';

  return {
    'Access-Control-Allow-Origin': responseOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin)
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  try {
    const { path, method, body } = await request.json();
    
    const apiKey = process.env.TEABLE_API_KEY || process.env.VITE_TEABLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Teable Key Missing" }, { status: 500, headers: getCorsHeaders(origin) });

    const tryRequest = async (baseUrl: string) => {
      return fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    let response = await tryRequest(TEABLE_API_URLS[0]);
    if (!response.ok && (response.status === 404 || response.status >= 500)) {
      response = await tryRequest(TEABLE_API_URLS[1]);
    }

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Teable Error ${response.status}`, details: errText }, { status: response.status, headers: getCorsHeaders(origin) });
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: getCorsHeaders(origin) });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: getCorsHeaders(origin) });
  }
}
