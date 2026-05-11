import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log incoming request for deep debugging
  console.log(`[proxy] ${req.method} request received for path: ${req.body?.path}`);
  if (req.method !== 'GET') {
    console.log(`[proxy] Body snippet:`, JSON.stringify(req.body).slice(0, 200));
  }

  // Add CORS headers for the subdomain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path, method, body: payload } = req.body;
    
    const API_KEY = process.env.VITE_TEABLE_API_KEY;
    const BASE_ID = process.env.VITE_TEABLE_BASE_ID || "bseh6jGRNi3tcO1Dvw0";

    if (!API_KEY) {
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    const tryRequest = async (baseUrl: string) => {
      const url = `${baseUrl}/api${path}`;
      console.log(`Proxying ${method} to ${url}`);
      
      return fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: (method !== 'GET' && method !== 'DELETE' && payload) ? JSON.stringify(payload) : undefined,
      });
    };

    let response = await tryRequest('https://app.teable.ai');
    
    if (!response.ok && (response.status === 404 || response.status >= 500)) {
      response = await tryRequest('https://api.teable.io/v1');
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { raw: responseText };
    }
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Teable API Error',
        details: { ...data, apiKeyPrefix: API_KEY.substring(0, 10) },
        status: response.status
      });
    }

    return res.status(response.status).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
