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

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRetryable = error.status === 503 || 
                          error.status === 429 || 
                          error.message?.toLowerCase().includes('overloaded') ||
                          error.message?.toLowerCase().includes('quota') ||
                          error.message?.toLowerCase().includes('rate limit') ||
                          error.message?.toLowerCase().includes('capacity');
      
      if (attempt < maxRetries && isRetryable) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`[AI Proxy] Retryable error on attempt ${attempt + 1}/${maxRetries + 1}, waiting ${Math.round(delay)}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Non-retryable error or max retries reached
      throw error;
    }
  }
  
  throw lastError;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  const { prompt, systemInstruction, provider = 'gemini' } = req.body;
  const providersToTry = provider === 'openai' ? ['openai', 'gemini'] : ['gemini', 'openai'];
  const errors: Record<string, any> = {};

  for (const currentProvider of providersToTry) {
    try {
      if (currentProvider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (!apiKey) throw new Error("OpenAI API key missing in environment");
        
        console.log("[AI Proxy] Attempting OpenAI...");
        const openai = new OpenAI({ apiKey });
        
        const response = await retryWithBackoff(async () => {
          return await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          });
        });
        
        const text = response.choices[0].message.content;
        if (!text) throw new Error("OpenAI returned empty response");
        console.log("[AI Proxy] OpenAI successful!");
        return res.status(200).json({ text });
      } else {
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key missing in environment");

        console.log(`[AI Proxy] Attempting Gemini with key preview: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
        
        const result = await retryWithBackoff(async () => {
          return await model.generateContent(prompt);
        });
        
        const text = result.response.text();
        if (!text) throw new Error("Gemini returned empty response");
        console.log("[AI Proxy] Gemini successful!");
        return res.status(200).json({ text });
      }
    } catch (error: any) {
      console.warn(`[AI Proxy] ${currentProvider} failed:`, error.message);
      errors[currentProvider] = error;
    }
  }

  const geminiKeyToCheck = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
  const keyInfo = geminiKeyToCheck ? `Key preview: ${geminiKeyToCheck.substring(0, 8)}...${geminiKeyToCheck.substring(geminiKeyToCheck.length - 4)}` : "Key missing";
  
  // Format all accumulated errors
  const errorDetails = Object.entries(errors).map(([p, err]) => `[${p}]: ${(err as any).message}`).join(' | ');
  
  // Check if it's a capacity/quota error
  const isCapacityError = Object.values(errors).some((err: any) => 
    err.status === 503 || 
    err.status === 429 || 
    err.message?.toLowerCase().includes('overloaded') ||
    err.message?.toLowerCase().includes('quota') ||
    err.message?.toLowerCase().includes('rate limit') ||
    err.message?.toLowerCase().includes('capacity')
  );
  
  const errorMessage = isCapacityError 
    ? `AI capacity reached. All providers are currently overloaded. Please wait a moment and try again.`
    : `All AI providers failed. Gemini ${keyInfo}. Errors: ${errorDetails}`;
  
  return res.status(isCapacityError ? 503 : 500).json({ error: errorMessage, isCapacityError });
}
