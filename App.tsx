import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Network, Type, Lightbulb, Footprints, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSearch from './components/HeroSearch';
import CategoryCard from './components/CategoryCard';
import CategoryToggle from './components/CategoryToggle';
import ResultView from './components/ResultView';
import ArticleView from './components/ArticleView';
import { SearchResultItem } from './types';
import { getDatabaseStats } from './services/notionService';

// Category Data Configuration
const CATEGORIES_DATA = [
  {
    id: 'knowledge',
    label: 'Knowledge',
    fullLabel: 'Knowledge Base',
    icon: Network,
    description: "A comprehensive, verified encyclopedia of everything about the universe, world, reality, systems, and concepts.",
  },
  {
    id: 'language',
    label: 'Dictionary',
    fullLabel: 'Language & Meaning',
    icon: Type,
    description: "What words, ideas, and symbols truly mean.",
  },
  {
    id: 'insights',
    label: 'Insights',
    fullLabel: 'Insight Articles',
    icon: Lightbulb,
    description: "Deep thinking about how the world works.",
  },
  {
    id: 'guides',
    label: 'Guides',
    fullLabel: 'Life Guides',
    icon: Footprints,
    description: "Practical answers to real human problems.",
  }
];

function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[] | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<SearchResultItem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [articleCount, setArticleCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('knowledge');

  // Fetch real stats from Notion
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getDatabaseStats();
        setArticleCount(stats.count);
      } catch (e) {
        console.error("Failed to fetch article count", e);
        setArticleCount(0);
      }
    };
    fetchStats();
  }, []);

  // Initialize theme based on system preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply theme class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearchStart = () => {
    setIsSearching(true);
    setSearchResults(null);
    setSelectedArticle(null);
  };

  const handleSearchComplete = (results: SearchResultItem[]) => {
    setIsSearching(false);
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSelectedArticle(null);
    setIsSearching(false);
  };

  const handleArticleSelect = (article: SearchResultItem) => {
    setSelectedArticle(article);
  };

  const handleBackToResults = () => {
    setSelectedArticle(null);
  };

  const selectedCategoryData = CATEGORIES_DATA.find(c => c.id === activeCategory);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-sans selection:bg-ink selection:text-paper relative overflow-x-hidden transition-colors duration-500">

        {/* Theme Toggle - Top Right */}
        <div className="absolute top-6 right-6 md:right-12 z-50">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-ink/70 hover:text-ink transition-all duration-300"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 stroke-[1.5]" />
            ) : (
              <Sun className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>
        </div>

        <main className={`flex-1 w-full mx-auto px-6 md:px-8 flex flex-col justify-center pb-6 pt-2 relative z-10 transition-all duration-500 ${selectedArticle ? 'max-w-7xl' : 'max-w-5xl'}`}>

          <HeroSearch
            onSearchStart={handleSearchStart}
            onSearchComplete={handleSearchComplete}
            isSearching={isSearching}
            compact={!!searchResults || !!selectedArticle}
          />

          {/* Dynamic Content Area */}
          <AnimatePresence mode="wait">
            {selectedArticle ? (
              <ArticleView key="article" article={selectedArticle} onBack={handleBackToResults} />
            ) : searchResults ? (
              <div key="results" className="flex-1 animate-fade-in flex flex-col justify-start">
                <ResultView
                  results={searchResults}
                  onClear={clearSearch}
                  onSelectArticle={handleArticleSelect}
                />
              </div>
            ) : (
              <div key="home" className={`transition-all duration-700 flex flex-col items-center ${isSearching ? 'opacity-30 pointer-events-none scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>

                {/* Category Toggle Control */}
                <CategoryToggle
                  categories={CATEGORIES_DATA}
                  selectedId={activeCategory}
                  onSelect={setActiveCategory}
                />

                {/* Single Category Card Display */}
                <div className="w-full max-w-lg mx-auto h-[200px] mb-4 relative perspective-1000">
                  <AnimatePresence mode="wait">
                    {selectedCategoryData && (
                      <motion.div
                        key={selectedCategoryData.id}
                        initial={{ opacity: 0, rotateX: -5, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateX: 5, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                        className="w-full h-full"
                      >
                        <CategoryCard
                          icon={<selectedCategoryData.icon />}
                          label={selectedCategoryData.fullLabel}
                          description={selectedCategoryData.description}
                          className=""
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            )}
          </AnimatePresence>

        </main>

        {/* Live Articles Counter - Positioned at Bottom Edge */}
        {!searchResults && !selectedArticle && (
          <div className={`absolute bottom-6 w-full flex justify-center pointer-events-none transition-all duration-700 ${isSearching ? 'opacity-0 translate-y-8 blur-sm' : 'opacity-60 translate-y-0 blur-0'}`}>
            <div className="inline-flex flex-col items-center gap-1 pointer-events-auto hover:opacity-100 transition-opacity">
              <span className="font-mono text-lg font-light tracking-tight text-ink tabular-nums">
                {articleCount !== null ? articleCount.toLocaleString() : '...'}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-subtle font-semibold">
                Verified Articles Available
              </span>
            </div>
          </div>
        )}

      </div>
    </HashRouter>
  );
}

export default App;