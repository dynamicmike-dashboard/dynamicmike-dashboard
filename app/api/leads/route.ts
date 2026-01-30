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

    // agentId SHOULD be the UUID from the embed code
    if (!agentId || !name || !phone) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Initialize Supabase Admin Client (Service Role)
    // We MUST use the service role key to bypass RLS because the visitor is anonymous
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; // Fallback to Anon (might fail RLS)

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing Supabase Config");
        return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabase.from('leads').insert([{
        user_id: agentId, // The widget sends the UUID now
        name: name,
        phone: phone,
        chat_summary: interest || 'Widget Inquiry',
        status: 'New'
    }]).select();

    if (error) {
        console.error("Supabase Insert Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data[0] }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error: any) {
    console.error("Server Error:", error);
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
