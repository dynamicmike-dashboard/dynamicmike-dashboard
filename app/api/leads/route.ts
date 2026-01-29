import { NextResponse } from 'next/server';
import { saveLead, getLeads } from '@/lib/storage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const origin = request.headers.get('origin') || '*';

  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  }

  const leads = getLeads(agentId);

  return new NextResponse(JSON.stringify({ success: true, leads }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '*';
  
  try {
    const body = await request.json();
    const { agentId, name, phone, interest } = body;

    if (!agentId || !name || !phone) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const savedLead = saveLead({
      agentId,
      name,
      phone,
      interest: interest || 'General Inquiry'
    });

    return new NextResponse(JSON.stringify({ success: true, lead: savedLead }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
