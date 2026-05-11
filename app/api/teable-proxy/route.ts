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
    const BASE_ID = process.env.VITE_TEABLE_BASE_ID;

    if (!API_KEY) {
      console.error('Missing Teable API Key in Multisite Environment');
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    // Rewrite path to include base ID if it's a table operation and base ID is missing
    // We only do this for "write" operations (PATCH, POST, DELETE) to fix the save failures
    // while keeping GET requests stable as they were previously working.
    let targetPath = path;
    const isWriteOp = ['PATCH', 'POST', 'DELETE', 'PUT'].includes(method.toUpperCase());
    if (BASE_ID && isWriteOp && path.startsWith('/table/') && !path.startsWith(`/base/${BASE_ID}`)) {
      targetPath = `/base/${BASE_ID}${path}`;
    }

    // Switch back to the proven app.teable.ai endpoint
    const url = `https://app.teable.ai/api${targetPath}`;

    
    console.log(`Proxying ${method} to ${url}`);

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: (method !== 'GET' && method !== 'DELETE' && payload) ? JSON.stringify(payload) : undefined,
    });

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
