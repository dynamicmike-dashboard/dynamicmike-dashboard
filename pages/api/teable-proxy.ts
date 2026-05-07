import type { NextApiRequest, NextApiResponse } from 'next';

const TEABLE_API_URLS = [
  'https://app.teable.io/api',
  'https://app.teable.ai/api'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Global CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const { path, method, body } = req.body;
    const apiKey = process.env.TEABLE_API_KEY || process.env.VITE_TEABLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Teable Key Missing" });
    }

    const tryRequest = async (baseUrl: string) => {
      return fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    let response = await tryRequest(TEABLE_API_URLS[0]);
    if (!response.ok && (response.status === 404 || response.status >= 500)) {
      response = await tryRequest(TEABLE_API_URLS[1]);
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
