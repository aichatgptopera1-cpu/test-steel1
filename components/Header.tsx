
import React, { useState, memo } from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <header className="bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800/80 p-4 sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{title}</h1>
        <span className="inline-flex items-center gap-2 text-xs py-1 px-2 rounded-full bg-slate-200/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300">
          <i className="fas fa-clock"></i>
          <span>{lastUpdated.toLocaleTimeString('fa-IR')}</span>
        </span>
      </div>
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-wait w-36"
      >
        {isRefreshing ? (
          <div className="w-5 h-5 border-2 border-slate-400 border-t-indigo-500 rounded-full animate-spin"></div>
        ) : (
          <>
            <i className="fas fa-sync-alt"></i>
            <span>بروزرسانی</span>
          </>
        )}
      </button>
    </header>
  );
};

export default memo(Header);
