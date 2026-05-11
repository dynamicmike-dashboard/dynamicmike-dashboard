import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, method, body: payload } = body;
    
    const API_KEY = process.env.VITE_TEABLE_API_KEY;
    // Hardcoded fallback to ensure production stability while environment variables propagate
    const BASE_ID = process.env.VITE_TEABLE_BASE_ID || "bseWyzvKpnowhtg44Aj";

    if (!API_KEY) {
      console.error('Missing Teable API Key in Multisite Environment');
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const tryRequest = async (baseUrl: string) => {
      const url = `${baseUrl}/api${path}`;
      console.log(`Proxying ${method} to ${url}`);
      
      return fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: (method !== 'GET' && method !== 'DELETE' && payload) ? JSON.stringify(payload) : undefined,
      });
    };

    let response = await tryRequest('https://app.teable.ai');
    
    // If 404 or server error, try the legacy/alternative endpoint
    if (!response.ok && (response.status === 404 || response.status >= 500)) {
      console.log(`Fallback: app.teable.ai returned ${response.status}, trying api.teable.io/v1`);
      response = await tryRequest('https://api.teable.io/v1');
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { raw: responseText };
    }
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    if (!response.ok) {
      console.error(`Teable API Error (${response.status}) for ${url}:`, responseText);
      return NextResponse.json({
        error: 'Teable API Error',
        details: data,
        status: response.status
      }, { status: response.status, headers });
    }

    return NextResponse.json(data, { status: response.status, headers });
  } catch (error: any) {
    console.error('Proxy Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
