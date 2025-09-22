import React from 'react';
import Header from '../components/Header.tsx';
import Card from '../components/Card.tsx';
import { AnalyticsChart, TechnicalAnalysisChart } from '../components/Charts.tsx';
import ErrorBoundary from '../components/ErrorBoundary.tsx';
import { getPastMonthLabels } from '../utils/date.ts';
import { generateMonthlyData, calculateSMA } from '../utils/chartData.ts';

const KpiCard: React.FC<{ title: string; value: string; change?: string; changeType?: 'up' | 'down'; icon: string; }> = ({ title, value, change, changeType, icon }) => {
  const changeColor = changeType === 'up' ? 'text-emerald-500' : 'text-red-500';
  return (
    <Card className="text-center flex flex-col items-center justify-center p-4">
       <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/70 dark:bg-slate-700/70 mb-2 text-indigo-500 text-lg">
           <i className={`fas ${icon}`}></i>
       </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
       {change && <p className={`text-xs font-semibold mt-1 ${changeColor}`}>{change}</p>}
    </Card>
  );
};

const DashboardPage: React.FC = () => {
    const domesticIndexData = generateMonthlyData(12450, 12780, 30);
    const domesticIndexSMA = calculateSMA(domesticIndexData, 7);
    const technicalIndexChartData = domesticIndexData.map((value, index) => ({
        name: (getPastMonthLabels()[index] || ''),
        value: value,
        ma: domesticIndexSMA[index]
    }));
    
    const dollarData = generateMonthlyData(60500, 61850, 30);
    const dollarSMA = calculateSMA(dollarData, 7);
    const technicalDollarChartData = dollarData.map((value, index) => ({
        name: (getPastMonthLabels()[index] || ''),
        value: value,
        ma: dollarSMA[index]
    }));

  return (
    <div className="animate-fadeIn">
      <Header title="داشبورد تحلیلی فولاد" />
      <main className="py-6 space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white text-center shadow-2xl shadow-indigo-500/30">
          <h2 className="text-3xl font-bold mb-2">تحلیل جامع بازار فولاد ایران</h2>
          <p className="text-sm opacity-90 max-w-md mx-auto">راهنمای استراتژیک برای تصمیم‌گیری در بازار پرنوسان فولاد</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard title="شاخص کل فولاد" value="۱۲,۷۸۰" change="+۰.۹٪" changeType="up" icon="fa-chart-pie" />
          <KpiCard title="ورق گرم داخلی" value="۴۲,۱۰۰ ت" change="+۰.۷٪" changeType="up" icon="fa-layer-group" />
          <KpiCard title="HRC جهانی" value="۷۷۸$" change="+۰.۸٪" changeType="up" icon="fa-globe" />
          <KpiCard title="دلار آزاد" value="۶۱,۸۵۰ ت" change="+۰.۲٪" changeType="up" icon="fa-dollar-sign" />
        </div>
        
        <div className="p-0.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-400/20">
            <Card className="bg-white/90 dark:bg-slate-800/90 hover:!translate-y-0">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-lg">تحلیل و اخبار فوری</h3>
                <div className="bg-indigo-50/80 dark:bg-slate-700/50 p-4 rounded-xl mb-4 border border-indigo-200/80 dark:border-slate-600/80">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">مهمترین خبر</p>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">عرضه ۱.۵ میلیون تن فولاد در بورس کالا برای تنظیم بازار</h4>
                </div>
                <div className="text-slate-700 dark:text-slate-300 space-y-3 text-sm">
                    <p>🔸 <span className="font-semibold">تحلیل:</span> عرضه گسترده در بورس کالا با هدف کنترل نوسانات و پاسخ به تقاضای فصلی انجام می‌شود. این اقدام می‌تواند در کوتاه‌مدت باعث ثبات نسبی در قیمت ورق گرم و میلگرد شود.</p>
                    <p>🔸 <span className="font-semibold">توصیه فوری:</span> با توجه به افزایش عرضه، خریداران می‌توانند بخشی از نیاز خود را با قیمت‌های رقابتی‌تر از بورس تامین کنند. ریسک اصلی همچنان نوسانات نرخ ارز است.</p>
                </div>
                <div className="text-right text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                        منبع داده‌ها: تحلیل کارشناسان بر اساس داده‌های بورس کالا
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-center text-lg">تحلیل تکنیکال شاخص فولاد تخت</h3>
              <ErrorBoundary>
                <TechnicalAnalysisChart 
                  data={technicalIndexChartData}
                  dataKey="value"
                  maKey="ma"
                  supportLevel={12500}
                  resistanceLevel={12800}
                  unit=""
                />
              </ErrorBoundary>
              <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-semibold">الگوی فعلی: <span className="text-indigo-500 dark:text-indigo-400">کانال صعودی کوتاه‌مدت</span></p>
                <p>
                  شاخص در حال حاضر در یک کانال صعودی کوتاه‌مدت حرکت می‌کند و به سقف کانال در محدوده <strong className="text-red-500">مقاومتی ۱۲,۸۰۰</strong> واحد نزدیک شده است. میانگین متحرک ۷ روزه (خط نارنجی) نیز به عنوان حمایت دینامیک عمل می‌کند.
                </p>
              </div>
            </Card>
            
            <Card>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-center text-lg">تحلیل تکنیکال دلار آزاد</h3>
              <ErrorBoundary>
                <TechnicalAnalysisChart 
                  data={technicalDollarChartData}
                  dataKey="value"
                  maKey="ma"
                  supportLevel={61000}
                  resistanceLevel={62500}
                  unit="تومان"
                />
              </ErrorBoundary>
              <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-semibold">الگوی فعلی: <span className="text-indigo-500 dark:text-indigo-400">تثبیت بالای سطح حمایتی</span></p>
                <p>
                  دلار پس از یک رشد، در حال حاضر بالای سطح <strong className="text-emerald-500">حمایتی ۶۱,۰۰۰</strong> تومان در حال تثبیت است. مقاومت پیش رو در محدوده <strong className="text-red-500">۶۲,۵۰۰</strong> تومان قرار دارد. شکست این مقاومت می‌تواند سیگنال حرکت به سمت اهداف بالاتر باشد.
                </p>
              </div>
            </Card>
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;