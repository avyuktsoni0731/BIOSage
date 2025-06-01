import type { NextApiRequest, NextApiResponse } from 'next';

// /pages/api/llm-status.ts

interface ErrorResponse {
    status: 'error';
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<void | ErrorResponse>
) {
    try {
        const upstreamRes: Response = await fetch('https://bachelor-expressed-consulting-port.trycloudflare.com', {
            method: 'GET',
        });

        res.status(upstreamRes.status).end(); // just forward the status
    } catch (error) {
        console.error('Error connecting to LLM:', error);
        res.status(500).json({ status: 'error' });
    }
}
