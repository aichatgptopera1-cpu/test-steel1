import React, { useState } from 'react';
import Header from '../components/Header.tsx';
import Card from '../components/Card.tsx';
import { AnalyticsChart, TechnicalAnalysisChart } from '../components/Charts.tsx';
import { productsData, globalCommoditiesData } from '../data.ts';
import { ProductData, GlobalCommodityData } from '../types.ts';
import ErrorBoundary from '../components/ErrorBoundary.tsx';
import { getPastDaysLabels } from '../utils/date.ts';
import { calculateSMA } from '../utils/chartData.ts';

type Tab = 'domestic' | 'international' | 'products-analysis' | 'strategy' | 'technical';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-full transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'}`}
  >
    {label}
  </button>
);

const RsiIndicator: React.FC<{ value: number }> = ({ value }) => {
    const percentage = value;
    const color = value > 70 ? 'bg-red-500' : value < 30 ? 'bg-emerald-500' : 'bg-amber-500';
    const label = value > 70 ? 'اشباع خرید' : value < 30 ? 'اشباع فروش' : 'خنثی';

    return (
        <div>
            <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="text-slate-800 dark:text-slate-200">{value}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>۰</span>
                <span>۳۰</span>
                <span>۷۰</span>
                <span>۱۰۰</span>
            </div>
        </div>
    );
};

const AnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('domestic');
  const [domesticProduct, setDomesticProduct] = useState('hot-rolled');
  const [globalCommodity, setGlobalCommodity] = useState('hrc');
  const [selectedProduct, setSelectedProduct] = useState<ProductData>(productsData['hot-rolled']);
  const [kpiProduct, setKpiProduct] = useState<ProductData>(productsData['hot-rolled']);
  const [technicalProductKey, setTechnicalProductKey] = useState<string>('hot-rolled');


  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedProduct(productsData[e.target.value]);
  }
  
  const handleKpiProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setKpiProduct(productsData[e.target.value]);
  }

  const allProductsForTechAnalysis = { ...productsData, ...globalCommoditiesData };
  const selectedTechAnalysisData = allProductsForTechAnalysis[technicalProductKey];
  const techChartDataWithSma = selectedTechAnalysisData.chartData.map((val, index, arr) => ({
      name: getPastDaysLabels(arr.length)[index],
      value: val,
      ma: calculateSMA(arr, 7)[index]
  }));
  
  const renderDataSource = (source: string, lastUpdated: string) => (
      <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
          <span>منبع: {source}</span>
          <span>آخرین بروزرسانی: {lastUpdated}</span>
      </div>
  );

  return (
    <div className="animate-fadeIn">
      <Header title="تحلیل و استراتژی بازار فولاد" />
      <main className="py-6">
        <div className="p-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-full flex overflow-x-auto mb-6 gap-2">
          <TabButton label="بازار داخلی" isActive={activeTab === 'domestic'} onClick={() => setActiveTab('domestic')} />
          <TabButton label="بازار جهانی" isActive={activeTab === 'international'} onClick={() => setActiveTab('international')} />
          <TabButton label="تحلیل تکنیکال" isActive={activeTab === 'technical'} onClick={() => setActiveTab('technical')} />
          <TabButton label="تحلیل محصولات" isActive={activeTab === 'products-analysis'} onClick={() => setActiveTab('products-analysis')} />
          <TabButton label="استراتژی بازار" isActive={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} />
        </div>

        {activeTab === 'domestic' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-bold mb-3">روند قیمت داخلی (هفت روز گذشته)</h3>
                    <select value={domesticProduct} onChange={e => setDomesticProduct(e.target.value)} className="w-full p-2 mb-3 border rounded-md bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                        {Object.entries(productsData).map(([key, product]) => (
                            <option key={key} value={key}>{product.title}</option>
                        ))}
                    </select>
                    <ErrorBoundary>
                      <AnalyticsChart data={productsData[domesticProduct].chartData} dataKey={productsData[domesticProduct].title} color="#6366f1" unit={productsData[domesticProduct].unit} labels={getPastDaysLabels(7)} />
                    </ErrorBoundary>
                    {renderDataSource(productsData[domesticProduct].source, productsData[domesticProduct].lastUpdated)}
                </Card>
                 <Card>
                    <h3 className="font-bold mb-3">شاخص‌های کلیدی بازار داخلی</h3>
                    <select onChange={handleKpiProductChange} defaultValue="hot-rolled" className="w-full p-2 mb-4 border rounded-md bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                        {Object.entries(productsData).map(([key, product]) => (
                            <option key={key} value={key}>{product.title}</option>
                        ))}
                    </select>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>قیمت فعلی:</span><span className="font-bold">{kpiProduct.price.toLocaleString('fa-IR')} {kpiProduct.unit}</span></div>
                        <div className="flex justify-between"><span>تغییر روزانه:</span><span className={`font-bold ${kpiProduct.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{kpiProduct.change}%</span></div>
                        <div className="flex justify-between"><span>تغییر هفتگی:</span><span className={`font-bold ${kpiProduct.weeklyChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{kpiProduct.weeklyChange}%</span></div>
                        <div className="flex justify-between"><span>تغییر ماهانه:</span><span className={`font-bold ${kpiProduct.monthlyChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{kpiProduct.monthlyChange}%</span></div>
                        <div className="flex justify-between"><span>حجم معاملات (تن):</span><span className="font-bold">{kpiProduct.volume.toLocaleString('fa-IR')}</span></div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                      {kpiProduct.analysis[0]}
                    </p>
                </Card>
            </div>
          </div>
        )}

        {activeTab === 'international' && (
            <div className="space-y-6 animate-fadeIn">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="font-bold mb-3">روند قیمت جهانی (هفت روز گذشته)</h3>
                        <select value={globalCommodity} onChange={e => setGlobalCommodity(e.target.value)} className="w-full p-2 mb-3 border rounded-md bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                           {Object.entries(globalCommoditiesData).map(([key, commodity]) => (
                               <option key={key} value={key}>{commodity.title}</option>
                           ))}
                        </select>
                        <ErrorBoundary>
                          <AnalyticsChart data={globalCommoditiesData[globalCommodity].chartData} dataKey={globalCommoditiesData[globalCommodity].title} color="#10b981" unit={globalCommoditiesData[globalCommodity].unit} labels={getPastDaysLabels(7)} />
                        </ErrorBoundary>
                        {renderDataSource(globalCommoditiesData[globalCommodity].source, globalCommoditiesData[globalCommodity].lastUpdated)}
                    </Card>
                    <Card>
                        <h3 className="font-bold mb-3">شاخص‌های کلیدی بازار جهانی</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span>قیمت جهانی فولاد HRC:</span><span className="font-bold">۷۷۸ دلار/تن <span className="text-emerald-500">(+۰.۸٪)</span></span></div>
                            <div className="flex justify-between"><span>قراضه آهن ترکیه (HMS):</span><span className="font-bold">۴۴۰ دلار/تن <span className="text-emerald-500">(+۰.۴٪)</span></span></div>
                            <div className="flex justify-between"><span>قیمت سنگ آهن:</span><span className="font-bold">۱۲۲ دلار/تن <span className="text-red-500">(-۰.۸٪)</span></span></div>
                            <div className="flex justify-between"><span>زغال سنگ کک شو:</span><span className="font-bold">۲۵۳ دلار/تن <span className="text-emerald-500">(+۱.۲٪)</span></span></div>
                        </div>
                        {renderDataSource("Platts, Fastmarkets", globalCommoditiesData['hrc'].lastUpdated)}
                    </Card>
                 </div>
            </div>
        )}

        {activeTab === 'technical' && (
            <div className="space-y-6 animate-fadeIn">
                <Card>
                    <h3 className="font-bold mb-3">انتخاب محصول برای تحلیل تکنیکال</h3>
                    <select onChange={e => setTechnicalProductKey(e.target.value)} value={technicalProductKey} className="w-full p-2 border rounded-md bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <optgroup label="محصولات داخلی">
                            {Object.entries(productsData).map(([key, product]) => (
                                <option key={key} value={key}>{product.title}</option>
                            ))}
                        </optgroup>
                        <optgroup label="کالاهای جهانی">
                             {Object.entries(globalCommoditiesData).map(([key, commodity]) => (
                               <option key={key} value={key}>{commodity.title}</option>
                           ))}
                        </optgroup>
                    </select>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                        <Card>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-lg">نمودار تکنیکال {selectedTechAnalysisData.title}</h3>
                             <ErrorBoundary>
                                <TechnicalAnalysisChart 
                                data={techChartDataWithSma}
                                dataKey="value"
                                maKey="ma"
                                supportLevel={selectedTechAnalysisData.technicalInfo.support}
                                resistanceLevel={selectedTechAnalysisData.technicalInfo.resistance}
                                unit={selectedTechAnalysisData.unit}
                                />
                            </ErrorBoundary>
                        </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                             <h4 className="font-semibold mb-3">سیگنال و شاخص‌ها</h4>
                             <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">سیگنال فعلی</p>
                                    <p className={`text-2xl font-bold ${
                                        selectedTechAnalysisData.technicalInfo.signal === 'buy' ? 'text-emerald-500' : 
                                        selectedTechAnalysisData.technicalInfo.signal === 'sell' ? 'text-red-500' : 'text-amber-500'
                                    }`}>
                                        {selectedTechAnalysisData.technicalInfo.signal === 'buy' ? 'خرید' : selectedTechAnalysisData.technicalInfo.signal === 'sell' ? 'فروش' : 'خنثی'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">شاخص قدرت نسبی (RSI)</p>
                                    <RsiIndicator value={selectedTechAnalysisData.technicalInfo.rsi} />
                                </div>
                             </div>
                        </Card>
                         <Card>
                             <h4 className="font-semibold mb-3">سطوح کلیدی</h4>
                             <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">حمایت (Support)</span>
                                    <span className="font-bold text-emerald-500 bg-emerald-100/60 dark:bg-emerald-900/40 py-1 px-2 rounded-md">{selectedTechAnalysisData.technicalInfo.support.toLocaleString('fa-IR')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">مقاومت (Resistance)</span>
                                    <span className="font-bold text-red-500 bg-red-100/60 dark:bg-red-900/40 py-1 px-2 rounded-md">{selectedTechAnalysisData.technicalInfo.resistance.toLocaleString('fa-IR')}</span>
                                </div>
                             </div>
                        </Card>
                    </div>
                </div>
                <Card>
                    <h3 className="font-bold mb-3 text-lg">خلاصه تحلیل تکنیکال</h3>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {selectedTechAnalysisData.technicalInfo.summary}
                    </p>
                </Card>
            </div>
        )}
        
        {activeTab === 'products-analysis' && (
            <div className="space-y-6 animate-fadeIn">
                <Card>
                    <h3 className="font-bold mb-3">انتخاب محصول برای تحلیل جامع</h3>
                    <select onChange={handleProductChange} defaultValue="hot-rolled" className="w-full p-2 border rounded-md bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                        {Object.entries(productsData).map(([key, product]) => (
                            <option key={key} value={key}>{product.title}</option>
                        ))}
                    </select>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="font-bold mb-3">تحلیل {selectedProduct.title}</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                           {selectedProduct.analysis.map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                         {renderDataSource(selectedProduct.source, selectedProduct.lastUpdated)}
                    </Card>
                     <Card>
                        <h3 className="font-bold mb-3">نمودار روند قیمت (هفت روز گذشته)</h3>
                        <ErrorBoundary>
                           <AnalyticsChart data={selectedProduct.chartData} dataKey={selectedProduct.title} color="#f59e0b" unit={selectedProduct.unit} labels={getPastDaysLabels(7)} />
                        </ErrorBoundary>
                        {renderDataSource(selectedProduct.source, selectedProduct.lastUpdated)}
                    </Card>
                </div>
            </div>
        )}
        
        {activeTab === 'strategy' && (
            <div className="space-y-6 animate-fadeIn">
                <Card>
                    <h3 className="font-bold mb-4 text-lg">تحلیل استراتژیک SWOT</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold text-emerald-600 dark:text-emerald-500 mb-2"><i className="fas fa-check-circle me-2"></i>قوت‌ها (Strengths)</h4>
                            <ul className="list-disc list-inside space-y-2">
                                <li>دسترسی به منابع انرژی ارزان و نیروی کار ماهر</li>
                                <li>وجود معادن سنگ آهن غنی و زنجیره تامین داخلی</li>
                                <li>موقعیت جغرافیایی استراتژیک برای صادرات</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-red-600 dark:text-red-500 mb-2"><i className="fas fa-exclamation-triangle me-2"></i>ضعف‌ها (Weaknesses)</h4>
                            <ul className="list-disc list-inside space-y-2">
                                <li>فرسودگی بخشی از تکنولوژی و نیاز به نوسازی</li>
                                <li>نوسانات بالای نرخ ارز و تاثیر آن بر هزینه‌ها</li>
                                <li>وابستگی به واردات برخی تجهیزات و قطعات یدکی</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sky-600 dark:text-sky-500 mb-2"><i className="fas fa-lightbulb me-2"></i>فرصت‌ها (Opportunities)</h4>
                            <ul className="list-disc list-inside space-y-2">
                                <li>نیاز گسترده داخلی به فولاد در پروژه‌های عمرانی</li>
                                <li>بازار بزرگ و رو به رشد کشورهای همسایه</li>
                                <li>امکان توسعه محصولات با ارزش افزوده بالاتر</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-amber-600 dark:text-amber-500 mb-2"><i className="fas fa-shield-alt me-2"></i>تهدیدها (Threats)</h4>
                            <ul className="list-disc list-inside space-y-2">
                                <li>تحریم‌های بین‌المللی و محدودیت‌های تجاری</li>
                                <li>سیاست‌های قیمت‌گذاری دستوری و مداخله دولت</li>
                                <li>رقابت شدید از سوی تولیدکنندگان بزرگ جهانی (چین، روسیه)</li>
                            </ul>
                        </div>
                    </div>
                </Card>
                <Card>
                    <h3 className="font-bold mb-4 text-lg">تحلیل پنج نیروی رقابتی پورتر</h3>
                    <div className="space-y-4 text-sm">
                        <p><strong className="text-slate-800 dark:text-slate-100">۱. رقابت بین شرکت‌های موجود (بالا):</strong> تعداد زیاد تولیدکنندگان داخلی و رقابت شدید بر سر سهم بازار.</p>
                        <p><strong className="text-slate-800 dark:text-slate-100">۲. تهدید تازه‌واردان (پایین):</strong> نیاز به سرمایه‌گذاری هنگفت، تکنولوژی پیچیده و مجوزهای دولتی، ورود بازیگران جدید را دشوار می‌کند.</p>
                        <p><strong className="text-slate-800 dark:text-slate-100">۳. قدرت چانه‌زنی خریداران (متوسط):</strong> خریداران بزرگ (پروژه‌های عمرانی، خودروسازان) قدرت چانه‌زنی دارند، اما پراکندگی خریداران خرد این قدرت را تعدیل می‌کند.</p>
                        <p><strong className="text-slate-800 dark:text-slate-100">۴. قدرت چانه‌زنی تامین‌کنندگان (متوسط تا بالا):</strong> تامین‌کنندگان اصلی مواد اولیه (سنگ آهن، زغال سنگ) به دلیل تمرکز، قدرت بالایی دارند.</p>
                        <p><strong className="text-slate-800 dark:text-slate-100">۵. تهدید محصولات جایگزین (پایین تا متوسط):</strong> در ساخت و ساز، بتن و کامپوزیت‌ها جایگزین هستند، اما کارایی و هزینه فولاد همچنان مزیت رقابتی ایجاد می‌کند.</p>
                    </div>
                </Card>
                 <Card>
                    <h3 className="font-bold mb-4 text-lg">توصیه‌های استراتژیک بازار</h3>
                    <ul className="list-disc list-inside space-y-3 text-sm">
                        <li><strong>برای تولیدکنندگان:</strong> تمرکز بر کاهش هزینه‌های تولید از طریق بهینه‌سازی مصرف انرژی و نوسازی تجهیزات. توسعه بازارهای صادراتی جدید در منطقه CIS و آفریقا.</li>
                        <li><strong>برای مصرف‌کنندگان عمده:</strong> انعقاد قراردادهای خرید بلندمدت برای پوشش ریسک نوسانات قیمت. مدیریت موجودی و خرید در کف‌های قیمتی فصلی.</li>
                        <li><strong>برای سرمایه‌گذاران:</strong> سرمایه‌گذاری در شرکت‌های دارای زنجیره تامین کامل (از معدن تا محصول نهایی) که در مقابل نوسانات مواد اولیه مقاوم‌تر هستند.</li>
                    </ul>
                </Card>
                 <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                    تحلیل‌ها بر اساس داده‌های عمومی بازار و گزارشات صنعتی معتبر تهیه شده است.
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AnalysisPage;