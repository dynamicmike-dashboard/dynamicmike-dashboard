import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
// @ts-ignore
import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: true,
  credentials: true,
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  const { prompt, systemInstruction, provider = 'gemini' } = req.body;
  const providersToTry = provider === 'openai' ? ['openai', 'gemini'] : ['gemini', 'openai'];
  let lastError: any = null;

  for (const currentProvider of providersToTry) {
    try {
      if (currentProvider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (!apiKey) throw new Error("OpenAI API key missing in environment");
        
        console.log("[AI Proxy] Attempting OpenAI...");
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        });
        const text = response.choices[0].message.content;
        if (!text) throw new Error("OpenAI returned empty response");
        console.log("[AI Proxy] OpenAI successful!");
        return res.status(200).json({ text });
      } else {
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key missing in environment");

        console.log("[AI Proxy] Attempting Gemini...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text) throw new Error("Gemini returned empty response");
        console.log("[AI Proxy] Gemini successful!");
        return res.status(200).json({ text });
      }
    } catch (error: any) {
      console.warn(`[AI Proxy] ${currentProvider} failed:`, error.message);
      lastError = error;
    }
  }

  console.error("[AI Proxy] All providers failed. Last error:", lastError?.message);
  return res.status(500).json({ error: `All AI providers failed. Last error: ${lastError?.message}` });
}
