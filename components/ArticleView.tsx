import React, { useEffect, useState, useRef } from 'react';
import { SearchResultItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Network, List, ChevronRight } from 'lucide-react';
import { getPageBlocks, NotionBlock } from '../services/notionService';
import mermaid from 'mermaid';

interface ArticleViewProps {
    article: SearchResultItem;
    onBack: () => void;
}

// Mermaid Component
const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderChart = async () => {
            if (ref.current) {
                try {
                    mermaid.initialize({
                        startOnLoad: false,
                        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
                        securityLevel: 'loose'
                    });
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    if (ref.current) ref.current.innerHTML = svg;
                    setError(null);
                } catch (err) {
                    console.error("Mermaid Render Error", err);
                    setError("Failed to render diagram");
                }
            }
        };
        renderChart();
    }, [chart]);

    if (error) return <div className="p-4 bg-red-500/10 text-red-500 rounded-lg text-xs font-mono">{error}</div>;
    return <div ref={ref} className="flex justify-center my-8 overflow-x-auto bg-white/50 dark:bg-white/5 rounded-xl p-6 backdrop-blur-sm shadow-sm" />;
};

// Rich Text Renderer
const renderRichText = (richText: any[]) => {
    if (!richText) return null;
    return richText.map((text, i) => {
        const { annotations, text: textContent, href } = text;
        const style: React.CSSProperties = {
            fontWeight: annotations.bold ? 'bold' : 'normal',
            fontStyle: annotations.italic ? 'italic' : 'normal',
            textDecoration: annotations.underline ? 'underline' : 'none',
            color: annotations.color !== 'default' ? annotations.color : undefined,
        };
        if (annotations.code) {
            return <code key={i} className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">{textContent.content}</code>;
        }
        if (href) {
            return (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" style={style}>
                    {textContent.content}
                </a>
            );
        }
        return <span key={i} style={style}>{textContent.content}</span>;
    });
};

