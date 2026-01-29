import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { message, propertyId, history } = await request.json();

    // 1. SUPABASE CHECK: Fetch Property Data
    // We assume the frontend passes a 'propertyId' or we infer it from context.
    // For this strict mode, we require a valid property record in DB.
    
    let propertyContext = null;

    if (propertyId) {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('property_id', propertyId) // Assuming column name is property_id or similar
            .single();
        
        if (!error && data) {
            propertyContext = data;
        }
    }

    // 2. NO HALLUCINATION RULE
    // If we don't have the data, we strictly reject answering specific details.
    
    if (!propertyContext && propertyId) {
        // We know which property they asked about, but have no data.
        return NextResponse.json({ 
            role: 'assistant', 
            content: "I'm sorry, I don't have the verified details for that property in my vault yet. I've alerted the agent to contact you with the specifics." 
        });
    }

    // 3. GENERATE AI RESPONSE
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "AI Service Unavailable" }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `
    You are EstateGuard, a helpful but strict real estate assistant.
    
    CRITICAL PROTOCOL: "NO HALLUCINATIONS"
    1. You have access to the following OFFICIAL PROPERTY DATA:
    ${JSON.stringify(propertyContext || {}, null, 2)}
    
    2. Answer the user's question using ONLY the data above.
    
    3. If the user asks for a detail (like HOA fees, square footage, specific appliances) that is NOT in the data above, you MUST say:
       "I don't have that verified detail on file, but I've alerted the agent to call you."
    
    4. Do not guess. Do not assume standard features (e.g., don't say "it has a kitchen" if listed_details doesn't mention it, though safe assumptions like "it has a roof" are fine).
    
    5. Be concise and professional.
    `;

    const chat = model.startChat({
        history: history || [],
        generationConfig: { maxOutputTokens: 200 }
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser Question: ${message}`);
    const reply = result.response.text();

    return NextResponse.json({ role: 'assistant', content: reply });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
