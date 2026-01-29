import { NextResponse } from 'next/server';
import { getAgentConfig, getSession, updateSession } from '@/lib/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '*';
  
  try {
    const body = await request.json();
    const { agentId, sessionId, message, history } = body;

    if (!agentId || !sessionId || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const agent = getAgentConfig(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const session = getSession(sessionId, agentId);
    
    // GATING LOGIC
    // Strike 1 & 2 are free. Strike 3 is blocked.
    // We only count "property specific" questions (heavily simplified here -> we count ALL questions for MVP)
    const isGated = agent.securityEnabled && (session.messageCount >= (agent.gatingThreshold || 2));
    
    if (isGated && !session.isGated) {
      // First time hitting the gate
      updateSession(sessionId, { isGated: true });
      return NextResponse.json({ 
        role: 'assistant', 
        content: "That's an excellent question. To provide you with the full specialist report and ensure you get priority for a viewing, may I get your name and mobile number? I'll have the agent reach out to you immediately.",
        isGated: true
      }, { headers: corsHeaders(origin) });
    }

    if (session.isGated) {
        // If they keep chatting without submitting leads, we just remind them
         return NextResponse.json({ 
            role: 'assistant', 
            content: "Please provide your contact details above so I can unlock the full property report for you.",
            isGated: true
        }, { headers: corsHeaders(origin) });
    }

    // AI LOGIC
    let reply = "";
    if (process.env.GOOGLE_API_KEY || agent.apiKey) {
      try {
        const apiKey = agent.apiKey || process.env.GOOGLE_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const systemPrompt = `You are a helpful real estate assistant for ${agent.name} of ${agent.agencyName}. 
        Keep answers short (under 50 words). Be professional and polite. 
        Agent Bio: ${agent.bio}`;

        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 150 }
        });

        // Send system prompt context via message history trick or just prepend
        const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
        reply = result.response.text();
      } catch (err) {
        console.error("AI Error:", err);
        reply = "I'm having trouble connecting to the AI brain right now. Please try again in a moment.";
      }
    } else {
        // Fallback Mock Response
        reply = `(Mock AI for ${agent.name}): I see you're interested in "${message}". As a luxury agent, I can help with that!`;
    }

    // Update Session
    updateSession(sessionId, { messageCount: session.messageCount + 1 });

    return NextResponse.json({ 
        role: 'assistant', 
        content: reply,
        isGated: false
    }, { headers: corsHeaders(origin) });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

function corsHeaders(origin: string) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
