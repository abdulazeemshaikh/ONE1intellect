
export interface NotionPage {
    id: string;
    url: string;
    properties: Record<string, any>;
    cover?: {
        type: string;
        external?: { url: string };
        file?: { url: string };
    };
    icon?: {
        type: string;
        emoji?: string;
        external?: { url: string };
        file?: { url: string };
    };
}

export interface NotionBlock {
    id: string;
    type: string;
    has_children: boolean;
    children?: NotionBlock[];
    [key: string]: any;
}

const NOTION_VERSION = "2022-06-28";

// Helper to fetch through proxy with correct headers
const notionFetch = async (path: string, options: RequestInit = {}) => {
    const apiKey = (import.meta.env.VITE_NOTION_API_KEY || '').trim();
    if (!apiKey || apiKey.includes('PLACEHOLDER')) {
        throw new Error('Notion API Key is missing');
    }

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Use serverless function with path as query param to avoid rewrite issues
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const response = await fetch(`/api/notion?path=${cleanPath}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`Notion API Error (${path}) [${response.status}]:`, errText);
        try {
            const errJson = JSON.parse(errText);
            if (errJson.message) {
                console.error("Notion Error Detail:", errJson.message);
            }
        } catch (e) { }
        throw new Error(`Notion API Error: ${response.status}`);
    }

    return response.json();
};

export const getPageDetails = async (pageId: string): Promise<NotionPage | null> => {
    try {
        return await notionFetch(`/pages/${pageId}`);
    } catch (e) {
        console.error("Error fetching page details", e);
        return null;
    }
};

export const searchNotionDatabase = async (query: string): Promise<NotionPage[]> => {
    const dbId = (import.meta.env.VITE_NOTION_DB_ID || '').trim();
    if (!dbId) return [];

    try {
        const data = await notionFetch(`/databases/${dbId}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filter: {
                    or: [
                        { property: "Name", title: { contains: query } }
                    ]
                },
                page_size: 50
            })
        });
        return data.results as NotionPage[];
    } catch (error) {
        console.error("Notion Search Error:", error);
        return [];
    }
};

export const getDatabaseStats = async (): Promise<{ count: number }> => {
    const dbId = (import.meta.env.VITE_NOTION_DB_ID || '').trim();
    if (!dbId) return { count: 0 };

    try {
        const data = await notionFetch(`/databases/${dbId}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page_size: 100 })
        });
        return { count: data.results.length };
    } catch (e) {
        console.warn("Failed to get DB stats", e);
        return { count: 0 };
    }
};

export const getPageBlocks = async (blockId: string): Promise<NotionBlock[]> => {
    try {
        const data = await notionFetch(`/blocks/${blockId}/children?page_size=100`);
        const blocks = data.results as NotionBlock[];

        // Fetch children recursively for container blocks
        const blocksWithChildren = await Promise.all(blocks.map(async (block) => {
            const containerTypes = ['column_list', 'column', 'toggle', 'callout', 'synced_block', 'quote'];
            if (block.has_children && containerTypes.includes(block.type)) {
                try {
                    const children = await getPageBlocks(block.id);
                    return { ...block, children };
                } catch (e) {
                    console.warn(`Failed to fetch children for block ${block.id}`, e);
                    return block;
                }
            }
            return block;
        }));

        return blocksWithChildren;
    } catch (e) {
        console.error("Error fetching page blocks", e);
        return [];
    }
};

// Legacy support
export const getPageContent = async (pageId: string): Promise<string> => {
    const blocks = await getPageBlocks(pageId);
    return blocks.map((block: any) => {
        const type = block.type;
        if (block[type] && block[type].rich_text) {
            return block[type].rich_text.map((t: any) => t.plain_text).join('');
        }
        return "";
    }).join('\n\n');
};
