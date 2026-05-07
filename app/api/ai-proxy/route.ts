import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { prompt, systemInstruction, provider = 'openai' } = await request.json();

    if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OpenAI Key Missing in Environment" }, { status: 500 });

      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      return NextResponse.json({ text: response.choices[0].message.content });
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "Gemini Key Missing in Environment" }, { status: 500 });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
      const result = await model.generateContent(prompt);
      return NextResponse.json({ text: result.response.text() });
    }
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
