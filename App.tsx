import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Network, Type, Lightbulb, Footprints, Moon, Sun, Sparkles, BookOpen, FlaskConical } from 'lucide-react';
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
    label: 'one1pedia',
    fullLabel: 'one1pedia',
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
  },
  {
    id: 'religious',
    label: 'Religious',
    fullLabel: 'Religious Books',
    icon: BookOpen,
    description: "Sacred texts and spiritual wisdom from traditions across the world.",
  },
  {
    id: 'research',
    label: 'Research',
    fullLabel: 'Research Papers',
    icon: FlaskConical,
    description: "Scientific studies, academic papers, and cutting-edge discoveries.",
  }
];

function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[] | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<SearchResultItem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [articleCount, setArticleCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('knowledge');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const handleSearchComplete = (results: SearchResultItem[], query: string) => {
    setIsSearching(false);
    setSearchResults(results);
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSelectedArticle(null);
    setIsSearching(false);
    setSearchQuery('');
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

        {/* Logo - Visible on results and article pages, hidden on main page */}
        <div className={`fixed top-2 xs:top-3 sm:top-4 left-2 xs:left-3 sm:left-4 md:left-8 z-[60] transition-opacity duration-300 ${(!searchResults && !selectedArticle) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <img
            src="/logo.png"
            alt="one1intellect"
            className="h-4 xs:h-5 md:h-6 w-auto cursor-pointer shrink-0 dark:invert"
            onClick={() => window.location.reload()}
          />
        </div>

        <div className="fixed top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 md:right-8 z-[60] flex items-center gap-1 xs:gap-2">
          <a
            href="https://calendly.com/l-f/free-consultation"
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden lg:flex items-center px-3 py-1.5 rounded-full text-ink text-[9px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${selectedArticle ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <span>SUPERCHARGED ✦ AI INFRASTRUCTURE</span>
          </a>

          <button
            onClick={toggleTheme}
            className="p-1.5 xs:p-2 rounded-full text-ink/50 hover:text-ink transition-all duration-300 min-h-[36px] min-w-[36px] xs:min-h-[44px] xs:min-w-[44px] flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 xs:w-4 xs:h-4 stroke-[1.5] fill-current" />
            ) : (
              <Sun className="w-4 h-4 xs:w-4 xs:h-4 stroke-[1.5]" />
            )}
          </button>
        </div>

        {/* Fixed Header Bar - Only visible when article is opened */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.nav
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-0 left-0 right-0 z-50 px-2 xs:px-3 sm:px-4 md:px-8 py-2 xs:py-3"
            >
              <div className="absolute inset-0 bg-paper/80 dark:bg-paper/90 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08]" />

              <div className="relative flex items-center justify-center max-w-7xl mx-auto">
                {/* Search Bar - Centered */}
                <div className="w-full max-w-xl mx-auto px-8 xs:px-10 sm:px-12 md:px-20">
                  <HeroSearch
                    onSearchStart={handleSearchStart}
                    onSearchComplete={handleSearchComplete}
                    isSearching={isSearching}
                    compact={true}
                  />
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Results Header Bar - Background only when showing search results */}
        <AnimatePresence>
          {searchResults && !selectedArticle && (
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-0 left-0 right-0 z-40 h-10 xs:h-12 sm:h-14"
            >
              <div className="absolute inset-0 bg-paper/80 dark:bg-paper/90 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08]" />
            </motion.div>
          )}
        </AnimatePresence>

        <main className={`flex-1 w-full mx-auto px-3 xs:px-4 sm:px-6 md:px-8 flex flex-col justify-center pb-4 xs:pb-6 relative z-10 transition-all duration-500 ${(searchResults || selectedArticle) ? 'pt-16 xs:pt-20 sm:pt-24' : 'pt-4 xs:pt-6'} ${selectedArticle ? 'max-w-6xl' : 'max-w-5xl'}`}>

          {/* Hero Search - Only visible on home */}
          {!searchResults && !selectedArticle && (
            <HeroSearch
              onSearchStart={handleSearchStart}
              onSearchComplete={handleSearchComplete}
              isSearching={isSearching}
              compact={false}
            />
          )}

          {/* Dynamic Content Area */}
          <AnimatePresence mode="wait">
            {selectedArticle ? (
              <ArticleView key="article" article={selectedArticle} onBack={handleBackToResults} />
            ) : searchResults ? (
              <div key="results" className="flex-1 animate-fade-in flex flex-col justify-start">
                {/* Search Bar - Above Results */}
                <div className="w-full max-w-4xl mx-auto px-2 xs:px-3 sm:px-4 mb-4 xs:mb-6 sm:mb-8">
                  <HeroSearch
                    onSearchStart={handleSearchStart}
                    onSearchComplete={handleSearchComplete}
                    isSearching={isSearching}
                    compact={true}
                  />
                </div>
                <ResultView
                  results={searchResults}
                  onClear={clearSearch}
                  onSelectArticle={handleArticleSelect}
                  searchQuery={searchQuery}
                />
              </div>
            ) : (
              <div key="home" className={`transition-all duration-700 flex flex-col items-center -mt-2 xs:-mt-4 sm:-mt-[26px] ${isSearching ? 'opacity-30 pointer-events-none scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>

                {/* Category Toggle Control */}
                <CategoryToggle
                  categories={CATEGORIES_DATA}
                  selectedId={activeCategory}
                  onSelect={setActiveCategory}
                />

                {/* Single Category Card Display */}
                <div className="w-full max-w-lg mx-auto h-[160px] xs:h-[180px] sm:h-[200px] mb-2 xs:mb-4 relative perspective-1000">
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
          <div className={`absolute bottom-3 xs:bottom-4 sm:bottom-6 w-full flex justify-center pointer-events-none transition-all duration-700 ${isSearching ? 'opacity-0 translate-y-8 blur-sm' : 'opacity-60 translate-y-0 blur-0'}`}>
            <div className="inline-flex flex-col items-center gap-0.5 xs:gap-1 pointer-events-auto hover:opacity-100 transition-opacity">
              <span className="font-mono text-base xs:text-lg font-light tracking-tight text-ink tabular-nums">
                {articleCount !== null ? articleCount.toLocaleString() : '...'}
              </span>
              <span className="text-[8px] xs:text-[9px] uppercase tracking-widest text-subtle font-semibold">
                Verified Articles
              </span>
            </div>
          </div>
        )}

      </div>
    </HashRouter>
  );
}

export default App;