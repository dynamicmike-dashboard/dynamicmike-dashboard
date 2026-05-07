import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || '*';
  // Global CORS - Dynamic Origin Echo
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const { prompt, systemInstruction, provider = 'openai' } = req.body;

    if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return res.status(200).json({ text: response.choices[0].message.content });
    } else {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
      const result = await model.generateContent(prompt);
      return res.status(200).json({ text: result.response.text() });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
