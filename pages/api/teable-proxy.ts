import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
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
      return res.status(400).json({ error: "Path Missing", receivedBody: req.body });
    }

    const teableUrl = `https://app.teable.ai/api${path}`;
    
    console.log(`Proxying ${method} to ${teableUrl}`);

    const response = await axios({
      url: teableUrl,
      method: method as any,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      data: (method !== 'GET' && method !== 'DELETE') ? body : undefined,
      validateStatus: () => true, // Don't throw on error statuses
    });

    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error("Teable Proxy Error:", error.message);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
