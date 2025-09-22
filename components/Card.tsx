
import React, { memo } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
};

export default memo(Card);
