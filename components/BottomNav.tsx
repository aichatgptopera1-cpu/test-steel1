import React from 'react';
import { Page } from '../types.ts';

interface BottomNavProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

const navItems = [
  { page: Page.DASHBOARD, icon: 'fa-home', label: 'داشبورد' },
  { page: Page.ANALYSIS, icon: 'fa-chart-line', label: 'تحلیل' },
  { page: Page.PRICES, icon: 'fa-tags', label: 'قیمت‌ها' },
  { page: Page.PREDICTION, icon: 'fa-brain', label: 'پیش بینی'},
  { page: Page.NEWS, icon: 'fa-newspaper', label: 'اخبار' },
  { page: Page.PREMIUM_ANALYSIS, icon: 'fa-gem', label: 'ویژه' },
];

const NavButton: React.FC<{
    item: typeof navItems[0],
    isActive: boolean,
    onClick: () => void
}> = ({ item, isActive, onClick }) => {
    const activeText = 'text-indigo-600 dark:text-indigo-400';
    const inactiveText = 'text-slate-500 dark:text-slate-400';
    
    return (
        <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-colors duration-300 flex-1 group focus:outline-none`}>
            <div className={`w-12 h-12 flex items-center justify-center rounded-full text-xl transition-all duration-300 ease-in-out ${isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/40 transform -translate-y-2 scale-110' : 'bg-slate-200/80 dark:bg-slate-800/80 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'}`}>
                <i className={`fas ${item.icon}`}></i>
            </div>
            <span className={`text-xs font-bold transition-colors duration-300 ${isActive ? activeText : inactiveText}`}>{item.label}</span>
        </button>
    );
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setPage }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.1),0_-2px_4px_-2px_rgb(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgb(255,255,255,0.05),0_-2px_4px_-2px_rgb(255,255,255,0.05)] z-50 pt-3 pb-2 px-1 flex justify-around items-start">
      {navItems.map(item => (
        <NavButton 
            key={item.page}
            item={item}
            isActive={activePage === item.page}
            onClick={() => setPage(item.page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;