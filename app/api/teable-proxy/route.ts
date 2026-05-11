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

    if (!API_KEY) {
      console.error('Missing Teable API Key in Multisite Environment');
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    // Switch back to the proven app.teable.ai endpoint
    const url = `https://app.teable.ai/api${path}`;

    
    console.log(`Proxying ${method} to ${url}`);

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: (method !== 'GET' && method !== 'DELETE' && payload) ? JSON.stringify(payload) : undefined,
    });

    const data = await response.json();
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    if (!response.ok) {
      console.error(`Teable API Error (${response.status}):`, JSON.stringify(data));
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
