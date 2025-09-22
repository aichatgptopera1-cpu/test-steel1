import React from 'react';

interface AuthorInfoProps {
  onShowResume: () => void;
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ onShowResume }) => {
  return (
    <div className="text-center">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-200 dark:border-slate-600 shadow-lg flex items-center justify-center bg-slate-100 dark:bg-slate-700">
            <i className="fas fa-user-tie text-5xl text-indigo-500 dark:text-indigo-400"></i>
        </div>
        <h2 id="modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            علی ثابت
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">طراح و توسعه دهنده داشبورد</p>

        <div className="space-y-4 text-right">
            <a href="mailto:dr.alisabett@gmail.com" className="flex items-center p-3 bg-slate-100 dark:bg-slate-700/80 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <i className="fas fa-envelope w-6 text-center text-indigo-500 dark:text-indigo-400"></i>
                <span className="mr-3 font-semibold text-slate-700 dark:text-slate-300">dr.alisabett@gmail.com</span>
            </a>
            <a href="tel:09126265508" className="flex items-center p-3 bg-slate-100 dark:bg-slate-700/80 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <i className="fas fa-mobile-alt w-6 text-center text-indigo-500 dark:text-indigo-400"></i>
                <span className="mr-3 font-semibold text-slate-700 dark:text-slate-300">۰۹۱۲۶۲۶۵۵۰۸</span>
            </a>
        </div>
        
        <button
            onClick={onShowResume}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition-all duration-300"
        >
            <i className="fas fa-file-alt"></i>
            <span>مشاهده رزومه</span>
        </button>
    </div>
  );
};

export default AuthorInfo;