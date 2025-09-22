
import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.tsx';

const ThemeToggle: React.FC = () => {
  const context = useContext(ThemeContext);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  if (!context) return null;
  const { theme, toggleTheme } = context;

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
  };

  const iconClasses = `transition-all duration-500 transform ${isAnimating ? 'rotate-[360deg] scale-0' : 'rotate-0 scale-100'}`;

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-24 end-5 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 z-50 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <i className={`fas fa-sun absolute ${iconClasses} ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`}></i>
        <i className={`fas fa-moon absolute ${iconClasses} ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}></i>
      </div>
    </button>
  );
};

export default ThemeToggle;