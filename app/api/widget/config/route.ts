import { NextResponse } from 'next/server';
import { getAgentConfig, saveAgentConfig } from '@/lib/storage';

export const revalidate = 3600; // Cache for 1 hour at the edge

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const origin = request.headers.get('origin') || '*';

  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  }

  const config = getAgentConfig(agentId);

  if (!config) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Sanitize headers for external use
  const responseData = {
    id: config.id,
    name: config.name,
    agencyName: config.agencyName,
    themeColor: config.themeColor,
    securityEnabled: config.securityEnabled,
    logoUrl: config.logoUrl
    // DO NOT return API Key
  };

  return new NextResponse(JSON.stringify(responseData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '*';
  try {
    const body = await request.json();
    const { agentId, updates } = body;

    if (!agentId || !updates) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Verify agent exists
    const current = getAgentConfig(agentId);
    if (!current) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const updated = saveAgentConfig(agentId, updates);

    return new NextResponse(JSON.stringify({ success: true, config: updated }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