// Block Renderer
const NotionBlockRenderer: React.FC<{ block: NotionBlock }> = ({ block }) => {
    const type = block.type;
    const data = block[type];
    if (!data) return null;

    switch (type) {
        case 'paragraph':
            return <p className="text-lg leading-8 text-ink/80 mb-6">{renderRichText(data.rich_text)}</p>;
        case 'heading_1':
            return <h1 id={block.id} className="text-4xl font-bold mt-12 mb-6 text-ink border-b border-black/5 dark:border-white/5 pb-2">{renderRichText(data.rich_text)}</h1>;
        case 'heading_2':
            return <h2 id={block.id} className="text-3xl font-bold mt-10 mb-5 text-ink">{renderRichText(data.rich_text)}</h2>;
        case 'heading_3':
            return <h3 id={block.id} className="text-2xl font-bold mt-8 mb-4 text-ink">{renderRichText(data.rich_text)}</h3>;
        case 'bulleted_list_item':
            return (
                <li className="ml-6 text-lg text-ink/80 mb-2 list-disc marker:text-subtle">
                    {renderRichText(data.rich_text)}
                </li>
            );
        case 'numbered_list_item':
            return (
                <li className="ml-6 text-lg text-ink/80 mb-2 list-decimal marker:text-subtle">
                    {renderRichText(data.rich_text)}
                </li>
            );
        case 'code':
            if (data.language === 'mermaid') {
                const code = data.rich_text.map((t: any) => t.plain_text).join('');
                return <Mermaid chart={code} />;
            }
            return (
                <div className="relative group my-8">
                    <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-mono text-subtle uppercase tracking-widest bg-black/5 dark:bg-white/5 rounded-bl-lg">
                        {data.language}
                    </div>
                    <pre className="bg-black/[0.03] dark:bg-white/[0.03] p-6 rounded-2xl overflow-x-auto text-sm font-mono border border-black/5 dark:border-white/5 shadow-inner">
                        <code>{data.rich_text.map((t: any) => t.plain_text).join('')}</code>
                    </pre>
                </div>
            );
        case 'image':
            const url = data.type === 'external' ? data.external.url : data.file.url;
            return (
                <figure className="my-10">
                    <img src={url} alt="Notion Image" className="rounded-2xl w-full shadow-lg border border-black/5 dark:border-white/5" />
                    {data.caption && data.caption.length > 0 && (
                        <figcaption className="text-center text-sm text-subtle mt-3 font-medium italic">
                            {renderRichText(data.caption)}
                        </figcaption>
                    )}
                </figure>
            );
        case 'quote':
            return (
                <blockquote className="border-l-4 border-ink/20 pl-6 py-2 my-8 italic text-xl text-ink/70 bg-black/5 dark:bg-white/5 rounded-r-xl pr-6">
                    {renderRichText(data.rich_text)}
                </blockquote>
            );
        case 'divider':
            return <hr className="my-12 border-t border-black/5 dark:border-white/5" />;
        case 'callout':
            return (
                <div className="flex gap-4 p-6 bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/10 rounded-2xl my-8">
                    {data.icon && <span className="text-2xl">{data.icon.emoji || 'ℹ️'}</span>}
                    <div className="text-lg leading-relaxed">{renderRichText(data.rich_text)}</div>
                </div>
            );
        default:
            return null;
    }
};

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
    const [blocks, setBlocks] = useState<NotionBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>("");
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadBlocks = async () => {
            setLoading(true);
            const data = await getPageBlocks(article.id);
            setBlocks(data);
            setLoading(false);
        };
        loadBlocks();
    }, [article.id]);

    const headings = blocks.filter(b => b.type.startsWith('heading_')).map(b => ({
        id: b.id,
        text: b[b.type].rich_text.map((t: any) => t.plain_text).join(''),
        level: parseInt(b.type.split('_')[1])
    }));

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Adjusted for header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveSection(id);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 relative">

            {/* Sidebar ToC */}
            <aside className="hidden md:block w-72 shrink-0 h-fit sticky top-32">
                <div className="flex items-center gap-2 mb-6 text-ink/40 uppercase tracking-[0.2em] text-[10px] font-bold">
                    <List className="w-3 h-3" />
                    Table of Contents
                </div>
                <nav className="space-y-1">
                    {headings.length > 0 ? (
                        headings.map((heading) => (
                            <button
                                key={heading.id}
                                onClick={() => scrollToHeading(heading.id)}
                                className={`
                                    group w-full text-left flex items-center gap-2 py-2 px-3 rounded-lg transition-all
                                    ${activeSection === heading.id
                                        ? 'bg-black/5 dark:bg-white/10 text-ink translate-x-1'
                                        : 'text-subtle hover:text-ink hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                                    }
                                `}
                                style={{ paddingLeft: `${heading.level * 0.75}rem` }}
                            >
                                <ChevronRight className={`w-3 h-3 transition-transform ${activeSection === heading.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                <span className="text-sm font-medium line-clamp-2">{heading.text}</span>
                            </button>
                        ))
                    ) : (
                        <p className="text-xs text-subtle/50 italic px-3">No headings found</p>
                    )}
                </nav>

                <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-3 text-subtle hover:text-ink transition-all group px-3 py-2 rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Back to Search</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 min-w-0"
                ref={contentRef}
            >
                {/* Mobile Back Button */}
                <button
                    onClick={onBack}
                    className="md:hidden flex items-center gap-2 text-subtle hover:text-ink transition-colors mb-8 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Results
                </button>

                {/* Head Part */}
                <div className="mb-16">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-subtle/60 mb-6">
                        <span className="flex items-center gap-2 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full text-ink/70">
                            <Network className="w-3.5 h-3.5" />
                            {article.category}
                        </span>
                        {article.createdDate && (
                            <span className="flex items-center gap-2 border border-black/5 dark:border-white/10 px-3 py-1.5 rounded-full">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(article.createdDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-sans font-bold text-ink leading-[1.1] mb-8 tracking-tight">
                        {article.title}
                    </h1>

                    <AnimatePresence>
                        {article.summary && article.summary !== "No summary available." && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-8 bg-black/[0.02] dark:bg-white/[0.02] border-l-4 border-ink/10 rounded-r-3xl text-ink/80 text-xl font-serif leading-relaxed italic"
                            >
                                {article.summary}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notion Content */}
                <div className="prose prose-xl prose-neutral dark:prose-invert max-w-none font-serif">
                    {loading ? (
                        <div className="space-y-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className={`h-4 bg-black/5 dark:bg-white/5 rounded-full animate-pulse transition-all`} style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                            ))}
                        </div>
                    ) : (
                        <div className="content-area">
                            {blocks.length > 0 ? (
                                blocks.map(block => <NotionBlockRenderer key={block.id} block={block} />)
                            ) : (
                                <div className="py-20 text-center opacity-30 select-none">
                                    <List className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-sans font-medium">This article has no detailed content yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Spacer */}
                <div className="h-32" />
            </motion.main>

        </div>
    );
};

export default ArticleView;
