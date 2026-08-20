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
  maxRetries: number = 2,
  baseDelay: number = 500
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
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
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

// Try multiple models for a provider
async function tryModels<T>(
  models: string[],
  attemptFn: (model: string) => Promise<T>
): Promise<T> {
  let lastError: any;
  
  for (const model of models) {
    try {
      console.log(`[AI Proxy] Trying model: ${model}`);
      return await attemptFn(model);
    } catch (error: any) {
      console.warn(`[AI Proxy] Model ${model} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }
  
  throw lastError;
}

// Try OpenRouter (OpenAI-compatible API with 300+ models)
async function tryOpenRouter(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OpenRouter API key missing in environment");
  
  console.log("[AI Proxy] Attempting OpenRouter with model fallbacks...");
  const openrouter = new OpenAI({ 
    apiKey, 
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://dynamicmike.com",
      "X-Title": "TM Agenda Builder"
    }
  });
  
  // OpenRouter free/cheap models that support JSON mode
  const models = [
    'google/gemini-flash-1.5',           // Free tier
    'google/gemini-flash-1.5-8b',        // Free tier
    'anthropic/claude-3.5-haiku',        // Cheap, fast
    'openai/gpt-4o-mini',                // Cheap
    'meta-llama/llama-3.1-8b-instruct',  // Free tier
    'mistralai/mistral-nemo',            // Free tier
  ];
  
  const response = await tryModels(models, async (model) => {
    return await retryWithBackoff(async () => {
      return await openrouter.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
    });
  });
  
  const text = response.choices[0].message.content;
  if (!text) throw new Error("OpenRouter returned empty response");
  console.log("[AI Proxy] OpenRouter successful!");
  return text;
}

// Try OpenCode (OpenAI-compatible API)
async function tryOpenCode(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = process.env.OPENCODE_API_KEY || process.env.VITE_OPENCODE_API_KEY;
  if (!apiKey) throw new Error("OpenCode API key missing in environment");
  
  console.log("[AI Proxy] Attempting OpenCode with model fallbacks...");
  const opencode = new OpenAI({ 
    apiKey, 
    baseURL: "https://opencode.ai/inference/openai/v1",
  });
  
  // OpenCode models - adjust based on what's available via their inference API
  const models = [
    'gpt-4o',                     // Primary
    'gpt-4o-mini',                // Faster/cheaper
    'claude-3.5-sonnet',          // Anthropic via OpenCode
  ];
  
  const response = await tryModels(models, async (model) => {
    return await retryWithBackoff(async () => {
      return await opencode.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
    });
  });
  
  const text = response.choices[0].message.content;
  if (!text) throw new Error("OpenCode returned empty response");
  console.log("[AI Proxy] OpenCode successful!");
  return text;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  const { prompt, systemInstruction, provider = 'gemini' } = req.body;
  // Try: Gemini → OpenAI → OpenRouter → OpenCode (4 providers, 100s of models)
  const providersToTry = provider === 'openai' ? ['openai', 'gemini', 'openrouter', 'opencode'] : ['gemini', 'openai', 'openrouter', 'opencode'];
  const errors: Record<string, any> = {};

  // Model fallbacks per provider (ordered by preference)
  const modelFallbacks: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    gemini: ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro']
  };

  for (const currentProvider of providersToTry) {
    try {
      if (currentProvider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (!apiKey) throw new Error("OpenAI API key missing in environment");
        
        console.log("[AI Proxy] Attempting OpenAI with model fallbacks...");
        const openai = new OpenAI({ apiKey });
        
        const response = await tryModels(modelFallbacks.openai, async (model) => {
          return await retryWithBackoff(async () => {
            return await openai.chat.completions.create({
              model,
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
              ],
              response_format: { type: "json_object" }
            });
          });
        });
        
        const text = response.choices[0].message.content;
        if (!text) throw new Error("OpenAI returned empty response");
        console.log("[AI Proxy] OpenAI successful!");
        return res.status(200).json({ text });
      } else if (currentProvider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key missing in environment");

        console.log(`[AI Proxy] Attempting Gemini with key preview: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const result = await tryModels(modelFallbacks.gemini, async (model) => {
          const geminiModel = genAI.getGenerativeModel({ model, systemInstruction });
          return await retryWithBackoff(async () => {
            return await geminiModel.generateContent(prompt);
          });
        });
        
        const text = result.response.text();
        if (!text) throw new Error("Gemini returned empty response");
        console.log("[AI Proxy] Gemini successful!");
        return res.status(200).json({ text });
      } else if (currentProvider === 'openrouter') {
        const text = await tryOpenRouter(prompt, systemInstruction);
        return res.status(200).json({ text });
      } else if (currentProvider === 'opencode') {
        const text = await tryOpenCode(prompt, systemInstruction);
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
  
  const isNetworkError = Object.values(errors).some((err: any) => 
    err.message?.toLowerCase().includes('fetch') ||
    err.message?.toLowerCase().includes('network') ||
    err.message?.toLowerCase().includes('timeout') ||
    err.message?.toLowerCase().includes('econnreset') ||
    err.message?.toLowerCase().includes('etimedout')
  );
  
  let errorMessage: string;
  let statusCode: number;
  
  if (isCapacityError) {
    errorMessage = `AI capacity reached. All providers/models (Gemini, OpenAI, OpenRouter, OpenCode) are currently overloaded. Please wait a moment and try again.`;
    statusCode = 503;
  } else if (isNetworkError) {
    errorMessage = `Network error connecting to AI providers. Please check your connection and try again. Errors: ${errorDetails}`;
    statusCode = 502;
  } else {
    errorMessage = `All AI providers failed. Gemini ${keyInfo}. Errors: ${errorDetails}`;
    statusCode = 500;
  }
  
  return res.status(statusCode).json({ error: errorMessage, isCapacityError, isNetworkError });
}
