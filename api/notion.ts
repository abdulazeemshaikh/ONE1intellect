import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const path = req.query.path as string;
    const apiKey = process.env.VITE_NOTION_API_KEY;
    const notionVersion = '2022-06-28';

    if (!apiKey) {
        return res.status(500).json({ error: 'Missing Notion API Key in environment' });
    }

    try {
        const url = `https://api.notion.com/v1/${path}`;

        // Forward the request to Notion
        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Notion-Version': notionVersion,
                'Content-Type': 'application/json',
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error: any) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
