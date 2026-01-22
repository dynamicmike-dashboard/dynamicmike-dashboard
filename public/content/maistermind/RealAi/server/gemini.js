const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Store chat history in memory (for demo purposes)
// In production, use Redis or a database.
const chatSessions = {}; 

const SYSTEM_INSTRUCTION = `
You are a high-end Real Estate Lead-Gating Assistant named "RealAi".
Your Goal: Answer initial interest with a teaser, then STRICTLY gate deep data until the user provides their contact info.

PROTOCOL:
1. **The Hook**: If this is the FIRST interaction or the user asks about a property, provide a 1-sentence TEASER based on general knowledge (or specific property data if provided). Make it sound exclusive.
   - IMMEDIATELY after the teaser, ask Question 1.
2. **The Gate**: Do NOT reveal address, floor plans, or direct specs yet.
3. **Magic 3 Sequence**:
   - Question 1: "To unlock the full specs and viewing schedule, are you a cash buyer or do you have a pre-approval letter?"
   - Question 2: "Is your move-in timeline within 60 days?"
   - Question 3: "What is your name and mobile number so [Agent Name] can text you the private access link?"

RULES:
- If the user answers Q1, move to Q2.
- If the user answers Q2, move to Q3.
- If the user answers Q3 (provides name/phone), respond with: "Thank you. [Agent Name] has been notified and will text you the private link shortly." and trigger the "LEAD_CAPTURED" flag.
- Do NOT deviate. Do not answer other questions until the sequence is complete.
`;

async function handleChat(sessionId, message, stage) {
    if (!chatSessions[sessionId]) {
        chatSessions[sessionId] = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "System System Instruction: " + SYSTEM_INSTRUCTION }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to act as the RealAi Gatekeeper." }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 150,
            },
        });
    }

    const chat = chatSessions[sessionId];
    
    // Send user message
    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    // specific logic to determine next stage based on simple heuristics or model output could be added here
    // For now, we rely on the model following the prompt.
    // However, to update the frontend state 'stage', we might need to parse the response or keep track of turn count.
    
    let nextStage = stage;
    if (stage === 'HOOK') nextStage = 'Q1';
    else if (stage === 'Q1') nextStage = 'Q2';
    else if (stage === 'Q2') nextStage = 'Q3';
    else if (stage === 'Q3') nextStage = 'DONE';

    return {
        reply: text,
        nextStage: nextStage
    };
}

const VOICE_PARSER_INSTRUCTION = `
You are the RealAi Property Architect. Your task is to listen to a Realtor's voice transcription and extract property data into a structured JSON format.

STRICT SCHEMA: { 'address': 'string', 'price': 'number', 'bedrooms': 'number', 'bathrooms': 'number', 'sq_ft': 'number', 'unique_features': ['string'], 'status': 'Draft' }

LOGIC: 
1. If a value is missing, return 'null' for that key. 
2. Convert all text-based numbers (e.g., 'three') to integers (3). 
3. If the agent mentions a feature like 'pool' or 'view', add it to the unique_features array. 
4. Do not include any conversational text in the output; return ONLY the JSON.
`;

async function parseVoiceToProperty(transcription) {
    // We use a new chat or generation call. Since it's a one-off task, calculate result.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent([
        VOICE_PARSER_INSTRUCTION,
        `INPUT: "${transcription}"`
    ]);
    const response = result.response;
    const text = response.text();
    
    // Clean markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse Gemini JSON", e);
        return { error: "Failed to parse property data" };
    }
}

module.exports = { handleChat, parseVoiceToProperty };
