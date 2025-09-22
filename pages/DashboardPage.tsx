import React, { useMemo } from 'react';
import Header from '../components/Header.tsx';
import Card from '../components/Card.tsx';
import { TechnicalAnalysisChart } from '../components/Charts.tsx';
import ErrorBoundary from '../components/ErrorBoundary.tsx';
import { getPastDaysLabels } from '../utils/date.ts';
import { calculateSMA } from '../utils/chartData.ts';
import { useMarketData } from '../contexts/MarketDataContext.tsx';

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

const LoadingOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-30 rounded-2xl">
        <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
);

const DashboardPage: React.FC = () => {
    const { productsData, globalCommoditiesData, isLoading } = useMarketData();

    const { kpiHotRolled, kpiHrc, kpiDollar, technicalIndexChartData, technicalDollarChartData } = useMemo(() => {
        const hotRolled = productsData['hot-rolled'];
        const hrc = globalCommoditiesData['hrc'];
        
        // Assuming dollar can be represented by a mock fluctuation for demonstration
        const dollarValue = 61850 * (1 + (hotRolled.change / 100) * 0.3); // Simple correlation
        const dollarChange = (hotRolled.change * 0.3).toFixed(2);

        const indexData = hotRolled.chartData;
        const indexSma = calculateSMA(indexData, 3);
        const techIndexChart = indexData.map((value, index) => ({
            name: getPastDaysLabels(indexData.length)[index] || '',
            value: value,
            ma: indexSma[index]
        }));
        
        // Mocking dollar chart data based on hot-rolled chart for visualization
        const dollarChart = indexData.map(p => p * 1.47);
        const dollarSma = calculateSMA(dollarChart, 3);
         const techDollarChart = dollarChart.map((value, index) => ({
            name: getPastDaysLabels(indexData.length)[index] || '',
            value: value,
            ma: dollarSma[index]
        }));


        return {
            kpiHotRolled: hotRolled,
            kpiHrc: hrc,
            kpiDollar: { price: dollarValue, change: parseFloat(dollarChange) },
            technicalIndexChartData: techIndexChart,
            technicalDollarChartData: techDollarChart
        };
    }, [productsData, globalCommoditiesData]);


  return (
    <div className="animate-fadeIn">
      <Header title="داشبورد تحلیلی فولاد" />
      <main className="py-6 space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white text-center shadow-2xl shadow-indigo-500/30">
          <h2 className="text-3xl font-bold mb-2">تحلیل جامع بازار فولاد ایران</h2>
          <p className="text-sm opacity-90 max-w-md mx-auto">راهنمای استراتژیک برای تصمیم‌گیری در بازار پرنوسان فولاد</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
          {isLoading && <LoadingOverlay />}
          <KpiCard title="شاخص کل فولاد" value="۱۲,۷۸۰" change="+۰.۹٪" changeType="up" icon="fa-chart-pie" />
          <KpiCard title="ورق گرم داخلی" value={`${kpiHotRolled.price.toLocaleString('fa-IR')} ت`} change={`${kpiHotRolled.change > 0 ? '+' : ''}${kpiHotRolled.change}%`} changeType={kpiHotRolled.change >= 0 ? 'up' : 'down'} icon="fa-layer-group" />
          <KpiCard title="HRC جهانی" value={`${kpiHrc.chartData[kpiHrc.chartData.length -1]}$`} change="+۰.۸٪" changeType="up" icon="fa-globe" />
          <KpiCard title="دلار آزاد" value={`${Math.round(kpiDollar.price).toLocaleString('fa-IR')} ت`} change={`${kpiDollar.change > 0 ? '+' : ''}${kpiDollar.change}%`} changeType={kpiDollar.change >= 0 ? 'up' : 'down'} icon="fa-dollar-sign" />
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
                    <p>🔸 <span className="font-semibold">توصیه فوری:</span> با توجه به افزایش عرضه, خریداران می‌توانند بخشی از نیاز خود را با قیمت‌های رقابتی‌تر از بورس تامین کنند. ریسک اصلی همچنان نوسانات نرخ ارز است.</p>
                </div>
                <div className="text-right text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                        منبع داده‌ها: تحلیل کارشناسان بر اساس داده‌های بورس کالا
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="relative">
              {isLoading && <LoadingOverlay />}
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-center text-lg">تحلیل تکنیکال ورق گرم</h3>
              <ErrorBoundary>
                <TechnicalAnalysisChart 
                  data={technicalIndexChartData}
                  dataKey="value"
                  maKey="ma"
                  supportLevel={kpiHotRolled.technicalInfo.support}
                  resistanceLevel={kpiHotRolled.technicalInfo.resistance}
                  unit="تومان"
                />
              </ErrorBoundary>
              <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-semibold">الگوی فعلی: <span className="text-indigo-500 dark:text-indigo-400">کانال صعودی کوتاه‌مدت</span></p>
                <p>
                  نمودار در حال حاضر در یک کانال صعودی کوتاه‌مدت حرکت می‌کند و به سقف کانال در محدوده <strong className="text-red-500">مقاومتی {kpiHotRolled.technicalInfo.resistance.toLocaleString('fa-IR')}</strong> واحد نزدیک شده است. میانگین متحرک ۳ روزه نیز به عنوان حمایت دینامیک عمل می‌کند.
                </p>
              </div>
            </Card>
            
            <Card className="relative">
               {isLoading && <LoadingOverlay />}
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-center text-lg">تحلیل تکنیکال دلار آزاد (شبیه‌سازی شده)</h3>
              <ErrorBoundary>
                <TechnicalAnalysisChart 
                  data={technicalDollarChartData}
                  dataKey="value"
                  maKey="ma"
                  supportLevel={Math.round(kpiDollar.price * 0.98)}
                  resistanceLevel={Math.round(kpiDollar.price * 1.02)}
                  unit="تومان"
                />
              </ErrorBoundary>
              <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-semibold">الگوی فعلی: <span className="text-indigo-500 dark:text-indigo-400">تثبیت بالای سطح حمایتی</span></p>
                <p>
                  دلار پس از یک رشد, در حال حاضر بالای سطح <strong className="text-emerald-500">حمایتی {Math.round(kpiDollar.price * 0.98).toLocaleString('fa-IR')}</strong> تومان در حال تثبیت است. مقاومت پیش رو در محدوده <strong className="text-red-500">{Math.round(kpiDollar.price * 1.02).toLocaleString('fa-IR')}</strong> تومان قرار دارد.
                </p>
              </div>
            </Card>
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;