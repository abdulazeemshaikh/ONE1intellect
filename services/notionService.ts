
export interface NotionPage {
    id: string;
    url: string;
    properties: Record<string, any>;
}

export interface NotionBlock {
    id: string;
    type: string;
    [key: string]: any;
}

const NOTION_VERSION = "2022-06-28";

export const searchNotionDatabase = async (query: string): Promise<NotionPage[]> => {
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    const dbId = import.meta.env.VITE_NOTION_DB_ID;

    if (!apiKey || apiKey.includes('PLACEHOLDER')) {
        console.warn('Notion API Key is missing');
        return [];
    }

    try {
        const response = await fetch(`/api/notion/databases/${dbId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_VERSION
            },
            body: JSON.stringify({
                filter: {
                    or: [
                        {
                            property: "Name",
                            title: {
                                contains: query
                            }
                        }
                    ]
                },
                page_size: 50
            })
        });

        if (!response.ok) {
            console.error("Notion Search Error", await response.text());
            return [];
        }

        const data = await response.json();
        return data.results as NotionPage[];

    } catch (error) {
        console.error("Notion Fetch Error:", error);
        return [];
    }
};

export const getDatabaseStats = async (): Promise<{ count: number }> => {
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    const dbId = import.meta.env.VITE_NOTION_DB_ID;

    if (!apiKey || apiKey.includes('PLACEHOLDER')) return { count: 0 };

    try {
        const response = await fetch(`/api/notion/databases/${dbId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Notion-Version': NOTION_VERSION
            },
            body: JSON.stringify({
                page_size: 100
            })
        });

        if (!response.ok) return { count: 0 };
        const data = await response.json();
        return { count: data.results.length };

    } catch (e) {
        console.warn("Failed to get DB stats", e);
        return { count: 0 };
    }
};

export const getPageBlocks = async (blockId: string): Promise<NotionBlock[]> => {
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    if (!apiKey || apiKey.includes('PLACEHOLDER')) return [];

    try {
        const response = await fetch(`/api/notion/blocks/${blockId}/children?page_size=100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Notion-Version': NOTION_VERSION
            }
        });

        if (!response.ok) return [];

        const data = await response.json();
        const blocks = data.results as NotionBlock[];

        // Fetch children for blocks that have them (like toggles, nested lists)
        // For breadcrumbs/ToC we mainly need top-level headings, but for "full replica" we might need more.
        // For now, let's keep it to top level to avoid rate limits, but handle main types.

        return blocks;

    } catch (e) {
        console.error("Error fetching page blocks", e);
        return [];
    }
}

// Old method for compatibility if used elsewhere, but redirected to content extraction
export const getPageContent = async (pageId: string): Promise<string> => {
    const blocks = await getPageBlocks(pageId);
    return blocks.map((block: any) => {
        const type = block.type;
        if (block[type] && block[type].rich_text) {
            return block[type].rich_text.map((t: any) => t.plain_text).join('');
        }
        return "";
    }).join('\n\n');
}
