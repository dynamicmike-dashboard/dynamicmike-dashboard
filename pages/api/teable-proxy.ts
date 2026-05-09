import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: true, // Echoes back the origin
  credentials: true,
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

const TEABLE_API_URLS = [
  'https://app.teable.io/api',
  'https://app.teable.ai/api'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  try {
    const { path, method, body } = req.body || {};
    const apiKey = process.env.TEABLE_API_KEY || process.env.VITE_TEABLE_API_KEY;

    if (!apiKey) {
      console.error("Teable Proxy: API Key Missing");
      return res.status(500).json({ error: "Teable Key Missing" });
    }

    if (!path) {
      console.error("Teable Proxy: Path Missing in request body", req.body);
      return res.status(400).json({ error: "Path Missing", receivedBody: req.body });
    }

    const tryRequest = async (url: string) => {
      return fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: (method !== 'GET' && method !== 'DELETE' && body) ? JSON.stringify(body) : undefined,
      });
    };

    // The host api.teable.io does not resolve. Using app.teable.ai which is confirmed working.
    const url = `https://app.teable.ai/api${path}`;
    
    let response = await tryRequest(url);
    
    // Failover to .io just in case, but .ai is the primary
    if (!response.ok && (response.status === 404 || response.status >= 500)) {
      response = await tryRequest(`https://api.teable.io/v1${path}`);
    }

    // Handle non-JSON or empty responses
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Teable Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
