
import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Page } from './types.ts';
import BottomNav from './components/BottomNav.tsx';
import ThemeToggle from './components/ThemeToggle.tsx';
import { ThemeContext, Theme } from './contexts/ThemeContext.tsx';
import Modal from './components/Modal.tsx';
import AuthorInfo from './components/AuthorInfo.tsx';
import ResumePage from './pages/ResumePage.tsx';
import { MarketDataProvider } from './contexts/MarketDataContext.tsx';

// Lazy load page components for better initial performance
const DashboardPage = lazy(() => import('./pages/DashboardPage.tsx'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage.tsx'));
const PricesPage = lazy(() => import('./pages/PricesPage.tsx'));
const NewsPage = lazy(() => import('./pages/NewsPage.tsx'));
const PremiumAnalysisPage = lazy(() => import('./pages/PremiumAnalysisPage.tsx'));
const PredictionPage = lazy(() => import('./pages/PredictionPage.tsx'));

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);


function App() {
  const [activePage, setActivePage] = useState<Page>(Page.DASHBOARD);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme as Theme;
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
  });
  
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return newTheme;
    });
  }, []);

  const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  
  const handleOpenAuthorModal = () => setIsAuthorModalOpen(true);
  const handleCloseAuthorModal = () => setIsAuthorModalOpen(false);
  const handleShowResume = () => {
      setIsAuthorModalOpen(false);
      setShowResume(true);
  };
  const handleHideResume = () => setShowResume(false);

  const renderPage = () => {
    switch (activePage) {
      case Page.DASHBOARD:
        return <DashboardPage />;
      case Page.ANALYSIS:
        return <AnalysisPage />;
      case Page.PRICES:
        return <PricesPage />;
      case Page.NEWS:
        return <NewsPage />;
      case Page.PREMIUM_ANALYSIS:
        return <PremiumAnalysisPage />;
      case Page.PREDICTION:
        return <PredictionPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <MarketDataProvider>
        <div className="antialiased text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 pb-28">
              {showResume ? (
                <ResumePage onBack={handleHideResume} />
              ) : (
                <>
                  <Suspense fallback={<LoadingFallback />}>
                    {renderPage()}
                  </Suspense>
                  <footer className="text-center text-xs text-slate-500/80 dark:text-slate-400/80 mt-10 py-4">
                      طراحی و توسعه توسط{' '}
                      <button onClick={handleOpenAuthorModal} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none">
                          علی ثابت
                      </button>
                  </footer>
                </>
              )}
          </div>
          {!showResume && (
            <>
              <BottomNav activePage={activePage} setPage={setActivePage} />
              <ThemeToggle />
            </>
          )}
        </div>
        <Modal isOpen={isAuthorModalOpen} onClose={handleCloseAuthorModal}>
          <AuthorInfo onShowResume={handleShowResume} />
        </Modal>
      </MarketDataProvider>
    </ThemeContext.Provider>
  );
}

export default App;