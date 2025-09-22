
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from '../components/Header.tsx';
import Card from '../components/Card.tsx';
import Pagination from '../components/Pagination.tsx';
import { newsData, categoryInfo } from '../data/news.ts';
import { Article, NewsCategory, NewsCountry, NewsType, NewsTimeFilter } from '../types.ts';

const ARTICLES_PER_PAGE = 5;

const credibilityMap = {
  high: { text: 'معتبر', color: 'bg-emerald-500' },
  medium: { text: 'متوسط', color: 'bg-amber-500' },
  low: { text: 'عمومی', color: 'bg-slate-400' },
};

const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " سال پیش";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " ماه پیش";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " روز پیش";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " ساعت پیش";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " دقیقه پیش";
  return "همین حالا";
};

interface NewsArticleItemProps {
  article: Article;
  viewMode: 'list' | 'card';
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  onShare: (article: Article) => void;
}

const NewsArticleItem: React.FC<NewsArticleItemProps> = React.memo(({ article, viewMode, isBookmarked, onToggleBookmark, onShare }) => {
    const { id, title, summary, source, credibility, publishedAt, category } = article;
    const categoryStyle = categoryInfo[category].color;
    const cred = credibilityMap[credibility];

    const containerClasses = viewMode === 'list' 
        ? "py-5 border-b border-slate-200/60 dark:border-slate-700/60 last:border-b-0" 
        : "";

    const contentClasses = viewMode === 'card'
        ? "flex flex-col h-full"
        : "flex flex-col sm:flex-row gap-4";

    return (
        <div className={containerClasses}>
            <Card className={`${viewMode === 'card' ? 'h-full flex flex-col' : 'hover:!translate-y-0'}`}>
                <div className={contentClasses}>
                    <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                             <div className={`text-xs font-semibold py-1 px-2.5 rounded-full self-start ${categoryStyle}`}>
                                {categoryInfo[category].name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span className="flex items-center gap-1.5" title={`اعتبار منبع: ${cred.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${cred.color}`}></span>
                                    {source}
                                </span>
                                <span>-</span>
                                <span>{timeSince(publishedAt)}</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-lg">{title}</h3>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-prose">{summary}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-4 ${viewMode === 'list' ? 'sm:mt-0 sm:flex-col sm:justify-center' : 'pt-4 border-t border-slate-200/60 dark:border-slate-700/60'}`}>
                         <button onClick={() => onToggleBookmark(id)} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${isBookmarked ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600' : 'bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500'}`} title={isBookmarked ? "حذف از ذخیره‌ها" : "ذخیره مقاله"}>
                            <i className={`fas fa-bookmark ${isBookmarked ? 'text-indigo-500' : ''}`}></i>
                        </button>
                        <button onClick={() => onShare(article)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 transition-colors" title="اشتراک‌گذاری">
                            <i className="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
});

const NewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [filters, setFilters] = useState<{
      category: NewsCategory | 'all';
      country: NewsCountry;
      type: NewsType;
      time: NewsTimeFilter;
  }>({ category: 'all', country: 'all', type: 'all', time: 'all' });
  
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('bookmarkedNews') : null;
    try {
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
      localStorage.setItem('bookmarkedNews', JSON.stringify(Array.from(bookmarkedIds)));
  }, [bookmarkedIds]);

  useEffect(() => {
      const interval = setInterval(() => {
          setLastUpdated(new Date());
      }, 15 * 60 * 1000); // 15 minutes
      return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
      setFilters(prev => ({ ...prev, [filterType]: value }));
      setCurrentPage(1);
  };

  const filteredArticles = useMemo(() => {
    let articles = newsData;

    if (filters.category !== 'all') {
      articles = articles.filter(a => a.category === filters.category);
    }
    if (filters.country !== 'all') {
      articles = articles.filter(a => a.country === filters.country);
    }
    if (filters.type !== 'all') {
      articles = articles.filter(a => a.type === filters.type);
    }
    if (filters.time !== 'all') {
        const now = new Date().getTime();
        const timeLimits = {
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
        };
        articles = articles.filter(a => (now - a.publishedAt.getTime()) < timeLimits[filters.time]);
    }
    if (searchTerm) {
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return articles;
  }, [searchTerm, filters]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const toggleBookmark = useCallback((id: number) => {
      setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  }, []);

  const handleShare = async (article: Article) => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: article.title,
                  text: article.summary,
                  url: window.location.href, // In a real app, this would be the article's URL
              });
          } catch (error) {
              console.error('Error sharing:', error);
          }
      } else {
          alert('متاسفانه مرورگر شما از قابلیت اشتراک‌گذاری پشتیبانی نمی‌کند.');
      }
  };
  
  const FilterSelect: React.FC<{ label: string; value: string; options: {value: string; label: string}[]; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;}> = ({label, value, options, onChange}) => (
      <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
          <select value={value} onChange={onChange} className="w-full p-2 text-sm border rounded-lg bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
              {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
      </div>
  )

  return (
    <div className="animate-fadeIn">
      <Header title="اخبار و مقالات" />
      <main className="py-6 space-y-6">
        
        <Card>
            <div className="flex flex-wrap items-end gap-4">
                <FilterSelect label="دسته‌بندی" value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} options={[
                    { value: 'all', label: 'همه دسته‌بندی‌ها'},
                    ...Object.entries(categoryInfo).map(([key, val]) => ({value: key, label: val.name}))
                ]}/>
                <FilterSelect label="کشور" value={filters.country} onChange={e => handleFilterChange('country', e.target.value)} options={[
                    {value: 'all', label: 'همه کشورها'}, {value: 'iran', label: 'ایران'}, {value: 'china', label: 'چین'}, {value: 'eu', label: 'اتحادیه اروپا'}, {value: 'usa', label: 'آمریکا'}, {value: 'india', label: 'هند'}
                ]} />
                <FilterSelect label="نوع خبر" value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} options={[
                    {value: 'all', label: 'همه انواع'}, {value: 'economic', label: 'اقتصادی'}, {value: 'political', label: 'سیاسی'}, {value: 'technical', label: 'فنی'}
                ]} />
                <FilterSelect label="زمان" value={filters.time} onChange={e => handleFilterChange('time', e.target.value)} options={[
                    {value: 'all', label: 'همه زمان‌ها'}, {value: '24h', label: '۲۴ ساعت گذشته'}, {value: '7d', label: '۷ روز گذشته'}, {value: '30d', label: '۳۰ روز گذشته'}
                ]} />
            </div>
        </Card>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <input type="text" placeholder="جستجو در اخبار..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="w-full p-3 ps-10 text-base border-transparent rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-lg shadow-slate-200/50 dark:shadow-black/20"
              />
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400 dark:text-slate-500">
                <i className="fas fa-search"></i>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-700/70">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600' : 'text-slate-500'}`}><i className="fas fa-bars me-2"></i>لیست</button>
                <button onClick={() => setViewMode('card')} className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600' : 'text-slate-500'}`}><i className="fas fa-th-large me-2"></i>کارت</button>
            </div>
        </div>

        <div>
            <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}>
                {paginatedArticles.length > 0 ? (
                    paginatedArticles.map((article) => (
                        <NewsArticleItem key={article.id} article={article} viewMode={viewMode} isBookmarked={bookmarkedIds.has(article.id)} onToggleBookmark={toggleBookmark} onShare={handleShare} />
                    ))
                ) : (
                    <div className="text-center py-16 col-span-full">
                        <i className="fas fa-newspaper fa-3x text-slate-400 dark:text-slate-500 mb-4"></i>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">مقاله‌ای یافت نشد</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">لطفا کلیدواژه یا فیلتر دیگری را امتحان کنید.</p>
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex items-center justify-between">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            <div className="text-xs text-slate-500 dark:text-slate-400">
                آخرین بروزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}
            </div>
        </div>
      </main>
    </div>
  );
};

export default NewsPage;