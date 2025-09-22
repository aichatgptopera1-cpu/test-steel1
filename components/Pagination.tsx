
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const pageNumbers = [];
  // Logic to show a limited number of page buttons (e.g., first, last, current, and neighbors)
  const pagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

  if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
          pageNumbers.push('...');
      }
  }

  for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
  }

  if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
          pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
  }


  return (
    <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="w-10 h-10 text-sm font-medium rounded-lg bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
      >
        <i className="fas fa-chevron-right"></i>
        <span className="sr-only">قبلی</span>
      </button>

      {pageNumbers.map((page, index) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
            {page}
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
              currentPage === page
                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30'
                : 'bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page.toLocaleString('fa-IR')}
          </button>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-10 h-10 text-sm font-medium rounded-lg bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
      >
        <i className="fas fa-chevron-left"></i>
        <span className="sr-only">بعدی</span>
      </button>
    </nav>
  );
};

export default Pagination;