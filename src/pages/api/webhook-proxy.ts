import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const WEBHOOK_URL = "https://934589f2f60f.ngrok.app/webhook/345d800a-103d-4a42-bbf8-47bc757c4487";

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await axios.post(WEBHOOK_URL, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Proxy error:', error.response?.data || error.message);
      return res.status(error.response?.status || 500).json(error.response?.data);
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}