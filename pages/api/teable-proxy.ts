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
