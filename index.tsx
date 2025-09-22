

import React, { useState, useMemo, useCallback, useEffect, useRef, memo, Component, ErrorInfo, ReactNode, useContext } from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Import `createPortal` from `react-dom` to be used in the Modal component.
import { createPortal } from 'react-dom';
import { AreaChart, Area, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Legend, ReferenceLine } from 'recharts';
import { GoogleGenAI, Chat } from '@google/genai';

// --- BUNDLED FROM types.ts ---
// FIX: Import React to make React types available for JSX namespace augmentation.
// This is already handled by the top-level import in the bundled file.

enum Page {
  DASHBOARD,
  ANALYSIS,
  PRICES,
  NEWS,
  PREMIUM_ANALYSIS,
  PREDICTION,
}

interface TechnicalInfo {
    signal: 'buy' | 'sell' | 'hold';
    rsi: number;
    support: number;
    resistance: number;
    summary: string;
}

interface ProductData {
  title: string;
  price: number;
  change: number;
  weeklyChange: number;
  monthlyChange: number;
  volume: number;
  analysis: string[];
  strategy: string[];
  chartData: number[];
  unit: string;
  source: string;
  lastUpdated: string;
  technicalInfo: TechnicalInfo;
}

interface GlobalCommodityData {
    title: string;
    chartData: number[];
    unit: string;
    source: string;
    lastUpdated: string;
    technicalInfo: TechnicalInfo;
}

interface ProductsData {
    [key: string]: ProductData;
}

interface GlobalCommoditiesData {
    [key: string]: GlobalCommodityData;
}

type NewsCategory = 'global-market' | 'iran-companies' | 'raw-materials' | 'policy' | 'financial' | 'logistics' | 'educational' | 'clean-energy';
type NewsCountry = 'all' | 'iran' | 'china' | 'eu' | 'usa' | 'india';
type NewsType = 'all' | 'economic' | 'political' | 'technical';
type NewsTimeFilter = 'all' | '24h' | '7d' | '30d';

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  source: string;
  credibility: 'high' | 'medium' | 'low';
  publishedAt: Date;
  category: NewsCategory;
  country: Omit<NewsCountry, 'all'>;
  type: Omit<NewsType, 'all'>;
}

// Types for Premium Analysis Page
interface Expert {
  name: string;
  credentials: string;
}

interface ReportContent {
  standard: string;
  brief: string;
}

type ReportType = 'daily' | 'weekly' | 'monthly' | 'technical' | 'fundamental';

interface PremiumReport {
  id: number;
  title: string;
  type: ReportType;
  author: Expert;
  publishedAt: Date;
  content: ReportContent;
  keyTakeaways: string[];
  chartData?: any; // Define a more specific type if chart structure is known
  downloadUrl: string;
}

// Types for AI Prediction Page
interface PredictionDataPoint {
  name: string;
  low: number;
  mid: number;
  high: number;
  actual?: number;
}

interface PredictionInputFactor {
  name: string;
  impact: string;
  direction: 'up' | 'down';
  description: string;
}

interface PredictionScenario {
  condition: string;
  outcome: string;
  description: string;
}

interface PredictionResult {
  accuracy: number;
  forecast: PredictionDataPoint[];
  factors: PredictionInputFactor[];
  scenarios: PredictionScenario[];
}

interface WhatIfVariable {
    id: 'dollar' | 'oil' | 'ironOre' | 'cokingCoal';
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
}

interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    sources?: { uri: string; title: string }[];
}


type PredictionData = Record<string, Record<string, PredictionResult>>;
type WhatIfData = Record<string, WhatIfVariable>;

// --- BUNDLED FROM contexts/ThemeContext.tsx ---
type Theme = 'light' | 'dark';
const ThemeContext = React.createContext<{ theme: Theme; toggleTheme: () => void; } | null>(null);

// --- BUNDLED FROM utils/date.ts ---
const getPastMonthLabels = (): string[] => {
    const labels: string[] = Array(30).fill('');
    labels[0] = '۱ ماه قبل';
    labels[7] = '۳ هفته قبل';
    labels[14] = '۲ هفته قبل';
    labels[21] = '۱ هفته قبل';
    labels[29] = 'اکنون';
    return labels;
};
const getPastDaysLabels = (count: number): string[] => {
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    const today = new Date().getDay();
    const labels: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
        labels.push(days[(today - i + 7) % 7]);
    }
    return labels;
};

// --- BUNDLED FROM utils/chartData.ts ---
const generateMonthlyData = (startValue: number, endValue: number, points: number): number[] => {
    const data: number[] = [];
    for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);
        const linearValue = startValue + (endValue - startValue) * progress;
        const volatility = Math.sin((i / points) * Math.PI * 6) * ((endValue - startValue) * 0.08); // More frequent waves
        const noise = (Math.random() - 0.5) * (endValue * 0.03); // Daily noise
        data.push(Math.round(linearValue + volatility + noise));
    }
    data[points - 1] = endValue;
    return data;
};
const calculateSMA = (data: number[], period: number): (number | null)[] => {
    const sma: (number | null)[] = Array(data.length).fill(null);
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        sma[i] = Math.round(sum / period);
    }
    return sma;
};

// --- BUNDLED FROM data.ts ---
const lastUpdatedDate = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
const productsData: ProductsData = {
  'hot-rolled': {
    title: 'ورق گرم',
    price: 42100, change: 0.7, weeklyChange: 1.8, monthlyChange: 4.5, volume: 4500,
    analysis: ['افزایش تقاضای فصلی در بخش ساخت و ساز، قیمت را تقویت کرده است.', 'محدودیت‌های عرضه به دلیل برنامه‌های تعمیراتی کارخانجات اصلی، همچنان پابرجاست.', 'نرخ ارز به عنوان عامل کلیدی، هزینه تمام شده تولید را بالا نگه داشته است.', 'صادرات به بازارهای منطقه‌ای با نرخ رشد ۵٪ ادامه دارد.'],
    strategy: ['استراتژی خرید: خرید پله‌ای با دید میان‌مدت همچنان توصیه می‌شود.', 'هدف قیمتی: ۴۳,۰۰۰ تومان در دو هفته آینده.', 'نقاط ورود: زیر ۴۲,۰۰۰ تومان برای ورود اول جذاب است.', 'مدیریت ریسک: تثبیت قیمت زیر ۴۱,۲۰۰ تومان می‌تواند نشانه اصلاح باشد.'],
    chartData: [41500, 41800, 41600, 41900, 42000, 41950, 42100],
    unit: 'تومان/کیلو',
    source: 'بورس کالای ایران',
    lastUpdated: lastUpdatedDate,
    technicalInfo: {
        signal: 'hold',
        rsi: 68,
        support: 41500,
        resistance: 42800,
        summary: 'قیمت در نزدیکی منطقه مقاومت قرار دارد و RSI به منطقه اشباع خرید نزدیک می‌شود. احتمال یک اصلاح کوتاه‌مدت وجود دارد. توصیه به احتیاط و انتظار برای شکست مقاومت یا بازگشت به سمت حمایت است.'
    },
  },
  'cold-rolled': {
    title: 'ورق سرد',
    price: 48200, change: 1.5, weeklyChange: 2.1, monthlyChange: 5.8, volume: 3450,
    analysis: ['تقاضای قوی از سوی صنایع خودروسازی و لوازم خانگی، محرک اصلی رشد قیمت است.', 'موجودی انبارها به کمترین سطح در سه ماه اخیر رسیده است.', 'افزایش قیمت جهانی ورق، از قیمت‌های داخلی حمایت می‌کند.'],
    strategy: ['استراتژی خرید: برای مصرف‌کنندگان نهایی، خرید بخشی از نیاز ۳ ماه آینده توصیه می‌شود.', 'هدف قیمتی: ۴۹,۰۰۰ تومان.', 'نقاط ورود: زیر ۴۸,۰۰۰ تومان.', 'مدیریت ریسک: حد ضرر در ۴۷,۳۰۰ تومان.'],
    chartData: [46800, 47200, 47500, 47800, 47700, 48000, 48200],
    unit: 'تومان/کیلو',
    source: 'بورس کالای ایران',
    lastUpdated: lastUpdatedDate,
    technicalInfo: {
        signal: 'buy',
        rsi: 75,
        support: 47500,
        resistance: 48500,
        summary: 'روند صعودی قوی است اما RSI وارد منطقه اشباع خرید شده. هرچند سیگنال خرید است اما ورود پله‌ای و با احتیاط توصیه می‌شود. شکست مقاومت ۴۸۵۰۰ می‌تواند رشد را تسریع کند.'
    },
  },
  'galvanized': {
    title: 'ورق گالوانیزه',
    price: 53100, change: 1.2, weeklyChange: 2.5, monthlyChange: 6.9, volume: 2900,
    analysis: ['افزایش قیمت جهانی "روی" (Zinc) هزینه تولید را مستقیماً افزایش داده است.', 'تقاضا در صنایع مرتبط با ساختمان و کشاورزی پایدار است.', 'صادرات به کشورهای همسایه با رشد ۸٪ همراه بوده است.'],
    strategy: ['استراتژی خرید: مناسب پروژه‌هایی که به زودی آغاز می‌شوند.', 'هدف قیمتی: ۵۴,۵۰۰ تومان.', 'نقاط ورود: زیر ۵۳,۰۰۰ تومان.', 'مدیریت ریسک: حد ضرر در ۵۲,۲۰۰ تومان.'],
    chartData: [51000, 51500, 52000, 52500, 52800, 52900, 53100],
    unit: 'تومان/کیلو',
    source: 'بورس کالای ایران',
    lastUpdated: lastUpdatedDate,
    technicalInfo: {
        signal: 'buy',
        rsi: 65,
        support: 52000,
        resistance: 54000,
        summary: 'روند صعودی پایدار با RSI در محدوده مناسب. تا زمانی که قیمت بالای حمایت ۵۲۰۰۰ تومان قرار دارد، چشم‌انداز مثبت است. هدف بعدی، مقاومت ۵۴۰۰۰ تومان است.'
    },
  },
  'rebars': {
    title: 'میلگرد',
    price: 25150, change: 0.6, weeklyChange: 1.5, monthlyChange: 3.8, volume: 7200,
    analysis: ['رونق نسبی در پروژه‌های عمرانی کوچک مقیاس، تقاضا را تحریک کرده است.', 'قیمت قراضه به عنوان ماده اولیه اصلی، در سطح بالایی باقی مانده است.', 'انتظار می‌رود با شروع پروژه‌های بزرگ دولتی، تقاضا جهش یابد.'],
    strategy: ['استراتژی خرید: خرید برای پروژه‌های در حال اجرا توصیه می‌شود.', 'هدف قیمتی: ۲۶,۰۰۰ تومان.', 'نقاط ورود: زیر ۲۵,۰۰۰ تومان.', 'مدیریت ریسک: حد ضرر در ۲۴,۵۰۰ تومان.'],
    chartData: [24500, 24700, 24800, 24950, 25100, 25050, 25150],
    unit: 'تومان/کیلو',
    source: 'بورس کالای ایران',
    lastUpdated: lastUpdatedDate,
    technicalInfo: {
        signal: 'hold',
        rsi: 62,
        support: 24800,
        resistance: 25500,
        summary: 'قیمت در یک کانال خنثی با تمایل به صعود قرار دارد. برای خرید، بهتر است منتظر شکست مقاومت ۲۵۵۰۰ یا اصلاح قیمت به سمت حمایت ۲۴۸۰۰ بود.'
    },
  },
  'i-beam': {
    title: 'تیرآهن',
    price: 39800, change: 0.5, weeklyChange: 1.2, monthlyChange: 3.2, volume: 5800,
    analysis: ['بازار در انتظار تعریف پروژه‌های جدید صنعتی و ساختمانی است.', 'ذوب آهن اصفهان به عنوان تعیین‌کننده اصلی قیمت، عرضه‌ها را مدیریت می‌کند.', 'رقابت با محصولات وارداتی محدود است.'],
    strategy: ['استراتژی خرید: وضعیت خنثی، خرید صرفاً برای نیاز فوری.', 'هدف قیمتی: ۴۰,۵۰۰ تومان.', 'نقاط ورود: زیر ۳۹,۵۰۰ تومان.', 'مدیریت ریسک: کنترل کیفیت محصول در زمان تحویل.'],
    chartData: [38900, 39100, 39300, 39500, 39600, 39700, 39800],
    unit: 'تومان/کیلو',
    source: 'بورس کالای ایران',
    lastUpdated: lastUpdatedDate,
    technicalInfo: {
        signal: 'hold',
        rsi: 58,
        support: 39000,
        resistance: 40500,
        summary: 'روند حرکتی کند و نوسانات محدود است. بازار در حالت انتظار به سر می‌برد. استراتژی مناسب، خرید در کف‌های قیمتی و فروش در سقف‌ها است.'
    },
  },
  'slab': {
    title: 'اسلب',
    price: 35200, change: 0.9, weeklyChange: 1.6, monthlyChange: 2.8, volume: 16000,
    analysis: ['به عنوان محصول مادر، قیمت آن نشانگر روند آتی بازار ورق است.', 'تقاضای کارخانجات نورد داخلی در سطح بالایی قرار دارد.', 'قیمت سنگ آهن جهانی، هزینه تولید را تحت تاثیر قرار داده است.'],
    strategy: ['استراتژی خرید: مناسب برای قراردادهای بلندمدت کارخانجات نورد.', 'هدف قیمتی: ۳۶,۵۰۰ تومان.', 'نقاط ورود: زیر ۳۵,۰۰۰ تومان.', 'مدیریت ریسک: کنترل آنالیز شیمیایی محصول.'],
    chartData: [34100, 34500, 34800, 34700, 34900, 35000, 35200],
    unit: 'تومان/کیلو',
    source: 'بورس کالای ایران',
    lastUpdated: lastUpdatedDate,
    technicalInfo: {
        signal: 'buy',
        rsi: 70,
        support: 34500,
        resistance: 35800,
        summary: 'قیمت با قدرت در حال صعود است. RSI به مرز اشباع خرید رسیده اما حجم معاملات بالا، نشان از قدرت خریداران دارد. هدف اول مقاومت ۳۵۸۰۰ است.'
    },
  },
};
const globalCommoditiesData: GlobalCommoditiesData = {
    'hrc': {
        title: 'فولاد HRC',
        chartData: [752, 770, 785, 775, 765, 770, 778],
        unit: 'دلار/تن',
        source: 'S&P Global Platts',
        lastUpdated: lastUpdatedDate,
        technicalInfo: {
            signal: 'hold',
            rsi: 55,
            support: 760,
            resistance: 790,
            summary: 'قیمت در یک محدوده نوسانی قرار دارد. برای تعیین جهت بعدی بازار، باید منتظر شکست یکی از سطوح حمایت یا مقاومت بود.'
        },
    },
    'iron-ore': {
        title: 'سنگ آهن',
        chartData: [115, 118, 120, 119, 121, 123, 122],
        unit: 'دلار/تن',
        source: 'Fastmarkets MB',
        lastUpdated: lastUpdatedDate,
        technicalInfo: {
            signal: 'hold',
            rsi: 60,
            support: 118,
            resistance: 125,
            summary: 'روند صعودی کوتاه‌مدت است اما برای عبور از مقاومت ۱۲۵ دلاری نیاز به محرک تقاضای قوی‌تری از سوی چین دارد. در حال حاضر سیگنال خنثی است.'
        },
    },
    'coking-coal': {
        title: 'زغال سنگ کک شو',
        chartData: [230, 238, 245, 242, 248, 250, 253],
        unit: 'دلار/تن',
        source: 'Argus Media',
        lastUpdated: lastUpdatedDate,
        technicalInfo: {
            signal: 'buy',
            rsi: 68,
            support: 240,
            resistance: 260,
            summary: 'روند صعودی قوی با حمایت میانگین‌های متحرک. تا زمانی که قیمت بالای حمایت ۲۴۰ دلار است، چشم‌انداز مثبت باقی می‌ماند.'
        },
    },
    'scrap-metal': {
        title: 'قراضه آهن ترکیه',
        chartData: [425, 420, 430, 435, 432, 438, 440],
        unit: 'دلار/تن',
        source: 'Metal Bulletin',
        lastUpdated: lastUpdatedDate,
        technicalInfo: {
            signal: 'sell',
            rsi: 72,
            support: 430,
            resistance: 445,
            summary: 'قیمت به سقف کانال صعودی رسیده و RSI در منطقه اشباع خرید قرار دارد. احتمال اصلاح قیمت به سمت حمایت ۴۳۰ دلار وجود دارد.'
        },
    },
    'nickel': {
        title: 'نیکل',
        chartData: [18200, 18000, 18500, 18300, 18600, 18750, 18800],
        unit: 'دلار/تن',
        source: 'LME (London Metal Exchange)',
        lastUpdated: lastUpdatedDate,
        technicalInfo: {
            signal: 'hold',
            rsi: 59,
            support: 18000,
            resistance: 19000,
            summary: 'پس از یک دوره نزولی، قیمت در حال تثبیت است. شکست مقاومت ۱۹۰۰۰ دلاری می‌تواند سیگنال شروع یک روند صعودی جدید باشد.'
        },
    },
    'rebar-futures': {
        title: 'میلگرد فیوچرز چین',
        chartData: [530, 515, 528, 535, 540, 538, 542],
        unit: 'دلار/تن',
        source: 'Shanghai Futures Exchange',
        lastUpdated: lastUpdatedDate,
        technicalInfo: {
            signal: 'buy',
            rsi: 63,
            support: 525,
            resistance: 550,
            summary: 'قیمت پس از اصلاح، مجدداً به روند صعودی بازگشته است. هدف بعدی، مقاومت ۵۵۰ دلاری است. سیگنال خرید تا زمانی که بالای حمایت ۵۲۵ دلار قرار دارد، معتبر است.'
        },
    }
};

// --- BUNDLED FROM data/news.ts ---
const categoryInfo: Record<NewsCategory, { name: string; color: string; }> = {
    'global-market': { name: 'بازار جهانی فولاد', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400' },
    'iran-companies': { name: 'شرکت‌های فولادی ایران', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' },
    'raw-materials': { name: 'تأمین مواد اولیه', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' },
    'policy': { name: 'سیاست‌های تجاری و تحریم‌ها', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' },
    'financial': { name: 'بازارهای مالی', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' },
    'logistics': { name: 'لجستیک و حمل‌ونقل', color: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
    'educational': { name: 'مقالات آموزشی', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400' },
    'clean-energy': { name: 'اخبار انرژی پاک', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-400' }
};
const now = new Date();
const minutesAgo = (min: number) => new Date(now.getTime() - min * 60 * 1000);
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
const newsData: Article[] = [
    {
      id: 1,
      title: 'فولاد مبارکه رکورد تولید ماهانه را شکست',
      summary: 'شرکت فولاد مبارکه اصفهان با تولید ۱.۲ میلیون تن فولاد خام در ماه گذشته، رکورد جدیدی را در تاریخ خود ثبت کرد.',
      content: 'این موفقیت در شرایطی حاصل شده که شرکت با چالش‌های تامین انرژی و مواد اولیه روبرو بوده است. مدیرعامل شرکت این دستاورد را نتیجه تلاش بی‌وقفه کارکنان و برنامه‌ریزی دقیق دانست.',
      source: 'روابط عمومی فولاد مبارکه',
      credibility: 'high',
      publishedAt: hoursAgo(2),
      category: 'iran-companies',
      country: 'iran',
      type: 'economic'
    },
    {
      id: 2,
      title: 'چین تعرفه واردات قراضه آهن را کاهش داد',
      summary: 'دولت چین در راستای حمایت از تولید فولاد سبز و کاهش آلایندگی، تعرفه واردات قراضه آهن را به صفر رساند.',
      content: 'این سیاست جدید می‌تواند منجر به افزایش تقاضای جهانی برای قراضه و تاثیر بر قیمت تمام شده فولاد در سایر کشورها، از جمله ایران، شود.',
      source: 'رویترز',
      credibility: 'high',
      publishedAt: hoursAgo(5),
      category: 'global-market',
      country: 'china',
      type: 'political'
    },
    {
      id: 16,
      title: 'آشنایی با گریدهای مختلف میلگرد و کاربرد آن‌ها',
      summary: 'در این مقاله به بررسی استانداردهای مختلف میلگرد از جمله A1، A2، A3 و A4 و کاربرد هر یک در صنعت ساختمان می‌پردازیم.',
      content: 'انتخاب گرید مناسب میلگرد بر اساس نوع سازه و بارهای وارده، نقش کلیدی در ایمنی و دوام ساختمان دارد. در این مطلب، تفاوت‌های مکانیکی و شیمیایی این گریدها تشریح می‌شود.',
      source: 'آکادمی فولاد',
      credibility: 'medium',
      publishedAt: hoursAgo(6),
      category: 'educational',
      country: 'iran',
      type: 'technical'
    },
    {
      id: 3,
      title: 'تحریم‌های جدید اتحادیه اروپا علیه بخش فولاد ایران',
      summary: 'اتحادیه اروپا در بسته تحریمی جدید خود، چندین شرکت فولادی و مدیران آن‌ها را به لیست تحریم‌ها اضافه کرد.',
      content: 'این تحریم‌ها شامل مسدودسازی دارایی‌ها و ممنوعیت سفر به کشورهای عضو اتحادیه اروپا می‌شود و می‌تواند بر صادرات فولاد ایران به این منطقه تاثیرگذار باشد.',
      source: 'بلومبرگ',
      credibility: 'high',
      publishedAt: hoursAgo(8),
      category: 'policy',
      country: 'eu',
      type: 'political'
    },
    {
      id: 17,
      title: 'پروژه نیروگاه خورشیدی فولاد خوزستان به بهره‌برداری رسید',
      summary: 'نیروگاه خورشیدی ۱۰۰ مگاواتی شرکت فولاد خوزستان با هدف تامین انرژی پایدار و کاهش هزینه‌ها وارد مدار تولید شد.',
      content: 'این پروژه بخشی از برنامه بلندمدت این شرکت برای حرکت به سمت تولید فولاد سبز و کاهش وابستگی به شبکه سراسری برق است که می‌تواند الگویی برای سایر صنایع باشد.',
      source: 'ایسنا',
      credibility: 'high',
      publishedAt: hoursAgo(12),
      category: 'clean-energy',
      country: 'iran',
      type: 'economic'
    },
    {
      id: 4,
      title: 'قیمت سنگ آهن به دلیل نگرانی از تقاضا کاهش یافت',
      summary: 'قیمت سنگ آهن در بازار دالیان با کاهش ۳ درصدی مواجه شد. نگرانی از کندی رشد اقتصادی چین عامل اصلی این کاهش است.',
      content: 'تحلیلگران معتقدند تا زمانی که محرک‌های اقتصادی قوی در چین مشاهده نشود، فشار بر قیمت سنگ آهن ادامه خواهد داشت.',
      source: 'متال بولتن',
      credibility: 'medium',
      publishedAt: hoursAgo(22),
      category: 'raw-materials',
      country: 'china',
      type: 'economic'
    },
    {
      id: 5,
      title: 'سهام "فولاد" در بورس تهران صف خرید شد',
      summary: 'پس از انتشار گزارش عملکرد مثبت سه ماهه، سهام شرکت فولاد خوزستان با افزایش تقاضا و صف خرید روبرو شد.',
      content: 'رشد سودآوری و برنامه‌های توسعه‌ای این شرکت از دلایل اصلی اقبال سرمایه‌گذاران به این نماد در بازار سرمایه عنوان شده است.',
      source: 'بورس پرس',
      credibility: 'medium',
      publishedAt: daysAgo(1),
      category: 'financial',
      country: 'iran',
      type: 'economic'
    },
    {
      id: 6,
      title: 'هند به دنبال افزایش تولید فولاد به ۳۰۰ میلیون تن تا ۲۰۳۰',
      summary: 'دولت هند برنامه‌های جامعی را برای حمایت از صنعت فولاد و رساندن ظرفیت تولید به ۳۰۰ میلیون تن در سال تا پایان دهه جاری اعلام کرد.',
      content: 'این برنامه شامل سرمایه‌گذاری در زیرساخت‌ها، تسهیل قوانین و حمایت از فناوری‌های نوین در تولید فولاد می‌شود.',
      source: 'ایندیا تایمز',
      credibility: 'medium',
      publishedAt: daysAgo(2),
      category: 'global-market',
      country: 'india',
      type: 'political'
    },
    {
      id: 7,
      title: 'اختلال در حمل‌ونقل دریایی و افزایش هزینه لجستیک فولاد',
      summary: 'تنش‌ها در دریای سرخ باعث تغییر مسیر کشتی‌ها و افزایش چشمگیر هزینه‌های حمل‌ونقل دریایی برای محموله‌های فولادی شده است.',
      content: 'این افزایش هزینه می‌تواند قیمت نهایی فولاد صادراتی و وارداتی را در بازارهای جهانی تحت تاثیر قرار دهد.',
      source: 'فایننشال تایمز',
      credibility: 'high',
      publishedAt: daysAgo(3),
      category: 'logistics',
      country: 'eu',
      type: 'economic'
    },
    {
      id: 18,
      title: 'نقش هیدروژن سبز در آینده صنعت فولاد',
      summary: 'استفاده از هیدروژن سبز به جای سوخت‌های فسیلی در فرآیند احیای آهن، می‌تواند انقلابی در تولید فولاد پاک ایجاد کند. این مقاله به بررسی چالش‌ها و فرصت‌های این فناوری می‌پردازد.',
      content: 'شرکت‌های پیشرو در اروپا در حال سرمایه‌گذاری‌های کلان در این زمینه هستند، اما هزینه بالای تولید هیدروژن سبز همچنان بزرگترین مانع برای تجاری‌سازی گسترده آن است.',
      source: 'World Steel Association',
      credibility: 'high',
      publishedAt: daysAgo(3),
      category: 'clean-energy',
      country: 'eu',
      type: 'technical'
    },
    {
      id: 8,
      title: 'ذوب آهن اصفهان قرارداد صادرات ریل به عراق امضا کرد',
      summary: 'شرکت ذوب آهن اصفهان قراردادی به ارزش ۵۰ میلیون دلار برای صادرات ریل ملی به کشور عراق منعقد کرد.',
      content: 'این قرارداد در راستای توسعه بازارهای صادراتی و ارزآوری برای کشور صورت گرفته و نشان از کیفیت بالای محصولات این شرکت دارد.',
      source: 'خبرگزاری ایرنا',
      credibility: 'high',
      publishedAt: daysAgo(4),
      category: 'iran-companies',
      country: 'iran',
      type: 'economic'
    },
    {
      id: 9,
      title: 'آمریکا تعرفه ۲۵ درصدی بر فولاد وارداتی را تمدید کرد',
      summary: 'دولت آمریکا اعلام کرد که تعرفه‌های ۲۵ درصدی بر واردات فولاد از اکثر کشورها را برای یک سال دیگر تمدید خواهد کرد.',
      content: 'این سیاست که از دوران ریاست جمهوری ترامپ آغاز شده، با هدف حمایت از تولیدکنندگان داخلی فولاد آمریکا ادامه می‌یابد.',
      source: 'وال استریت ژورنال',
      credibility: 'high',
      publishedAt: daysAgo(6),
      category: 'policy',
      country: 'usa',
      type: 'political'
    },
    {
      id: 19,
      title: 'فرآیند نورد گرم و نورد سرد: تفاوت‌ها چیست؟',
      summary: 'این مقاله آموزشی به زبان ساده، تفاوت‌های اصلی بین فرآیندهای نورد گرم و نورد سرد، و تاثیر آن‌ها بر خواص مکانیکی و ظاهر محصول نهایی را توضیح می‌دهد.',
      content: 'درک این تفاوت‌ها برای انتخاب ورق مناسب برای کاربردهای مختلف، از بدنه خودرو گرفته تا مصالح ساختمانی، ضروری است.',
      source: 'متال‌پدیا',
      credibility: 'low',
      publishedAt: daysAgo(7),
      category: 'educational',
      country: 'usa',
      type: 'technical'
    },
    {
      id: 10,
      title: 'استفاده از هوش مصنوعی در بهینه‌سازی تولید فولاد',
      summary: 'یک شرکت فولادسازی در آلمان با استفاده از الگوریتم‌های هوش مصنوعی، مصرف انرژی خود را تا ۱۵ درصد کاهش داده است.',
      content: 'این فناوری با تحلیل داده‌های خط تولید، نقاط ضعف را شناسایی کرده و راهکارهای بهینه‌سازی را به صورت خودکار پیشنهاد می‌دهد.',
      source: 'تک کرانچ',
      credibility: 'medium',
      publishedAt: daysAgo(8),
      category: 'global-market',
      country: 'eu',
      type: 'technical'
    },
    {
      id: 11,
      title: 'پیش‌بینی آرامش نسبی در بازار ورق گرم داخلی',
      summary: 'تحلیلگران پیش‌بینی می‌کنند با توجه به تعادل عرضه و تقاضا، بازار ورق گرم تا پایان ماه نوسانات شدیدی را تجربه نخواهد کرد.',
      content: 'با این حال، نوسانات نرخ ارز همچنان به عنوان ریسک اصلی بازار مطرح است و می‌تواند این پیش‌بینی را تحت تاثیر قرار دهد.',
      source: 'تحلیل بازار',
      credibility: 'low',
      publishedAt: daysAgo(10),
      category: 'iran-companies',
      country: 'iran',
      type: 'economic'
    },
    {
      id: 12,
      title: 'کمبود کک در بازار جهانی قیمت‌ها را افزایش داد',
      summary: 'محدودیت‌های تولید در معادن استرالیا به دلیل شرایط جوی، منجر به کمبود عرضه و افزایش قیمت زغال سنگ کک‌شو در بازارهای جهانی شده است.',
      content: 'این افزایش قیمت، هزینه تمام شده تولید فولاد به روش کوره بلند را در سراسر جهان افزایش می‌دهد.',
      source: 'آرگوس مدیا',
      credibility: 'medium',
      publishedAt: daysAgo(15),
      category: 'raw-materials',
      country: 'china',
      type: 'economic'
    },
    {
      id: 13,
      title: 'توسعه بندر چابهار و تاثیر آن بر صادرات فولاد',
      summary: 'با تکمیل فازهای جدید بندر چابهار، ظرفیت صادرات مواد معدنی و فولاد از این بندر استراتژیک دو برابر خواهد شد.',
      content: 'این توسعه زیرساختی می‌تواند هزینه لجستیک را برای فولادسازان شرق کشور کاهش داده و مزیت رقابتی آنها را در بازارهای صادراتی افزایش دهد.',
      source: 'وزارت راه و شهرسازی',
      credibility: 'high',
      publishedAt: daysAgo(20),
      category: 'logistics',
      country: 'iran',
      type: 'economic'
    },
    {
      id: 14,
      title: 'عرضه اولیه سهام یک شرکت فولادی در فرابورس',
      summary: 'یک شرکت فعال در زمینه تولید لوله‌های فولادی، قصد دارد ۱۰ درصد از سهام خود را از طریق عرضه اولیه در بازار فرابورس ایران واگذار کند.',
      content: 'جزئیات این عرضه اولیه شامل دامنه قیمت و تاریخ دقیق آن به زودی توسط سازمان بورس و اوراق بهادار اعلام خواهد شد.',
      source: 'کدال',
      credibility: 'high',
      publishedAt: daysAgo(25),
      category: 'financial',
      country: 'iran',
      type: 'economic'
    },
    {
      id: 15,
      title: 'فناوری جدید برای تولید فولاد بدون کربن در سوئد',
      summary: 'پروژه HYBRIT در سوئد موفق به تولید آزمایشی اولین محموله فولاد با استفاده از هیدروژن سبز به جای زغال سنگ شد.',
      content: 'این دستاورد گام مهمی در راستای کربن‌زدایی از صنعت فولاد محسوب می‌شود، هرچند تجاری‌سازی آن همچنان با چالش هزینه روبرو است.',
      source: 'بی‌بی‌سی',
      credibility: 'high',
      publishedAt: daysAgo(40),
      category: 'global-market',
      country: 'eu',
      type: 'technical'
    },
];

// --- BUNDLED FROM data/premiumAnalysis.ts ---
const analystTeam: Expert = {
  name: 'تیم تحلیلگران ارشد',
  credentials: 'متخصصین بازار فولاد و انرژی'
};
const premiumReports: PremiumReport[] = [
  {
    id: 1,
    title: 'پالس بازار روزانه: تأثیر نرخ ارز بر قیمت میلگرد',
    type: 'daily',
    author: analystTeam,
    publishedAt: new Date(),
    content: {
      brief: 'نرخ دلار در بازار آزاد با افزایش ۰.۵ درصدی به ۶۱,۸۵۰ تومان رسید. این افزایش، هزینه تمام شده تولید را برای کارخانجاتی که به مواد اولیه وارداتی وابسته‌اند، بالا برده و منجر به رشد قیمت میلگرد در بورس کالا شده است. انتظار می‌رود این روند صعودی کوتاه‌مدت ادامه یابد.',
      standard: `
        <p>در معاملات امروز بازار ارز، شاهد رشد مجدد نرخ دلار بودیم که به عنوان یک سیگنال مهم برای بازارهای کالایی عمل می‌کند. افزایش ۰.۵ درصدی و رسیدن به مرز ۶۲ هزار تومان، فشار هزینه‌ای جدیدی را به تولیدکنندگان فولاد، به خصوص در بخش‌هایی که به قراضه یا الکترود گرافیتی وارداتی وابستگی دارند، تحمیل کرده است.</p>
        <p>در بورس کالا، معاملات میلگرد با افزایش قیمت نسبی همراه بود. تقاضای موجود در بازار، که بخشی از آن ناشی از نگرانی برای افزایش بیشتر قیمت‌هاست، از این رشد حمایت کرد. تحلیلگران معتقدند تا زمانی که بانک مرکزی سیاست مشخصی برای کنترل نوسانات ارزی اتخاذ نکند، این روند صعودی محتاطانه در بازار فولاد ادامه خواهد داشت. شاخص کل فولاد نیز با رشد ۰.۹ درصدی به ۱۲,۷۸۰ واحد رسید که نشان‌دهنده چشم‌انداز مثبت کوتاه‌مدت در بازار است.</p>
      `
    },
    keyTakeaways: [
      'افزایش ۰.۵ درصدی نرخ دلار و رسیدن به ۶۱,۸۵۰ تومان.',
      'رشد قیمت میلگرد در بورس کالا به دلیل افزایش هزینه تولید.',
      'پیش‌بینی تداوم روند صعودی کوتاه‌مدت در صورت عدم کنترل نوسانات ارزی.'
    ],
    downloadUrl: '#'
  },
  {
    id: 2,
    title: 'تحلیل تکنیکال شاخص کل فولاد و سهام پیشرو',
    type: 'technical',
    author: analystTeam,
    publishedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    content: {
      brief: 'شاخص کل فولاد در محدوده مقاومتی ۱۲,۸۰۰ واحد قرار دارد. اندیکاتور RSI در منطقه اشباع خرید قرار گرفته که احتمال یک اصلاح کوتاه‌مدت را افزایش می‌دهد. سطح حمایتی کلیدی در ۱۲,۵۰۰ واحد قرار دارد. برای سهام فولاد مبارکه (فولاد)، مقاومت اصلی در ۴,۵۰۰ تومان و حمایت در ۴,۲۰۰ تومان است.',
      standard: `
        <h4>تحلیل شاخص کل فولاد</h4>
        <p>شاخص کل فولاد پس از یک رالی صعودی قدرتمند، به سطح مقاومت استاتیک مهمی در محدوده ۱۲,۸۰۰ واحد رسیده است. همانطور که در نمودار مشخص است، این سطح در گذشته نیز به عنوان یک منطقه عرضه عمل کرده است. اندیکاتور RSI (شاخص قدرت نسبی) با عبور از عدد ۷۰، وارد منطقه اشباع خرید شده که هشداری برای احتمال خستگی خریداران و آغاز یک فاز اصلاحی است. میانگین متحرک ۷ روزه همچنان به عنوان حمایت دینامیک عمل می‌کند، اما شکست آن می‌تواند سیگنال نزولی باشد.</p>
        
        <h4>تحلیل سهام فولاد مبارکه (فولاد)</h4>
        <p>نماد "فولاد" به عنوان لیدر گروه، الگویی مشابه شاخص کل را نشان می‌دهد. قیمت به مقاومت تاریخی خود در ۴,۵۰۰ تومان نزدیک شده است. حجم معاملات در روزهای اخیر افزایش یافته که نشان از اهمیت این سطح دارد. در صورت شکست این مقاومت، هدف بعدی می‌تواند محدوده ۴,۸۰۰ تومان باشد. در سناریوی نزولی، اولین سطح حمایتی معتبر در ۴,۲۰۰ تومان قرار دارد.</p>
      `
    },
    keyTakeaways: [
      'شاخص کل در محدوده مقاومت ۱۲,۸۰۰ واحدی است.',
      'RSI در منطقه اشباع خرید، احتمال اصلاح قیمت وجود دارد.',
      'سطح حمایتی کلیدی برای شاخص: ۱۲,۵۰۰ واحد.',
      'مقاومت نماد "فولاد": ۴,۵۰۰ تومان؛ حمایت: ۴,۲۰۰ تومان.'
    ],
    chartData: {
      data: [
        { name: '۱۰ روز قبل', value: 12450, ma: null },
        { name: '۹ روز قبل', value: 12480, ma: null },
        { name: '۸ روز قبل', value: 12520, ma: null },
        { name: '۷ روز قبل', value: 12510, ma: null },
        { name: '۶ روز قبل', value: 12580, ma: null },
        { name: '۵ روز قبل', value: 12650, ma: null },
        { name: '۴ روز قبل', value: 12630, ma: 12540 },
        { name: '۳ روز قبل', value: 12700, ma: 12581 },
        { name: '۲ روز قبل', value: 12750, ma: 12631 },
        { name: 'دیروز', value: 12780, ma: 12684 },
      ],
      support: 12500,
      resistance: 12800,
    },
    downloadUrl: '#'
  },
    {
    id: 4,
    title: 'تحلیل عمیق بازار ورق‌های تخت فولادی: چالش‌ها و فرصت‌ها',
    type: 'fundamental',
    author: analystTeam,
    publishedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    content: {
      brief: 'بازار ورق‌های تخت (گرم و سرد) با تقاضای پایدار از سوی صنایع خودروسازی و لوازم خانگی روبروست. چالش اصلی، تامین اسلب با قیمت رقابتی و نوسانات قیمت جهانی است. فرصت کلیدی در توسعه ورق‌های با ارزش افزوده بالا مانند ورق‌های گالوانیزه و رنگی برای بازارهای صادراتی نهفته است.',
      standard: `
        <p>ورق‌های تخت فولادی به عنوان یکی از استراتژیک‌ترین محصولات زنجیره فولاد، نقش حیاتی در صنایع پایین‌دستی ایفا می‌کنند. در حال حاضر، تقاضا از سوی دو صنعت بزرگ خودروسازی و لوازم خانگی در سطح بالایی قرار دارد که از قیمت‌ها حمایت می‌کند.</p>
        <h4>چالش‌های کلیدی</h4>
        <ul>
            <li><b>تأمین مواد اولیه:</b> نوسانات قیمت اسلب در بازارهای جهانی و داخلی، مستقیماً بر هزینه تمام‌شده تولید ورق گرم تأثیر می‌گذارد.</li>
            <li><b>محدودیت‌های انرژی:</b> قطعی‌های برق در فصل تابستان می‌تواند ظرفیت تولید کارخانجات نورد را با چالش مواجه کند.</li>
        </ul>
        <h4>فرصت‌های پیش رو</h4>
        <p>با توجه به اشباع نسبی بازار داخلی، تمرکز بر صادرات محصولات با ارزش افزوده بالاتر مانند ورق‌های پوشش‌دار (گالوانیزه و رنگی) به کشورهای منطقه، می‌تواند منبع درآمد ارزی پایداری برای تولیدکنندگان ایجاد کند. همچنین، سرمایه‌گذاری در فناوری‌های نوین برای تولید ورق‌های ویژه مورد نیاز صنایع های-تک، یک فرصت بلندمدت محسوب می‌شود.</p>
      `
    },
    keyTakeaways: [
      'تقاضای پایدار از سوی صنایع خودروسازی و لوازم خانگی.',
      'تأمین اسلب و محدودیت‌های انرژی به عنوان چالش‌های اصلی.',
      'صادرات ورق‌های پوشش‌دار به عنوان فرصت کلیدی.',
      'لزوم حرکت به سمت تولید محصولات با ارزش افزوده بالا.'
    ],
    downloadUrl: '#'
  },
  {
    id: 5,
    title: 'انرژی پاک و آینده صنعت فولاد: از هیدروژن سبز تا فولاد سبز',
    type: 'monthly',
    author: analystTeam,
    publishedAt: new Date(new Date().setDate(new Date().getDate() - 4)),
    content: {
      brief: 'گذار جهانی به سمت اقتصاد کم‌کربن، صنعت فولاد را به سمت استفاده از انرژی‌های پاک سوق می‌دهد. تولید "فولاد سبز" با استفاده از هیدروژن به جای زغال سنگ، بزرگترین تحول این صنعت در قرن اخیر خواهد بود. شرکت‌های ایرانی باید استراتژی بلندمدت خود را برای همگام شدن با این روند جهانی تدوین کنند تا مزیت رقابتی خود را از دست ندهند.',
      standard: `
        <p>فشار جهانی برای کاهش انتشار گازهای گلخانه‌ای، صنعت فولاد را که یکی از بزرگترین منابع انتشار CO2 است، در مرکز توجه قرار داده است. مفهوم "فولاد سبز" به تولید فولاد با حداقل ردپای کربنی اشاره دارد که عمدتاً از طریق دو روش اصلی دنبال می‌شود: استفاده از کوره‌های قوس الکتریکی (EAF) با منبع برق تجدیدپذیر، و جایگزینی زغال سنگ با هیدروژن سبز در فرآیند احیای مستقیم آهن (DRI).</p>
        <p>هرچند هزینه تولید هیدروژن سبز در حال حاضر بالاست، اما سرمایه‌گذاری‌های عظیم در اروپا و چین نشان می‌دهد که این فناوری آینده صنعت فولاد را شکل خواهد داد. شرکت‌های فولادی ایران با توجه به پتانسیل بالای انرژی خورشیدی، می‌توانند در بلندمدت به یکی از قطب‌های تولید فولاد سبز در منطقه تبدیل شوند. این امر نه تنها به حفظ محیط زیست کمک می‌کند، بلکه با حذف موانع تجاری مرتبط با کربن (مانند مکانیزم تعدیل کربن مرزی اتحادیه اروپا CBAM)، درهای صادراتی جدیدی را باز خواهد کرد.</p>
      `
    },
    keyTakeaways: [
      'فولاد سبز به عنوان پارادایم جدید در صنعت فولاد مطرح است.',
      'هیدروژن سبز نقش کلیدی در کربن‌زدایی از فرآیند تولید دارد.',
      'سرمایه‌گذاری در انرژی‌های تجدیدپذیر برای فولادسازان ایرانی حیاتی است.',
      'تولید فولاد سبز یک مزیت رقابتی بلندمدت در بازارهای صادراتی خواهد بود.'
    ],
    downloadUrl: '#'
  },
  {
    id: 6,
    title: 'استراتژی‌های نوین فروش و توزیع در بازار فولاد',
    type: 'weekly',
    author: analystTeam,
    publishedAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    content: {
      brief: 'بازار سنتی فولاد در حال تحول است. حرکت به سمت پلتفرم‌های فروش آنلاین (E-commerce)، بازاریابی دیجیتال و ارائه خدمات ارزش افزوده (مانند برش و فرم‌دهی) به جای فروش صرف کالا، کلید موفقیت در بازار رقابتی امروز است. شرکت‌ها باید از مدل‌های توزیع سنتی فاصله گرفته و به سمت ارائه راه‌حل‌های جامع به مشتری حرکت کنند.',
      standard: `
        <p>دوران فروش سنتی فولاد از طریق واسطه‌ها و کانال‌های محدود به سر آمده است. با پیشرفت تکنولوژی، مشتریان انتظار شفافیت بیشتر، دسترسی آسان‌تر و خدمات سفارشی‌شده را دارند.</p>
        <h4>روندهای کلیدی:</h4>
        <ul>
            <li><b>پلتفرم‌های آنلاین:</b> ایجاد بسترهای تجارت الکترونیک برای ثبت سفارش آنلاین، مشاهده موجودی و پیگیری سفارشات، تجربه مشتری را بهبود بخشیده و هزینه‌های فروش را کاهش می‌دهد.</li>
            <li><b>بازاریابی محتوایی:</b> به جای تبلیغات مستقیم، شرکت‌ها می‌توانند با تولید محتوای آموزشی و فنی (مقالات، وبینارها) اعتماد مشتریان را جلب کرده و خود را به عنوان یک مرجع معتبر در صنعت معرفی کنند.</li>
            <li><b>خدمات ارزش افزوده:</b> ارائه خدماتی مانند برش دقیق، فرم‌دهی، انبارداری و مشاوره فنی، شرکت‌ها را از یک فروشنده کالا به یک "شریک تجاری" برای مشتریان تبدیل می‌کند و حاشیه سود را افزایش می‌دهد.</li>
        </ul>
        <p>شرکت‌هایی که بتوانند این استراتژی‌های نوین را در مدل کسب‌وکار خود ادغام کنند، نه تنها سهم بازار خود را افزایش خواهند داد، بلکه روابط پایدارتری با مشتریان خود ایجاد خواهند کرد.</p>
      `
    },
    keyTakeaways: [
      'گذار از فروش سنتی به پلتفرم‌های آنلاین ضروری است.',
      'بازاریابی محتوایی ابزاری قدرتمند برای اعتمادسازی است.',
      'ارائه خدمات ارزش افزوده، مزیت رقابتی پایدار ایجاد می‌کند.',
      'تمرکز باید از "فروش محصول" به "ارائه راه‌حل" تغییر کند.'
    ],
    downloadUrl: '#'
  },
  {
    id: 3,
    title: 'چشم‌انداز ماهانه صنعت: فرصت‌ها و تهدیدهای پیش رو',
    type: 'monthly',
    author: analystTeam,
    publishedAt: new Date(new Date().setDate(new Date().getDate() - 10)),
    content: {
      brief: 'چشم‌انداز ماه آینده برای صنعت فولاد، مثبت اما محتاطانه است. فرصت اصلی، آغاز پروژه‌های عمرانی فصلی و افزایش تقاضای داخلی است. تهدید اصلی، نوسانات نرخ ارز و سیاست‌های قیمت‌گذاری دستوری است که می‌تواند حاشیه سود تولیدکنندگان را تحت فشار قرار دهد. انتظار می‌رود بازار ورق گرم با ثبات نسبی و بازار میلگرد با رشد تقاضا مواجه شود.',
      standard: `
        <p>با ورود به فصل جدید، صنعت فولاد ایران در موقعیت حساسی قرار دارد. از یک سو، با گرم شدن هوا و آغاز پروژه‌های عمرانی دولتی و خصوصی، انتظار می‌رود تقاضا برای محصولات ساختمانی نظیر میلگرد و تیرآهن افزایش یابد. این یک فرصت کلیدی برای تولیدکنندگان داخلی است تا ظرفیت تولید خود را به کار گیرند.</p>
        <p>از سوی دیگر، تهدیدهای متعددی بر این چشم‌انداز سایه افکنده‌اند. نوسانات غیرقابل پیش‌بینی نرخ ارز، بزرگترین ریسک برای ثبات بازار است. هرگونه جهش در نرخ ارز می‌تواند به سرعت هزینه تمام شده تولید را افزایش داده و منجر به تورم در بازار فولاد شود. علاوه بر این، سیاست‌های قیمت‌گذاری دستوری که گاهی از سوی دولت اعمال می‌شود، می‌تواند انگیزه تولید را کاهش داده و تعادل عرضه و تقاضا را بر هم بزند.</p>
        <h4>پیش‌بینی بخشی:</h4>
        <ul>
            <li><strong>بازار ورق:</strong> با توجه به تقاضای پایدار از سوی صنایع خودروسازی و لوازم خانگی، انتظار ثبات نسبی قیمت وجود دارد.</li>
            <li><strong>بازار میلگرد:</strong> پیش‌بینی می‌شود با افزایش تقاضای ساختمانی، شاهد رشد تقاضا و فشار بر قیمت‌ها باشیم.</li>
        </ul>
      `
    },
    keyTakeaways: [
      'فرصت: افزایش تقاضای فصلی در بخش ساخت و ساز.',
      'تهدید: نوسانات نرخ ارز و سیاست‌های قیمت‌گذاری دستوری.',
      'پیش‌بینی ثبات در بازار ورق و رشد تقاضا در بازار میلگرد.',
      'لزوم مدیریت ریسک ارز برای تولیدکنندگان و مصرف‌کنندگان.'
    ],
    downloadUrl: '#'
  }
];

// --- BUNDLED FROM data/prediction.ts ---
const generateForecast = (start: number, end: number, points: number, volatility: number, hasHistory: boolean) => {
    const data = [];
    const historyPoints = hasHistory ? Math.floor(points / 3) : 0;
    const forecastPoints = points - historyPoints;

    // Generate historical data
    for (let i = 0; i < historyPoints; i++) {
        const progress = i / (points - 1);
        const linearValue = start + (end - start) * progress;
        const noise = (Math.random() - 0.5) * (start * (volatility / 2));
        const actual = Math.round(linearValue + noise);
        data.push({
            name: `${historyPoints - i} روز قبل`,
            actual: actual,
            low: actual,
            mid: actual,
            high: actual
        });
    }

    // Generate forecast data
    for (let i = 0; i < forecastPoints; i++) {
        const progress = (i + historyPoints) / (points - 1);
        const mid = Math.round(start + (end - start) * progress + (Math.random() - 0.5) * (start * volatility * progress));
        const bandSize = mid * volatility * (1 + progress) * 0.7;
        data.push({
            name: i === 0 ? 'امروز' : `${i} روز بعد`,
            low: Math.round(mid - bandSize),
            mid: mid,
            high: Math.round(mid + bandSize),
        });
    }
    return data;
};
const predictionData: PredictionData = {
    'hot-rolled': {
        '7': {
            accuracy: 94,
            forecast: generateForecast(42100, 42800, 11, 0.02, true),
            factors: [
                { name: 'نرخ دلار', impact: 'افزایش ۰.۸٪ هفتگی', direction: 'up', description: 'نرخ ارز مستقیماً هزینه تمام‌شده مواد اولیه وارداتی مانند الکترود گرافیتی را افزایش می‌دهد و محرک اصلی قیمت داخلی است.' },
                { name: 'موجودی انبارها', impact: 'کاهش ۵٪', direction: 'up', description: 'کاهش موجودی در انبارها به معنای کمبود عرضه نسبت به تقاضا است که فشار صعودی بر قیمت‌ها وارد می‌کند.' },
                { name: 'قیمت جهانی HRC', impact: 'ثبات نسبی', direction: 'down', description: 'عدم رشد قیمت در بازارهای جهانی، پتانسیل افزایش قیمت داخلی را محدود کرده و به عنوان یک عامل بازدارنده عمل می‌کند.' }
            ],
            scenarios: [
                { condition: 'اگر نرخ دلار به ۶۳,۰۰۰ تومان برسد', outcome: 'تغییر قیمت: +۲.۵٪', description: 'این سناریو اثر جهش ارزی بر هزینه‌های تولید را شبیه‌سازی می‌کند که می‌تواند منجر به یک رالی صعودی در بازار شود.' },
                { condition: 'اگر محدودیت عرضه تشدید شود', outcome: 'تغییر قیمت: +۱.۸٪', description: 'در صورت کاهش عرضه توسط تولیدکنندگان بزرگ (به دلیل تعمیرات یا سیاست‌های بازار)، قیمت‌ها به سرعت واکنش مثبت نشان خواهند داد.' }
            ]
        },
        '30': {
            accuracy: 88,
            forecast: generateForecast(42100, 43500, 10, 0.04, false).map((p, i) => ({...p, name: `${i*3} روز بعد`})),
            factors: [
                { name: 'تقاضای فصلی ساخت‌وساز', impact: 'افزایش پیش‌بینی شده', direction: 'up', description: 'با شروع فصل گرما و فعال شدن پروژه‌های عمرانی، تقاضا برای محصولات فولادی به طور سنتی افزایش می‌یابد.' },
                { name: 'سیاست‌های ارزی بانک مرکزی', impact: 'عدم قطعیت بالا', direction: 'up', description: 'سیاست‌های انقباضی یا انبساطی بانک مرکزی در کنترل نقدینگی و نرخ ارز، می‌تواند مسیر بازار را به کلی تغییر دهد.' },
                { name: 'قیمت سنگ آهن', impact: 'روند صعودی ملایم', direction: 'up', description: 'سنگ آهن به عنوان ماده اولیه اصلی، هرگونه افزایش قیمت آن در بازارهای جهانی مستقیماً هزینه تولید را بالا می‌برد.' }
            ],
            scenarios: [
                { condition: 'اگر پروژه‌های عمرانی بزرگ فعال شوند', outcome: 'تغییر قیمت: +۵٪', description: 'تزریق بودجه به پروژه‌های ملی می‌تواند یک شوک تقاضای مثبت در بازار ایجاد کرده و قیمت‌ها را به شدت افزایش دهد.' },
                { condition: 'اگر سیاست انقباضی بانک مرکزی تشدید شود', outcome: 'تغییر قیمت: -۲٪', description: 'در صورت کنترل شدید نقدینگی و ثبات نرخ ارز، از فشار تورمی کاسته شده و قیمت‌ها ممکن است اصلاح شوند.' }
            ]
        },
        '90': {
            accuracy: 79,
            forecast: generateForecast(42100, 45000, 10, 0.08, false).map((p, i) => ({...p, name: `${i*9} روز بعد`})),
            factors: [
                { name: 'چشم‌انداز اقتصاد کلان', impact: 'انتظار تورم ۴۰ درصدی', direction: 'up', description: 'در شرایط تورمی، قیمت کالاها از جمله فولاد به عنوان ابزاری برای حفظ ارزش پول، گرایش به رشد دارند.' },
                { name: 'روند تولید فولاد چین', impact: 'کاهش تولید زمستانی', direction: 'up', description: 'کاهش تولید در چین به دلیل مسائل زیست‌محیطی، عرضه جهانی را کاهش داده و از قیمت‌ها در سطح بین‌المللی حمایت می‌کند.' },
                { name: 'مذاکرات سیاسی بین‌المللی', impact: 'ریسک بالا', direction: 'down', description: 'هرگونه گشایش در روابط بین‌المللی می‌تواند منجر به کاهش نرخ ارز و ثبات اقتصادی شود که بر قیمت‌ها اثر کاهشی دارد.' }
            ],
            scenarios: [
                { condition: 'در صورت توافق سیاسی', outcome: 'تغییر قیمت: -۸٪', description: 'یک توافق سیاسی می‌تواند انتظارات تورمی را به شدت کاهش دهد و با کاهش نرخ ارز، منجر به اصلاح قابل توجه قیمت‌ها شود.' },
                { condition: 'در صورت رکود اقتصادی عمیق', outcome: 'تغییر قیمت: -۵٪', description: 'کاهش رشد اقتصادی به معنای کاهش تقاضای کل در جامعه است که می‌تواند منجر به کاهش ساخت‌وساز و افت قیمت فولاد گردد.' }
            ]
        }
    },
    'cold-rolled': {
        '7': {
            accuracy: 92,
            forecast: generateForecast(48200, 48900, 11, 0.025, true),
            factors: [
                { name: 'تقاضای صنعت خودرو', impact: 'افزایش تولید', direction: 'up', description: 'رشد تولید خودروسازان به معنای افزایش مستقیم تقاضا برای ورق سرد به عنوان ماده اولیه اصلی بدنه خودرو است.' },
                { name: 'قیمت ورق گرم', impact: 'روند صعودی', direction: 'up', description: 'ورق سرد از ورق گرم تولید می‌شود، بنابراین قیمت آن همواره تابعی از قیمت ماده اولیه خود یعنی ورق گرم است.' },
                { name: 'موجودی تولیدکنندگان', impact: 'در سطح پایین', direction: 'up', description: 'پایین بودن موجودی انبارها باعث می‌شود هر افزایش تقاضایی به سرعت به افزایش قیمت منجر شود.' }
            ],
            scenarios: [
                { condition: 'اگر تعرفه واردات خودرو کاهش یابد', outcome: 'تغییر قیمت: -۳٪', description: 'کاهش تعرفه واردات خودرو می‌تواند به کاهش تولید داخلی و در نتیجه افت تقاضا برای ورق سرد منجر شود.' }
            ]
        },
        '30': {
            accuracy: 85,
            forecast: generateForecast(48200, 49500, 10, 0.05, false).map((p, i) => ({...p, name: `${i*3} روز بعد`})),
            factors: [
                { name: 'تقاضای لوازم خانگی', impact: 'رشد فصلی', direction: 'up', description: 'در برخی فصول مانند نزدیک به اعیاد، تقاضا برای لوازم خانگی افزایش یافته و تولیدکنندگان خرید ورق سرد را افزایش می‌ده دهند.' },
                { name: 'قیمت جهانی فولاد', impact: 'صعودی', direction: 'up', description: 'افزایش قیمت در بازارهای جهانی، قیمت‌های داخلی را نیز برای حفظ قابلیت صادرات، حمایت می‌کند.' },
                { name: 'هزینه انرژی', impact: 'احتمال افزایش', direction: 'up', description: 'هرگونه افزایش در قیمت برق، هزینه تولید را در کارخانجات نورد سرد به شکل قابل توجهی بالا می‌برد.' }
            ],
            scenarios: [
                { condition: 'اگر وام خرید کالای ایرانی فعال شود', outcome: 'تغییر قیمت: +۴٪', description: 'این سیاست می‌تواند تقاضا در بخش لوازم خانگی را به شدت تحریک کرده و قیمت ورق سرد را افزایش دهد.' }
            ]
        },
        '90': {
            accuracy: 78,
            forecast: generateForecast(48200, 51000, 10, 0.09, false).map((p, i) => ({...p, name: `${i*9} روز بعد`})),
            factors: [
                { name: 'چشم‌انداز تورم عمومی', impact: 'بالا', direction: 'up', description: 'ورق سرد نیز مانند سایر کالاها، در شرایط تورمی تمایل به افزایش قیمت برای حفظ ارزش دارد.' },
                { name: 'سیاست‌های واردات', impact: 'محدودیت‌ها', direction: 'up', description: 'محدودیت بر واردات محصولات نهایی (خودرو و لوازم خانگی) از تولید داخلی و در نتیجه تقاضا برای ورق سرد حمایت می‌کند.' },
                { name: 'رقابت‌پذیری صادراتی', impact: 'بستگی به نرخ ارز دارد', direction: 'up', description: 'افزایش نرخ ارز می‌تواند صادرات را جذاب‌تر کرده و بخشی از تولید را به سمت بازارهای خارجی سوق دهد که باعث کاهش عرضه داخلی می‌شود.' }
            ],
            scenarios: [
                { condition: 'در صورت آزادسازی واردات خودرو', outcome: 'تغییر قیمت: -۱۰٪', description: 'این سیاست می‌تواند بزرگترین ضربه را به تقاضای ورق سرد وارد کرده و منجر به رکود و کاهش شدید قیمت شود.' }
            ]
        }
    },
     'galvanized': {
        '7': {
            accuracy: 91,
            forecast: generateForecast(53100, 53700, 11, 0.02, true),
            factors: [
                { name: 'قیمت جهانی روی (Zinc)', impact: 'افزایش ۳٪ هفتگی', direction: 'up', description: 'هزینه پوشش گالوانیزه مستقیماً به قیمت شمش روی وابسته است و افزایش آن، قیمت نهایی را بالا می‌برد.' },
                { name: 'تقاضای صنایع ساختمانی', impact: 'پایدار', direction: 'up', description: 'استفاده در سقف‌ها، کانال‌ها و سازه‌های سبک، یک تقاضای پایدار برای این محصول ایجاد کرده است.' },
                { name: 'نرخ ارز', impact: 'صعودی', direction: 'up', description: 'بخشی از مواد اولیه و همچنین قیمت‌گذاری صادراتی تحت تأثیر مستقیم نرخ ارز قرار دارد.' }
            ],
            scenarios: [
                { condition: 'اگر قیمت جهانی روی ۵٪ دیگر رشد کند', outcome: 'تغییر قیمت: +۲.۲٪', description: 'با توجه به سهم هزینه پوشش در قیمت تمام شده، هر نوسان قیمت روی به سرعت به بازار ورق گالوانیزه منتقل می‌شود.' }
            ]
        },
        '30': {
            accuracy: 86,
            forecast: generateForecast(53100, 54500, 10, 0.04, false).map((p, i) => ({...p, name: `${i*3} روز بعد`})),
            factors: [
                { name: 'تقاضای بخش کشاورزی', impact: 'افزایش فصلی', direction: 'up', description: 'در فصول خاصی، تقاضا برای ساخت گلخانه‌ها و تجهیزات کشاورزی که از ورق گالوانیزه استفاده می‌کنند، افزایش می‌یابد.' },
                { name: 'قیمت ورق سرد', impact: 'روند صعودی', direction: 'up', description: 'ورق گالوانیزه بر پایه ورق سرد تولید می‌شود و قیمت آن همبستگی بالایی با این محصول دارد.' },
                { name: 'صادرات به کشورهای همسایه', impact: 'رو به رشد', direction: 'up', description: 'تقاضای خوب از سوی کشورهای همسایه، بخشی از تولید را جذب کرده و از کاهش قیمت در بازار داخلی جلوگیری می‌کند.' }
            ],
            scenarios: [
                { condition: 'اگر تعرفه صادراتی افزایش یابد', outcome: 'تغییر قیمت: -۳.۵٪', description: 'این سیاست با کاهش جذابیت صادرات، عرضه در بازار داخلی را افزایش داده و منجر به فشار بر قیمت‌ها می‌شود.' }
            ]
        },
        '90': {
            accuracy: 80,
            forecast: generateForecast(53100, 56000, 10, 0.08, false).map((p, i) => ({...p, name: `${i*9} روز بعد`})),
            factors: [
                 { name: 'سیاست‌های عمرانی دولت', impact: 'انبساطی', direction: 'up', description: 'پروژه‌های عمرانی بزرگ مانند ساخت مدارس و بیمارستان‌ها، تقاضای قابل توجهی برای این محصول ایجاد می‌کند.' },
                 { name: 'چشم‌انداز تورم', impact: 'بالا', direction: 'up', description: 'مانند سایر محصولات فولادی، قیمت ورق گالوانیزه نیز در بلندمدت تابعی از نرخ تورم عمومی اقتصاد است.' },
                 { name: 'رقابت با محصولات وارداتی', impact: 'محدود', direction: 'up', description: 'تعرفه‌های وارداتی و نرخ ارز بالا، رقابت را برای محصولات وارداتی دشوار کرده و از تولید داخل حمایت می‌کند.' }
            ],
            scenarios: [
                { condition: 'در صورت رکود بخش مسکن', outcome: 'تغییر قیمت: -۶٪', description: 'رکود عمیق در ساخت‌وساز می‌تواند تقاضای اصلی این محصول را کاهش داده و منجر به اصلاح قیمت شود.' }
            ]
        }
    },
    'slab': {
        '7': {
            accuracy: 95,
            forecast: generateForecast(35200, 35800, 11, 0.02, true),
            factors: [
                { name: 'تقاضای کارخانجات نورد', impact: 'در سطح بالا', direction: 'up', description: 'اسلب ماده اولیه اصلی برای تولید ورق گرم است و تقاضای آن مستقیماً به برنامه تولید کارخانجات نورد بستگی دارد.' },
                { name: 'قیمت سنگ آهن', impact: 'افزایش ۲٪', direction: 'up', description: 'به عنوان محصول میانی، قیمت اسلب همبستگی بسیار بالایی با هزینه ماده اولیه اصلی خود یعنی سنگ آهن دارد.' },
                { name: 'قیمت جهانی اسلب', impact: 'صعودی', direction: 'up', description: 'قیمت در بازارهای جهانی به عنوان یک شاخص و کف قیمتی برای معاملات داخلی عمل می‌کند.' }
            ],
            scenarios: [
                { condition: 'اگر قطعی برق کارخانجات نورد را متوقف کند', outcome: 'تغییر قیمت: -۲٪', description: 'توقف تولید در کارخانجات پایین‌دستی به معنای کاهش ناگهانی تقاضا برای اسلب و فشار بر قیمت آن است.' }
            ]
        },
        '30': {
            accuracy: 89,
            forecast: generateForecast(35200, 36500, 10, 0.04, false).map((p, i) => ({...p, name: `${i*3} روز بعد`})),
            factors: [
                { name: 'هزینه انرژی (گاز و برق)', impact: 'روند صعودی', direction: 'up', description: 'تولید اسلب فرآیندی بسیار انرژی‌بر است و هرگونه افزایش در تعرفه انرژی، هزینه تمام شده را به شدت بالا می‌برد.' },
                { name: 'تقاضای صادراتی', impact: 'قوی', direction: 'up', description: 'تقاضای خوب از بازارهای منطقه برای اسلب ایران، بخشی از تولید را جذب کرده و از قیمت داخلی حمایت می‌کند.' },
                { name: 'نرخ ارز', impact: 'افزایش پیش‌بینی شده', direction: 'up', description: 'نرخ ارز هم بر هزینه واردات برخی مواد و هم بر درآمد صادراتی تأثیر مستقیم دارد.' }
            ],
            scenarios: [
                { condition: 'اگر محدودیت‌های صادراتی وضع شود', outcome: 'تغییر قیمت: -۵٪', description: 'این سیاست با هدایت تمام تولید به سمت بازار داخل، باعث مازاد عرضه و افت قیمت خواهد شد.' }
            ]
        },
        '90': {
            accuracy: 81,
            forecast: generateForecast(35200, 38000, 10, 0.08, false).map((p, i) => ({...p, name: `${i*9} روز بعد`})),
            factors: [
                 { name: 'برنامه‌های توسعه فولادسازان', impact: 'افزایش ظرفیت', direction: 'down', description: 'در بلندمدت، افزایش ظرفیت تولید اسلب در کشور می‌تواند به تعادل بهتر بازار و کنترل قیمت کمک کند.' },
                 { name: 'چشم‌انداز اقتصاد جهانی', impact: 'عدم قطعیت', direction: 'down', description: 'هرگونه رکود در اقتصاد جهانی می‌تواند تقاضای بین‌المللی برای فولاد و در نتیجه اسلب را کاهش دهد.' },
                 { name: 'سیاست‌های زیست‌محیطی چین', impact: 'کاهش تولید', direction: 'up', description: 'محدودیت‌های تولید در چین برای کنترل آلودگی، عرضه جهانی را کاهش داده و از قیمت‌ها حمایت می‌کند.' }
            ],
            scenarios: [
                { condition: 'در صورت رکود جهانی', outcome: 'تغییر قیمت: -۱۰٪', description: 'یک رکود اقتصادی جهانی می‌تواند تقاضای صادراتی را به شدت کاهش داده و باعث مازاد عرضه در بازار داخلی شود.' }
            ]
        }
    },
    'rebars': {
        '7': {
            accuracy: 96,
            forecast: generateForecast(25150, 25500, 11, 0.015, true),
            factors: [
                { name: 'تقاضای پروژه‌های کوچک', impact: 'افزایش ۱۰٪', direction: 'up', description: 'با شروع فصل کاری، پروژه‌های ساختمانی کوچک مقیاس فعال شده و تقاضای مقطعی برای میلگرد را افزایش می‌دهند.' },
                { name: 'قیمت قراضه', impact: 'ثبات در سقف قیمت', direction: 'up', description: 'قراضه ماده اولیه اصلی تولید میلگرد به روش قوس الکتریکی است و قیمت بالای آن، کف قیمتی میلگرد را تعیین می‌کند.' },
                { name: 'عرضه در بورس کالا', impact: 'افزایش جزئی', direction: 'down', description: 'افزایش عرضه توسط تولیدکنندگان در بورس کالا می‌تواند به کنترل نوسانات و جلوگیری از رشد هیجانی قیمت کمک کند.' }
            ],
            scenarios: [
                { condition: 'اگر بارندگی‌ها کاهش یابد', outcome: 'افزایش تقاضا و قیمت: +۱.۵٪', description: 'آب و هوای مساعد به معنای سرعت گرفتن پروژه‌های ساختمانی و افزایش تقاضا برای میلگرد است.' }
            ]
        },
        '30': {
            accuracy: 91,
            forecast: generateForecast(25150, 26000, 10, 0.03, false).map((p, i) => ({...p, name: `${i*3} روز بعد`})),
            factors: [
                 { name: 'شروع پروژه‌های عمرانی', impact: 'رشد تقاضا', direction: 'up', description: 'تخصیص بودجه‌های عمرانی و فعال شدن پروژه‌های دولتی، یک محرک تقاضای بسیار قوی برای میلگرد محسوب می‌شود.' },
                 { name: 'نرخ دلار', impact: 'روند صعودی', direction: 'up', description: 'نرخ ارز به عنوان یک شاخص انتظارات تورمی عمل کرده و بر قیمت تمام کالاها از جمله میلگرد تأثیر روانی و واقعی دارد.' },
                 { name: 'هزینه حمل و نقل', impact: 'افزایش فصلی', direction: 'up', description: 'هزینه لجستیک بخش مهمی از قیمت تمام شده برای مصرف‌کننده نهایی را تشکیل می‌دهد و افزایش آن به رشد قیمت کمک می‌کند.' }
            ],
            scenarios: [
                { condition: 'با تخصیص بودجه عمرانی دولت', outcome: 'جهش قیمت به بالای ۲۷,۰۰۰ تومان', description: 'این اقدام می‌تواند به سرعت تقاضا را افزایش داده و در صورت عدم افزایش متناسب عرضه، باعث جهش قیمت شود.' }
            ]
        },
        '90': {
            accuracy: 82,
            forecast: generateForecast(25150, 27500, 10, 0.07, false).map((p, i) => ({...p, name: `${i*9} روز بعد`})),
            factors: [
                { name: 'چشم انداز تورم', impact: 'بالا', direction: 'up', description: 'در یک اقتصاد تورمی، قیمت میلگرد به عنوان یک کالای سرمایه‌ای، همگام با نرخ تورم رشد خواهد کرد.' },
                { name: 'سیاست های مسکن', impact: 'انبساطی', direction: 'up', description: 'سیاست‌هایی مانند وام مسکن یا طرح‌های ملی مسکن، تقاضای بلندمدت برای مصالح ساختمانی از جمله میلگرد را تضمین می‌کند.' },
                { name: 'قیمت انرژی', impact: 'افزایش احتمالی', direction: 'up', description: 'تولید فولاد بسیار انرژی‌بر است و افزایش قیمت گاز و برق مستقیماً هزینه تولید را افزایش می‌دهد.' }
            ],
            scenarios: [
                 { condition: 'در صورت رکود در بخش ساخت و ساز', outcome: 'تثبیت قیمت در کانال ۲۶,۰۰۰ تومان', description: 'رکود در بخش پیشران مسکن می‌تواند تقاضای میلگرد را به شدت کاهش داده و مانع از رشد بیشتر قیمت شود.' }
            ]
        }
    }
};
const whatIfInitialData: WhatIfData = {
    'dollar': { id: 'dollar', name: 'نرخ دلار', value: 61850, min: 55000, max: 70000, step: 50, unit: 'تومان' },
    'oil': { id: 'oil', name: 'نفت خام برنت', value: 85, min: 70, max: 110, step: 0.5, unit: 'دلار' },
    'ironOre': { id: 'ironOre', name: 'سنگ آهن', value: 122, min: 100, max: 150, step: 1, unit: 'دلار' },
    'cokingCoal': { id: 'cokingCoal', name: 'زغال سنگ کک شو', value: 253, min: 200, max: 350, step: 1, unit: 'دلار'}
};

// --- BUNDLED FROM components/ErrorBoundary.tsx ---
class ErrorBoundary extends Component<
    { children: ReactNode; fallbackMessage?: string; }, 
    { hasError: boolean; }
> {
  public state = { hasError: false };

  public static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 text-center text-red-700 dark:text-red-300">
           <i className="fas fa-exclamation-triangle fa-lg mb-2"></i>
          <p className="text-sm font-semibold">{this.props.fallbackMessage || 'متاسفانه در بارگذاری این بخش مشکلی پیش آمد.'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- BUNDLED FROM components/Card.tsx ---
const Card: React.FC<{ children: React.ReactNode; className?: string; }> = memo(({ children, className = '' }) => {
  return (
    <div
      className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
});

// --- BUNDLED FROM components/Charts.tsx ---
const AnalyticsChart: React.FC<{ data: any[]; dataKey: string; color: string; unit: string; labels: string[]; simple?: boolean; }> = ({ data, dataKey, color, unit, labels, simple = false }) => {
  const chartData = data.map((value, index) => ({ name: labels[index] || ``, value }));
  const context = useContext(ThemeContext);
  const isDark = context?.theme === 'dark';
  const tickColor = isDark ? '#94a3b8' : '#64748b'; // slate-400, slate-500
  const gridColor = isDark ? '#1e293b' : '#f1f5f9'; // slate-800, slate-100
  const gradientId = `color_${dataKey.replace(/[^a-zA-Z0-9]/g, '')}`;
  const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  if (simple) {
    return (
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Tooltip 
              formatter={(value) => [`${Number(value).toLocaleString('fa-IR')} ${unit}`, dataKey]}
              contentStyle={{ 
                  backgroundColor: tooltipBg,
                  backdropFilter: 'blur(8px)',
                  borderColor: tooltipBorder,
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
              cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '3 3' }}
            />
            <Line 
              type={'linear'} 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 8, strokeWidth: 2, fill: color, stroke: isDark ? '#020617' : '#f8fafc' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
           <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.7}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
          <YAxis stroke={tickColor} fontSize={12} tickFormatter={(value) => `${Number(value).toLocaleString('fa-IR')}`} />
          <Tooltip 
            formatter={(value) => [`${Number(value).toLocaleString('fa-IR')} ${unit}`, dataKey]}
            contentStyle={{ 
                backgroundColor: tooltipBg,
                backdropFilter: 'blur(8px)',
                borderColor: tooltipBorder,
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)'
            }}
            labelStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
            cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '3 3' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#${gradientId})`} 
            activeDot={{ r: 8, strokeWidth: 2, fill: color, stroke: isDark ? '#020617' : '#f8fafc' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
const GaugeChart: React.FC<{ value: number; color: string; }> = ({ value, color }) => {
  const data = [
    { name: 'value', value: value },
    { name: 'remainder', value: 100 - value },
  ];
  const context = useContext(ThemeContext);
  const remainderColor = context?.theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="relative w-full h-24 sm:h-28">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="100%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill={remainderColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">
        {value}%
      </div>
    </div>
  );
};
const TechnicalAnalysisChart: React.FC<{ data: any[]; dataKey: string; maKey: string; unit: string; supportLevel?: number; resistanceLevel?: number; }> = ({ data, dataKey, maKey, unit, supportLevel, resistanceLevel }) => {
  const context = useContext(ThemeContext);
  const isDark = context?.theme === 'dark';
  const tickColor = isDark ? '#94a3b8' : '#64748b'; // slate-400, slate-500
  const gridColor = isDark ? '#1e293b' : '#f1f5f9'; // slate-800, slate-100
  const supportColor = '#10b981'; // emerald-500
  const resistanceColor = '#ef4444'; // red-500
  const maColor = '#f97316'; // orange-500
  const mainColor = '#6366f1'; // indigo-500
  const gradientId = 'techChartGradient';
  const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.7}/>
              <stop offset="95%" stopColor={mainColor} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
          <YAxis 
            stroke={tickColor} 
            fontSize={12} 
            tickFormatter={(value) => `${Number(value).toLocaleString('fa-IR')}`}
            domain={['dataMin - 50', 'dataMax + 50']}
            width={40}
          />
          <Tooltip 
            formatter={(value, name) => {
                const label = name === "شاخص" ? 'شاخص' : 'میانگین متحرک ۷ روزه';
                return [`${Number(value).toLocaleString('fa-IR')} ${unit}`, label];
            }}
            contentStyle={{ 
                backgroundColor: tooltipBg,
                backdropFilter: 'blur(8px)',
                borderColor: tooltipBorder,
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)'
            }}
            labelStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
          
          {supportLevel && (
              <ReferenceLine y={supportLevel} label={{ value: 'حمایت', position: 'insideTopLeft', fill: supportColor, fontSize: 12, fontWeight: 'bold' }} stroke={supportColor} strokeDasharray="3 3" />
          )}
          {resistanceLevel && (
              <ReferenceLine y={resistanceLevel} label={{ value: 'مقاومت', position: 'insideTopLeft', fill: resistanceColor, fontSize: 12, fontWeight: 'bold' }} stroke={resistanceColor} strokeDasharray="3 3" />
          )}

          <Area 
            type="monotone" 
            dataKey={dataKey} 
            name="شاخص"
            stroke={mainColor} 
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`} 
            activeDot={{ r: 6, strokeWidth: 2, fill: mainColor, stroke: isDark ? '#020617' : '#f8fafc' }} 
          />
           <Line 
            type="monotone" 
            dataKey={maKey} 
            name="میانگین متحرک ۷ روزه"
            stroke={maColor} 
            strokeWidth={2} 
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
const PredictionChart: React.FC<{ data: any[]; unit: string; }> = ({ data, unit }) => {
    const context = useContext(ThemeContext);
    const isDark = context?.theme === 'dark';
    const tickColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';
    const bandColor = '#6366f1'; // indigo-500
    const midColor = isDark ? '#c7d2fe' : '#312e81'; // indigo-200, indigo-900
    const actualColor = '#f59e0b'; // amber-500
    const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

    const formatTooltip = (value: number) => `${Number(value).toLocaleString('fa-IR')} ${unit}`;

    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
                    <YAxis
                        stroke={tickColor}
                        fontSize={12}
                        tickFormatter={(value) => `${Number(value).toLocaleString('fa-IR')}`}
                        domain={['dataMin - 100', 'dataMax + 100']}
                        width={40}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: tooltipBg,
                            backdropFilter: 'blur(8px)',
                            borderColor: tooltipBorder,
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)'
                        }}
                        labelStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                        formatter={(value, name) => {
                            if (name === 'بازه اطمینان') return [ `${formatTooltip(value[0])} - ${formatTooltip(value[1])}`, name];
                            return [formatTooltip(Number(value)), name];
                        }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                    
                    {/* Confidence Band */}
                    <Area 
                        type="monotone" 
                        dataKey="high" 
                        name="بازه اطمینان"
                        fill={bandColor} 
                        stroke={bandColor} 
                        fillOpacity={0.2}
                        strokeWidth={0}
                        activeDot={false}
                    />
                     <Area 
                        type="monotone" 
                        dataKey="low" 
                        fill={isDark ? "#020617" : "#f8fafc"}
                        stroke={isDark ? "#020617" : "#f8fafc"}
                        fillOpacity={1}
                        strokeWidth={0}
                        activeDot={false}
                    />
                    
                    <Line
                        type="monotone"
                        dataKey="mid"
                        name="پیش‌بینی"
                        stroke={midColor}
                        strokeWidth={3}
                        dot={{ r: 3, fill: midColor }}
                        activeDot={{ r: 6, strokeWidth: 2, fill: midColor, stroke: isDark ? '#020617' : '#f8fafc' }}
                    />

                    {/* Show actual price if available */}
                    <Line
                        type="monotone"
                        dataKey="actual"
                        name="قیمت واقعی"
                        stroke={actualColor}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: actualColor }}
                        activeDot={{ r: 6, strokeWidth: 2, fill: actualColor, stroke: isDark ? '#020617' : '#f8fafc' }}
                    />

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- BUNDLED FROM components/Header.tsx ---
const Header: React.FC<{ title: string; }> = memo(({ title }) => {
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
});

// --- BUNDLED FROM components/Pagination.tsx ---
const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
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

// --- BUNDLED FROM components/Modal.tsx ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; }> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }
  
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.error("The element #modal-root was not found");
    return null;
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 m-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl transition-all transform scale-95 opacity-0 animate-modalShow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <i className="fas fa-times"></i>
        </button>
        {children}
      </div>
    </div>
  );

  // FIX: Use `createPortal` from `react-dom` instead of from `react-dom/client`.
  return createPortal(modalContent, modalRoot);
};

// --- BUNDLED FROM components/AuthorInfo.tsx ---
const AuthorInfo: React.FC<{ onShowResume: () => void; }> = ({ onShowResume }) => {
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

// --- BUNDLED FROM components/BottomNav.tsx ---
const navItems = [
  { page: Page.DASHBOARD, icon: 'fa-home', label: 'داشبورد' },
  { page: Page.ANALYSIS, icon: 'fa-chart-line', label: 'تحلیل' },
  { page: Page.PRICES, icon: 'fa-tags', label: 'قیمت‌ها' },
  { page: Page.PREDICTION, icon: 'fa-brain', label: 'پیش بینی'},
  { page: Page.NEWS, icon: 'fa-newspaper', label: 'اخبار' },
  { page: Page.PREMIUM_ANALYSIS, icon: 'fa-gem', label: 'ویژه' },
];
const NavButton: React.FC<{ item: typeof navItems[0]; isActive: boolean; onClick: () => void; }> = ({ item, isActive, onClick }) => {
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
const BottomNav: React.FC<{ activePage: Page; setPage: (page: Page) => void; }> = ({ activePage, setPage }) => {
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

// --- BUNDLED FROM components/ThemeToggle.tsx ---
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

// --- BUNDLED FROM pages/DashboardPage.tsx ---
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

// --- BUNDLED FROM pages/AnalysisPage.tsx ---
type AnalysisTab = 'domestic' | 'international' | 'products-analysis' | 'strategy' | 'technical';
const AnalysisTabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
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
  const [activeTab, setActiveTab] = useState<AnalysisTab>('domestic');
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
          <AnalysisTabButton label="بازار داخلی" isActive={activeTab === 'domestic'} onClick={() => setActiveTab('domestic')} />
          <AnalysisTabButton label="بازار جهانی" isActive={activeTab === 'international'} onClick={() => setActiveTab('international')} />
          <AnalysisTabButton label="تحلیل تکنیکال" isActive={activeTab === 'technical'} onClick={() => setActiveTab('technical')} />
          <AnalysisTabButton label="تحلیل محصولات" isActive={activeTab === 'products-analysis'} onClick={() => setActiveTab('products-analysis')} />
          <AnalysisTabButton label="استراتژی بازار" isActive={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} />
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

// --- BUNDLED FROM pages/PricesPage.tsx ---
interface ProductRow {
  thickness: number | string;
  width: number | string;
  price: string;
  change: string;
  changeType: 'up' | 'down';
}
interface ProductTableProps {
  title: string;
  rows: ProductRow[];
  headers?: string[];
}
const ProductTable: React.FC<ProductTableProps> = ({ title, rows, headers = ['مشخصات', 'عرض / استاندارد', 'قیمت', 'تغییر'] }) => (
  <Card className="mb-8 last:mb-0">
    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-xl border-r-4 border-indigo-500 pr-4">{title}</h4>
    <div className="overflow-x-auto -mx-4 sm:-mx-6">
      <table className="w-full text-sm text-right">
        <thead className="border-b-2 border-slate-200/80 dark:border-slate-700/80">
          <tr>
            {headers.map(header => <th key={header} className="p-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-200/50 dark:border-slate-700/50 last:border-b-0 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
              <td className="p-4 whitespace-nowrap">{row.thickness}</td>
              <td className="p-4 whitespace-nowrap">{row.width}</td>
              <td className="p-4 font-semibold whitespace-nowrap">{row.price}</td>
              <td className={`p-4 whitespace-nowrap font-semibold ${row.changeType === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{row.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);
const PricesPage: React.FC = () => {
  const hotRolled: ProductRow[] = [
    { thickness: 'ضخامت 2mm', width: 1250, price: '41,800', change: '+0.5%', changeType: 'up' },
    { thickness: 'ضخامت 3mm', width: 1500, price: '42,000', change: '+0.6%', changeType: 'up' },
    { thickness: 'ضخامت 5mm', width: 1500, price: '42,100', change: '+0.7%', changeType: 'up' },
    { thickness: 'ضخامت 8mm', width: 1500, price: '42,250', change: '+0.7%', changeType: 'up' },
    { thickness: 'ضخامت 10mm', width: 1500, price: '42,300', change: '+0.8%', changeType: 'up' },
  ];
  const hotCoils: ProductRow[] = [
      { thickness: 'ضخامت 2mm', width: 'عرض 1000', price: '41,700', change: '+0.4%', changeType: 'up' },
      { thickness: 'ضخامت 2.5mm', width: 'عرض 1250', price: '41,650', change: '+0.4%', changeType: 'up' },
      { thickness: 'ضخامت 4mm', width: 'عرض 1500', price: '41,850', change: '+0.5%', changeType: 'up' },
  ];
  const coldRolled: ProductRow[] = [
    { thickness: 'ضخامت 0.5mm', width: 1000, price: '48,200', change: '+1.5%', changeType: 'up' },
    { thickness: 'ضخامت 0.7mm', width: 1250, price: '47,900', change: '+1.3%', changeType: 'up' },
    { thickness: 'ضخامت 0.9mm', width: 1250, price: '47,750', change: '+1.1%', changeType: 'up' },
    { thickness: 'ضخامت 1mm', width: 1250, price: '47,600', change: '+1.0%', changeType: 'up' },
  ];
  const galvanized: ProductRow[] = [
    { thickness: 'ضخامت 0.5mm', width: 1250, price: '53,100', change: '+1.2%', changeType: 'up' },
    { thickness: 'ضخامت 0.8mm', width: 1250, price: '52,800', change: '+1.0%', changeType: 'up' },
    { thickness: 'ضخامت 1mm', width: 1250, price: '52,500', change: '+0.9%', changeType: 'up' },
  ];
  const iBeam: ProductRow[] = [
    { thickness: 'سایز 14', width: '12m', price: '39,800', change: '+0.5%', changeType: 'up' },
    { thickness: 'سایز 16', width: '12m', price: '39,950', change: '+0.6%', changeType: 'up' },
    { thickness: 'سایز 18', width: '12m', price: '40,100', change: '+0.7%', changeType: 'up' },
    { thickness: 'سایز 20', width: '12m', price: '40,500', change: '+0.8%', changeType: 'up' },
  ];
  const rebars: ProductRow[] = [
      { thickness: 'سایز 12', width: 'A3', price: '25,450', change: '+0.4%', changeType: 'up' },
      { thickness: 'سایز 14', width: 'A3', price: '25,150', change: '+0.6%', changeType: 'up' },
      { thickness: 'سایز 16', width: 'A3', price: '25,150', change: '+0.6%', changeType: 'up' },
      { thickness: 'سایز 18', width: 'A3', price: '25,200', change: '+0.8%', changeType: 'up' },
      { thickness: 'سایز 20', width: 'A3', price: '25,200', change: '+0.8%', changeType: 'up' },
      { thickness: 'سایز 22', width: 'A3', price: '25,300', change: '+0.9%', changeType: 'up' },
  ];

  return (
    <div className="animate-fadeIn">
      <Header title="قیمت‌ها" />
      <main className="py-6 space-y-6">
          <ProductTable title="میلگرد (Rebar)" rows={rebars} headers={['سایز', 'استاندارد', 'قیمت', 'تغییر']} />
          <ProductTable title="تیرآهن (I-Beam)" rows={iBeam} headers={['سایز', 'طول شاخه', 'قیمت', 'تغییر']} />
          <ProductTable title="ورق گرم (Hot Rolled Sheet)" rows={hotRolled} headers={['ضخامت', 'عرض', 'قیمت', 'تغییر']} />
          <ProductTable title="کلاف گرم (Hot Rolled Coil)" rows={hotCoils} headers={['ضخامت', 'مشخصات', 'قیمت', 'تغییر']} />
          <ProductTable title="ورق سرد (Cold Rolled Sheet)" rows={coldRolled} headers={['ضخامت', 'عرض', 'قیمت', 'تغییر']} />
          <ProductTable title="ورق گالوانیزه (Galvanized Sheet)" rows={galvanized} headers={['ضخامت', 'عرض', 'قیمت', 'تغییر']} />

           <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4">
                منبع قیمت‌ها: شبکه اطلاع‌رسانی آهن و فولاد ایران (بروزرسانی در لحظه)
            </div>
      </main>
    </div>
  );
};

// --- BUNDLED FROM pages/NewsPage.tsx ---
const ARTICLES_PER_PAGE = 5;
const credibilityMap = {
  high: { text: 'معتبر', color: 'bg-emerald-500' },
  medium: { text: 'متوسط', color: 'bg-amber-500' },
  low: { text: 'عمومی', color: 'bg-slate-400' },
};
const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " سال پیش";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " ماه پیش";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " روز پیش";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " ساعت پیش";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " دقیقه پیش";
  return "همین حالا";
};
interface NewsArticleItemProps {
  article: Article;
  viewMode: 'list' | 'card';
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  onShare: (article: Article) => void;
}
const NewsArticleItem: React.FC<NewsArticleItemProps> = memo(({ article, viewMode, isBookmarked, onToggleBookmark, onShare }) => {
    const { id, title, summary, source, credibility, publishedAt, category } = article;
    const categoryStyle = categoryInfo[category].color;
    const cred = credibilityMap[credibility];

    const containerClasses = viewMode === 'list' 
        ? "py-5 border-b border-slate-200/60 dark:border-slate-700/60 last:border-b-0" 
        : "";

    const contentClasses = viewMode === 'card'
        ? "flex flex-col h-full"
        : "flex flex-col sm:flex-row gap-4";

    return (
        <div className={containerClasses}>
            <Card className={`${viewMode === 'card' ? 'h-full flex flex-col' : 'hover:!translate-y-0'}`}>
                <div className={contentClasses}>
                    <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                             <div className={`text-xs font-semibold py-1 px-2.5 rounded-full self-start ${categoryStyle}`}>
                                {categoryInfo[category].name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span className="flex items-center gap-1.5" title={`اعتبار منبع: ${cred.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${cred.color}`}></span>
                                    {source}
                                </span>
                                <span>-</span>
                                <span>{timeSince(publishedAt)}</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-lg">{title}</h3>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-prose">{summary}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-4 ${viewMode === 'list' ? 'sm:mt-0 sm:flex-col sm:justify-center' : 'pt-4 border-t border-slate-200/60 dark:border-slate-700/60'}`}>
                         <button onClick={() => onToggleBookmark(id)} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${isBookmarked ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600' : 'bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500'}`} title={isBookmarked ? "حذف از ذخیره‌ها" : "ذخیره مقاله"}>
                            <i className={`fas fa-bookmark ${isBookmarked ? 'text-indigo-500' : ''}`}></i>
                        </button>
                        <button onClick={() => onShare(article)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 transition-colors" title="اشتراک‌گذاری">
                            <i className="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
});
const NewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [filters, setFilters] = useState<{ category: NewsCategory | 'all'; country: NewsCountry; type: NewsType; time: NewsTimeFilter; }>({ category: 'all', country: 'all', type: 'all', time: 'all' });
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('bookmarkedNews') : null;
    try {
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
      localStorage.setItem('bookmarkedNews', JSON.stringify(Array.from(bookmarkedIds)));
  }, [bookmarkedIds]);

  useEffect(() => {
      const interval = setInterval(() => {
          setLastUpdated(new Date());
      }, 15 * 60 * 1000); // 15 minutes
      return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
      setFilters(prev => ({ ...prev, [filterType]: value }));
      setCurrentPage(1);
  };

  const filteredArticles = useMemo(() => {
    let articles = newsData;

    if (filters.category !== 'all') {
      articles = articles.filter(a => a.category === filters.category);
    }
    if (filters.country !== 'all') {
      articles = articles.filter(a => a.country === filters.country);
    }
    if (filters.type !== 'all') {
      articles = articles.filter(a => a.type === filters.type);
    }
    if (filters.time !== 'all') {
        const now = new Date().getTime();
        const timeLimits = {
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
        };
        articles = articles.filter(a => (now - a.publishedAt.getTime()) < timeLimits[filters.time]);
    }
    if (searchTerm) {
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return articles;
  }, [searchTerm, filters]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const toggleBookmark = useCallback((id: number) => {
      setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  }, []);

  const handleShare = async (article: Article) => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: article.title,
                  text: article.summary,
                  url: window.location.href, 
              });
          } catch (error) {
              console.error('Error sharing:', error);
          }
      } else {
          alert('متاسفانه مرورگر شما از قابلیت اشتراک‌گذاری پشتیبانی نمی‌کند.');
      }
  };
  
  const FilterSelect: React.FC<{ label: string; value: string; options: {value: string; label: string}[]; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;}> = ({label, value, options, onChange}) => (
      <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
          <select value={value} onChange={onChange} className="w-full p-2 text-sm border rounded-lg bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
              {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
      </div>
  )

  return (
    <div className="animate-fadeIn">
      <Header title="اخبار و مقالات" />
      <main className="py-6 space-y-6">
        
        <Card>
            <div className="flex flex-wrap items-end gap-4">
                <FilterSelect label="دسته‌بندی" value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} options={[
                    { value: 'all', label: 'همه دسته‌بندی‌ها'},
                    ...Object.entries(categoryInfo).map(([key, val]) => ({value: key, label: val.name}))
                ]}/>
                <FilterSelect label="کشور" value={filters.country} onChange={e => handleFilterChange('country', e.target.value)} options={[
                    {value: 'all', label: 'همه کشورها'}, {value: 'iran', label: 'ایران'}, {value: 'china', label: 'چین'}, {value: 'eu', label: 'اتحادیه اروپا'}, {value: 'usa', label: 'آمریکا'}, {value: 'india', label: 'هند'}
                ]} />
                <FilterSelect label="نوع خبر" value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} options={[
                    {value: 'all', label: 'همه انواع'}, {value: 'economic', label: 'اقتصادی'}, {value: 'political', label: 'سیاسی'}, {value: 'technical', label: 'فنی'}
                ]} />
                <FilterSelect label="زمان" value={filters.time} onChange={e => handleFilterChange('time', e.target.value)} options={[
                    {value: 'all', label: 'همه زمان‌ها'}, {value: '24h', label: '۲۴ ساعت گذشته'}, {value: '7d', label: '۷ روز گذشته'}, {value: '30d', label: '۳۰ روز گذشته'}
                ]} />
            </div>
        </Card>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <input type="text" placeholder="جستجو در اخبار..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="w-full p-3 ps-10 text-base border-transparent rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-lg shadow-slate-200/50 dark:shadow-black/20"
              />
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400 dark:text-slate-500">
                <i className="fas fa-search"></i>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-700/70">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600' : 'text-slate-500'}`}><i className="fas fa-bars me-2"></i>لیست</button>
                <button onClick={() => setViewMode('card')} className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600' : 'text-slate-500'}`}><i className="fas fa-th-large me-2"></i>کارت</button>
            </div>
        </div>

        <div>
            <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}>
                {paginatedArticles.length > 0 ? (
                    paginatedArticles.map((article) => (
                        <NewsArticleItem key={article.id} article={article} viewMode={viewMode} isBookmarked={bookmarkedIds.has(article.id)} onToggleBookmark={toggleBookmark} onShare={handleShare} />
                    ))
                ) : (
                    <div className="text-center py-16 col-span-full">
                        <i className="fas fa-newspaper fa-3x text-slate-400 dark:text-slate-500 mb-4"></i>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">مقاله‌ای یافت نشد</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">لطفا کلیدواژه یا فیلتر دیگری را امتحان کنید.</p>
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex items-center justify-between">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            <div className="text-xs text-slate-500 dark:text-slate-400">
                آخرین بروزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}
            </div>
        </div>
      </main>
    </div>
  );
};

// --- BUNDLED FROM pages/PremiumAnalysisPage.tsx ---
const reportTypeInfo: Record<ReportType, { name: string; color: string; icon: string; }> = {
    daily: { name: 'پالس روزانه', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400', icon: 'fa-sun' },
    weekly: { name: 'بررسی هفتگی', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400', icon: 'fa-calendar-week' },
    monthly: { name: 'چشم‌انداز ماهانه', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400', icon: 'fa-calendar-alt' },
    technical: { name: 'تحلیل تکنیکال', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400', icon: 'fa-chart-line' },
    fundamental: { name: 'تحلیل بنیادی', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400', icon: 'fa-balance-scale' }
};
const ReportListItem: React.FC<{ report: PremiumReport; onSelect: (id: number) => void; }> = ({ report, onSelect }) => {
    const typeInfo = reportTypeInfo[report.type];
    return (
        <Card className="hover:!shadow-2xl hover:!border-indigo-500/50 border-2 border-transparent">
            <button onClick={() => onSelect(report.id)} className="w-full text-right">
                <div className="flex justify-between items-start mb-3">
                    <div className={`text-xs font-semibold py-1 px-2.5 rounded-full flex items-center gap-2 ${typeInfo.color}`}>
                        <i className={`fas ${typeInfo.icon}`}></i>
                        <span>{typeInfo.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{report.publishedAt.toLocaleDateString('fa-IR')}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{report.title}</h3>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-indigo-500">
                        <i className="fas fa-user-tie"></i>
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{report.author.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{report.author.credentials}</p>
                    </div>
                </div>
            </button>
        </Card>
    );
};
const ReportDetailView: React.FC<{ report: PremiumReport; onBack: () => void; }> = ({ report, onBack }) => {
    const [readMode, setReadMode] = useState<'standard' | 'brief'>('standard');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        return () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        };
    }, []);

    const handleSpeak = () => {
        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const textToSpeak = readMode === 'standard' ? report.content.standard.replace(/<[^>]*>/g, ' ') : report.content.brief;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'fa-IR';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };
    
    const [question, setQuestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!question.trim()) return;
        setIsSubmitting(true);
        setTimeout(() => {
            alert('سوال شما با موفقیت برای تیم تحلیل ارسال شد. پاسخ طی ۲۴ ساعت آینده برای شما ایمیل خواهد شد.');
            setQuestion('');
            setIsSubmitting(false);
        }, 1500);
    }
    
    const typeInfo = reportTypeInfo[report.type];

    return (
        <div className="animate-fadeIn">
            <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                <i className="fas fa-arrow-right"></i>
                <span>بازگشت به لیست تحلیل‌ها</span>
            </button>

            <Card className="hover:!translate-y-0">
                <div className="border-b border-slate-200/80 dark:border-slate-700/80 pb-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                         <div className={`text-sm font-semibold py-1.5 px-3 rounded-full flex items-center gap-2 ${typeInfo.color}`}>
                            <i className={`fas ${typeInfo.icon}`}></i>
                            <span>{typeInfo.name}</span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{report.publishedAt.toLocaleDateString('fa-IR')}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-4">{report.title}</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-indigo-500 text-xl">
                           <i className="fas fa-user-tie"></i>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{report.author.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{report.author.credentials}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/70">
                        <button onClick={() => setReadMode('standard')} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${readMode === 'standard' ? 'bg-white dark:bg-slate-800 shadow font-semibold text-indigo-600' : 'text-slate-500'}`}><i className="fas fa-file-alt me-2"></i>استاندارد</button>
                        <button onClick={() => setReadMode('brief')} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${readMode === 'brief' ? 'bg-white dark:bg-slate-800 shadow font-semibold text-indigo-600' : 'text-slate-500'}`}><i className="fas fa-list-ul me-2"></i>مختصر</button>
                    </div>
                    <div className="flex items-center gap-3">
                         <button onClick={handleSpeak} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${isSpeaking ? 'bg-red-100 dark:bg-red-900/50 text-red-600' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                            <i className={`fas ${isSpeaking ? 'fa-stop-circle' : 'fa-play-circle'}`}></i>
                        </button>
                        <a href={report.downloadUrl} download className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="دانلود PDF">
                            <i className="fas fa-file-pdf"></i>
                        </a>
                    </div>
                </div>

                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                   {readMode === 'standard' ? 
                     <div dangerouslySetInnerHTML={{ __html: report.content.standard }} /> : 
                     <p>{report.content.brief}</p>
                   }
                </div>
                
                {report.chartData && (
                    <div className="my-8">
                        <h4 className="font-bold text-lg mb-4">نمودار تحلیل تکنیکال</h4>
                        <ErrorBoundary>
                            <TechnicalAnalysisChart 
                                data={report.chartData.data}
                                dataKey="value"
                                maKey="ma"
                                supportLevel={report.chartData.support}
                                resistanceLevel={report.chartData.resistance}
                                unit=""
                            />
                        </ErrorBoundary>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-700/80">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><i className="fas fa-key text-amber-500"></i>نکات کلیدی گزارش</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {report.keyTakeaways.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            </Card>

            <Card className="mt-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fas fa-question-circle text-indigo-500"></i>پرسش از متخصص</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">سوال خود را در مورد این تحلیل مستقیماً از <span className="font-semibold">{report.author.name}</span> بپرسید. پاسخ در کمتر از ۲۴ ساعت برای شما ارسال خواهد شد.</p>
                <form onSubmit={handleQuestionSubmit}>
                    <textarea 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                        placeholder="سوال خود را اینجا بنویسید..."
                        className="w-full p-3 text-sm border rounded-lg bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        required
                    />
                    <button type="submit" disabled={isSubmitting} className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-wait">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            <span>در حال ارسال...</span>
                          </>
                        ) : (
                          <>
                             <i className="fas fa-paper-plane"></i>
                             <span>ارسال سوال</span>
                          </>
                        )}
                    </button>
                </form>
            </Card>
        </div>
    );
};
const PremiumAnalysisPage: React.FC = () => {
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

    const handleSelectReport = (id: number) => {
        setSelectedReportId(id);
        window.scrollTo(0, 0); 
    };

    const handleBack = () => {
        setSelectedReportId(null);
    };

    const selectedReport = premiumReports.sort((a,b) => b.publishedAt.getTime() - a.publishedAt.getTime()).find(r => r.id === selectedReportId);

    return (
        <div className="animate-fadeIn">
            <Header title="تحلیل‌های تخصصی" />
            <main className="py-6">
                {selectedReport ? (
                    <ReportDetailView report={selectedReport} onBack={handleBack} />
                ) : (
                    <>
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white text-center shadow-2xl shadow-indigo-500/30 mb-6">
                            <h2 className="text-3xl font-bold mb-2">دسترسی به تحلیل‌های ویژه</h2>
                            <p className="text-sm opacity-90 max-w-md mx-auto">گزارش‌های روزانه، هفتگی و ماهانه توسط تحلیلگران برجسته صنعت فولاد برای تصمیم‌گیری هوشمندانه‌تر.</p>
                        </div>
                        <div className="space-y-6">
                            {premiumReports.sort((a,b) => b.publishedAt.getTime() - a.publishedAt.getTime()).map(report => (
                                <ReportListItem key={report.id} report={report} onSelect={handleSelectReport} />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

// --- BUNDLED FROM pages/PredictionPage.tsx ---
const productOptions = Object.keys(predictionData).map(key => ({
    value: key,
    label: productsData[key].title
}));
const allFlatProducts = {
    'hot-rolled': 'ورق گرم',
    'cold-rolled': 'ورق سرد',
    'galvanized': 'ورق گالوانیزه',
    'slab': 'اسلب',
    'rebars': 'میلگرد'
};
const allProductOptions = Object.entries(allFlatProducts)
    .filter(([key]) => predictionData[key])
    .map(([value, label]) => ({ value, label }));

const InfoCard: React.FC<{ icon: string; title: string; children: React.ReactNode; iconColor?: string }> = ({ icon, title, children, iconColor = 'text-indigo-500' }) => (
    <Card>
        <h3 className={`font-bold text-lg mb-4 flex items-center gap-2.5 border-b border-slate-200/60 dark:border-slate-700/60 pb-3`}>
            <i className={`fas ${icon} ${iconColor}`}></i>
            <span>{title}</span>
        </h3>
        {children}
    </Card>
);
type Algorithm = 'hybrid' | 'lstm' | 'linear';
const TypingIndicator: React.FC = () => (
    <div className="flex items-center justify-start space-x-1.5 py-2 px-3">
        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full" style={{ animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full" style={{ animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full" style={{ animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
    </div>
);
const PredictionPage: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<string>('hot-rolled');
    const [selectedHorizon, setSelectedHorizon] = useState<number>(7);
    const [whatIfInputs, setWhatIfInputs] = useState<WhatIfData>(whatIfInitialData);
    const [simulatedForecast, setSimulatedForecast] = useState<PredictionDataPoint[] | null>(null);
    const [modelWeights, setModelWeights] = useState({ dollar: 0.40, oil: 0.10, ironOre: 0.35, cokingCoal: 0.15 });
    const [algorithm, setAlgorithm] = useState<Algorithm>('hybrid');
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initializeChat = async () => {
            if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const newChat = ai.chats.create({
                        model: 'gemini-2.5-flash',
                        config: {
                            systemInstruction: 'شما «فولاد-AI»، یک مشاور متخصص و تحلیلگر ارشد در حوزه‌های اقتصاد، صنعت فولاد ایران و جهان (شامل شرکت‌هایی مانند فولاد مبارکه و گروه متیل)، سرمایه‌گذاری، بورس، ارز، طلا و انرژی‌های پاک هستید. پاسخ‌های شما باید دقیق، حرفه‌ای، روشنگر و به زبان فارسی باشد. شما برای دریافت اطلاعات لحظه‌ای به جستجوی گوگل دسترسی دارید. از این قابلیت برای پاسخ به سوالات مربوط به رویدادهای اخیر، داده‌های جاری یا موضوعات روز استفاده کنید. هنگام استفاده از جستجو، حتماً منابع خود را ذکر کنید. از ارائه مشاوره مالی مستقیم و تعهدآور خودداری کرده و بر تحلیل مبتنی بر داده‌ها تمرکز کنید. همواره رویکردی یاری‌رسان داشته باشید و کاربران را به پرسیدن سوالات بیشتر تشویق کنید.',
                            tools: [{googleSearch: {}}],
                        },
                    });
                    setChat(newChat);
                    setChatMessages([{
                        id: Date.now(),
                        sender: 'ai',
                        text: 'سلام! من مشاور هوش مصنوعی شما هستم و به اطلاعات لحظه‌ای وب دسترسی دارم. در حوزه‌های اقتصاد، صنعت فولاد، بورس و سرمایه‌گذاری آماده پاسخگویی به سوالات شما هستم. چطور می‌توانم کمکتان کنم؟'
                    }]);
                } catch (error) {
                    console.error("Error initializing Gemini chat:", error);
                    setChatMessages([{
                        id: Date.now(),
                        sender: 'ai',
                        text: 'متاسفانه امکان برقراری ارتباط با مشاور هوش مصنوعی وجود ندارد. لطفا صفحه را مجددا بارگذاری کنید.'
                    }]);
                }
            } else {
                console.warn("Gemini API key is not available. Chat feature is disabled.");
                setChatMessages([{
                    id: Date.now(),
                    sender: 'ai',
                    text: 'مشاور هوش مصنوعی در دسترس نیست. کلید API برای این سرویس پیکربندی نشده است.'
                }]);
            }
        };
        initializeChat();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const predictionResult = useMemo(() => {
        return predictionData[selectedProduct]?.[selectedHorizon] || Object.values(Object.values(predictionData)[0])[0];
    }, [selectedProduct, selectedHorizon]);

    const handleWhatIfChange = useCallback((id: keyof WhatIfData, value: number) => {
        setWhatIfInputs(prev => ({ ...prev, [id]: { ...prev[id], value } }));
    }, []);

    const handleWeightChange = useCallback((id: keyof typeof modelWeights, value: number) => {
        setModelWeights(prev => ({ ...prev, [id]: value }));
    }, []);

    useEffect(() => {
        const initialDollar = whatIfInitialData.dollar.value;
        const initialOil = whatIfInitialData.oil.value;
        const initialIronOre = whatIfInitialData.ironOre.value;
        const initialCokingCoal = whatIfInitialData.cokingCoal.value;

        const dollarChange = (whatIfInputs.dollar.value - initialDollar) / initialDollar;
        const oilChange = (whatIfInputs.oil.value - initialOil) / initialOil;
        const ironOreChange = (whatIfInputs.ironOre.value - initialIronOre) / initialIronOre;
        const cokingCoalChange = (whatIfInputs.cokingCoal.value - initialCokingCoal) / initialCokingCoal;
        
        const baseImpact = (dollarChange * modelWeights.dollar) + (oilChange * modelWeights.oil) + (ironOreChange * modelWeights.ironOre) + (cokingCoalChange * modelWeights.cokingCoal);
        let algoModifier = 1.0;
        if (algorithm === 'lstm') algoModifier = 1.05;
        if (algorithm === 'linear') algoModifier = 0.95;
        const totalImpactFactor = 1 + (baseImpact * algoModifier);

        const newForecast = predictionResult.forecast.map(point => ({
            ...point,
            low: point.actual ? point.actual : Math.round(point.low * totalImpactFactor),
            mid: point.actual ? point.actual : Math.round(point.mid * totalImpactFactor),
            high: point.actual ? point.actual : Math.round(point.high * totalImpactFactor),
        }));
        
        setSimulatedForecast(newForecast);
    }, [whatIfInputs, predictionResult, modelWeights, algorithm]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || !chat || isAiThinking) return;

        const newUserMessage: ChatMessage = { id: Date.now(), sender: 'user', text: trimmedInput };
        const aiMessageId = Date.now() + 1;
        
        setChatMessages(prev => [...prev, newUserMessage, { id: aiMessageId, sender: 'ai', text: '' }]);
        setUserInput('');
        setIsAiThinking(true);

        try {
            const responseStream = await chat.sendMessageStream({ message: trimmedInput });
            let aiResponseText = '';
            let finalResponse = null;
            for await (const chunk of responseStream) {
                aiResponseText += chunk.text;
                finalResponse = chunk;
                const currentAIMessage: ChatMessage = { id: aiMessageId, sender: 'ai', text: aiResponseText + '▍' };
                setChatMessages(prev => [...prev.slice(0, -1), currentAIMessage]);
            }
            const groundingChunks = finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
            const sources = groundingChunks?.map(chunk => chunk.web).filter(web => web && web.uri);
            const finalAIMessage: ChatMessage = { id: aiMessageId, sender: 'ai', text: aiResponseText, sources: sources?.length ? sources : undefined, };
            setChatMessages(prev => [...prev.slice(0, -1), finalAIMessage]);
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: ChatMessage = { id: aiMessageId, sender: 'ai', text: 'متاسفانه در پردازش درخواست شما خطایی رخ داد. لطفا دوباره تلاش کنید.', };
            setChatMessages(prev => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setIsAiThinking(false);
        }
    };
    
    const forecastDisplayData = simulatedForecast || predictionResult.forecast;
    const finalPredictedPrice = forecastDisplayData[forecastDisplayData.length - 1].mid;
    const initialPrice = forecastDisplayData.find(p => p.actual)?.actual || forecastDisplayData[0].mid;
    const priceChangePercent = ((finalPredictedPrice - initialPrice) / initialPrice * 100).toFixed(1);
    const changeType = parseFloat(priceChangePercent) >= 0 ? 'up' : 'down';
    const algorithmLabels: Record<Algorithm, string> = { hybrid: "مدل ترکیبی (پیش‌فرض)", lstm: "شبکه عصبی LSTM (نوسانی)", linear: "تحلیل خطی (محافظه‌کار)", };

    return (
        <div className="animate-fadeIn">
            <Header title="موتور پیش‌بینی قیمت" />
            <main className="py-6 space-y-6">
                <Card>
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">انتخاب محصول</label>
                            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full p-3 text-base border rounded-lg bg-slate-50/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                                {allProductOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 flex items-center gap-2 p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-700/70">
                            {[7, 30, 90].map(h => (
                                <button key={h} onClick={() => setSelectedHorizon(h)} className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedHorizon === h ? 'bg-white dark:bg-slate-800 shadow text-indigo-600' : 'text-slate-500'}`}>
                                    {h} روزه
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                             <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-lg">پیش‌بینی قیمت {productsData[selectedProduct].title} ({selectedHorizon} روزه)</h3>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                قیمت نهایی: <span className={`font-bold ${changeType === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{finalPredictedPrice.toLocaleString('fa-IR')} تومان</span> 
                                <span className="mx-2">|</span>
                                تغییر: <span className={`font-bold ${changeType === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{priceChangePercent}%</span>
                             </p>
                             <ErrorBoundary>
                                <PredictionChart data={forecastDisplayData} unit="تومان" />
                             </ErrorBoundary>
                        </Card>
                    </div>
                    <div>
                         <InfoCard icon="fa-bullseye" title="امتیاز دقت پیش‌بینی" iconColor="text-amber-500">
                             <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">بر اساس عملکرد مدل در ۳۰ روز گذشته</p>
                             <GaugeChart value={predictionResult.accuracy} color={predictionResult.accuracy > 85 ? '#10b981' : predictionResult.accuracy > 75 ? '#f59e0b' : '#ef4444'} />
                         </InfoCard>
                    </div>
                </div>
                <InfoCard icon="fa-cogs" title="تنظیمات مدل پیش‌بینی" iconColor="text-slate-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                             <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">وزن‌دهی به عوامل</h4>
                             <div className="space-y-4">
                                {Object.entries(modelWeights).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-sm font-medium">{whatIfInitialData[key as keyof WhatIfData].name}</label>
                                            <span className="text-sm font-bold bg-slate-200/70 dark:bg-slate-700/70 px-2 py-0.5 rounded-md">{Math.round(value * 100)}%</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="1" step="0.05" value={value}
                                            onChange={(e) => handleWeightChange(key as keyof typeof modelWeights, parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-500"
                                        />
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div>
                             <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">انتخاب الگوریتم</h4>
                             <div className="space-y-2">
                                {(Object.keys(algorithmLabels) as Algorithm[]).map(algoKey => (
                                    <label key={algoKey} className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${algorithm === algoKey ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'bg-slate-100/70 dark:bg-slate-800/70 border-transparent'}`}>
                                        <input type="radio" name="algorithm" value={algoKey} checked={algorithm === algoKey} onChange={() => setAlgorithm(algoKey)} className="hidden"/>
                                        <span className={`text-sm font-semibold ${algorithm === algoKey ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{algorithmLabels[algoKey]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </InfoCard>
                <InfoCard icon="fa-sliders-h" title="شبیه‌ساز «اگر-چه؟» (What-If?)" iconColor="text-purple-500">
                     <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                         با حرکت دادن اسلایدرها، تأثیر لحظه‌ای هر متغیر بر قیمت نهایی را مشاهده کنید. این تحلیل حساسیت به شما کمک می‌کند تا درک بهتری از ریسک‌ها و فرصت‌های بازار داشته باشید.
                     </p>
                     <div className="space-y-5 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                         {Object.values(whatIfInputs).map(variable => {
                             const initialValue = whatIfInitialData[variable.id].value;
                             const change = (variable.value - initialValue) / initialValue;
                             const impact = change * modelWeights[variable.id as keyof typeof modelWeights] * 100;
                            return (
                             <div key={variable.id}>
                                 <div className="flex justify-between items-center mb-1 text-sm">
                                     <label className="font-semibold">{variable.name}</label>
                                     <span className={`font-bold px-2 py-0.5 rounded-md ${impact === 0 ? 'bg-slate-200/70 dark:bg-slate-700/70' : impact > 0 ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                                         تأثیر: {impact.toFixed(1)}%
                                     </span>
                                 </div>
                                 <div className="flex justify-between items-center mb-1 text-sm">
                                    <span>مقدار فعلی:</span>
                                    <span className="font-bold">{variable.value.toLocaleString('fa-IR')} {variable.unit}</span>
                                 </div>
                                 <input
                                     type="range" min={variable.min} max={variable.max} step={variable.step} value={variable.value}
                                     onChange={e => handleWhatIfChange(variable.id, parseFloat(e.target.value))}
                                     className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                 />
                             </div>
                            );
                         })}
                     </div>
                </InfoCard>
                <InfoCard icon="fa-lightbulb" title="عوامل اصلی تاثیرگذار (Explainable AI)" iconColor="text-emerald-500">
                    <div className="space-y-4 text-sm">
                        {predictionResult.factors.map(factor => (
                            <div key={factor.name} className="bg-slate-100/70 dark:bg-slate-800/70 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                     <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">{factor.name}</p>
                                     <p className={`font-bold px-2 py-1 rounded-md text-xs ${factor.direction === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>{factor.impact}</p>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{factor.description}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
                 <InfoCard icon="fa-sitemap" title="تحلیل سناریو" iconColor="text-sky-500">
                    <ul className="space-y-4 text-sm">
                        {predictionResult.scenarios.map(scenario => (
                             <li key={scenario.condition} className="bg-slate-100/70 dark:bg-slate-800/70 p-4 rounded-lg">
                                 <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{scenario.condition}</p>
                                 <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{scenario.description}</p>
                                 <p className="font-bold text-indigo-600 dark:text-indigo-400 text-base text-left">{scenario.outcome}</p>
                             </li>
                        ))}
                    </ul>
                </InfoCard>
                <InfoCard icon="fa-comments" title="مشاوره آنلاین AI" iconColor="text-teal-500">
                    <div className="flex flex-col h-[32rem] bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
                        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-6">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-3 animate-messageFadeIn ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white shadow-lg ${msg.sender === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' : 'bg-gradient-to-br from-teal-500 to-sky-600 shadow-teal-500/30'}`}>
                                        <i className={`fas ${msg.sender === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
                                    </div>
                                    <div className={`max-w-xs md:max-w-md p-4 rounded-2xl text-sm shadow-md ${ msg.sender === 'user' 
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none' 
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700' 
                                    }`}>
                                        {msg.sender === 'ai' && msg.text === '' ? (
                                            <TypingIndicator />
                                        ) : (
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                        )}
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-300/50 dark:border-slate-700/50">
                                                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-2">منابع:</h4>
                                                <ul className="space-y-1.5 text-xs">
                                                    {msg.sources.map((source, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <i className="fas fa-link fa-xs mt-1 text-slate-400"></i>
                                                            <a 
                                                                href={source.uri} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                                                                title={source.title}
                                                            >
                                                                {source.title || new URL(source.uri).hostname}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="mt-auto p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-t border-slate-200/60 dark:border-slate-700/60">
                             <div className="flex items-center gap-2">
                                <input 
                                    type="text" value={userInput} onChange={e => setUserInput(e.target.value)}
                                    placeholder="مثلا: وضعیت سهام فولاد مبارکه را تحلیل کن"
                                    className="flex-grow py-2.5 px-4 text-sm border-transparent rounded-full bg-slate-100 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    disabled={isAiThinking || !chat}
                                />
                                <button type="submit" disabled={isAiThinking || !chat} className="w-10 h-10 flex-shrink-0 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-wait transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
                                    {isAiThinking ? 
                                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> :
                                        <i className="fas fa-arrow-up text-sm"></i>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </InfoCard>
            </main>
        </div>
    );
};

// --- BUNDLED FROM pages/ResumePage.tsx ---
const ResumeSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h3 className="text-xl font-bold border-r-4 border-indigo-500 pr-3 mb-4 text-slate-800 dark:text-slate-200">{title}</h3>
    <ul className="space-y-3">{children}</ul>
  </section>
);
const ResumeListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start">
    <i className="fas fa-check-circle text-indigo-400 mt-1.5 ml-3 flex-shrink-0"></i>
    <span>{children}</span>
  </li>
);
const ResumeSkill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
      <i className="fas fa-star text-amber-400 mt-1.5 ml-3 flex-shrink-0"></i>
      <span>{children}</span>
    </li>
);
const ResumePage: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const handlePrint = () => window.print();

  return (
    <div className="animate-fadeIn mt-6 mb-6">
        <div className="p-4 sm:p-8 bg-white dark:bg-slate-900/70 rounded-2xl shadow-2xl relative print:shadow-none print:p-0 print:m-0">
            <style>{`
                @media print {
                body { background-color: #fff !important; }
                html, body { font-size: 10pt; }
                .no-print { display: none !important; }
                .print-break-before { page-break-before: always; }
                .dark .print-dark-hidden { display: none; }
                .dark body { color: #000 !important; }
                .dark h1, .dark h2, .dark h3, .dark span, .dark p, .dark li { color: #000 !important; }
                .dark section { border-color: #000 !important; }
                }
            `}</style>
            <div className="absolute top-4 right-4 flex gap-2 no-print">
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition-colors">
                    <i className="fas fa-arrow-right"></i>
                    <span>بازگشت</span>
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
                    <i className="fas fa-print"></i>
                    <span>چاپ / ذخیره PDF</span>
                </button>
            </div>
            
            <div className="resume-container max-w-4xl mx-auto text-slate-800 dark:text-slate-300">
                <div>
                <header className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-dashed pb-4 mb-6">
                    <div className="text-center sm:text-right order-2 sm:order-1">
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">علی ثابت</h1>
                        <p className="mt-2 font-semibold">تلفن : ۰۹۱۲۶۲۶۵۵۰۸</p>
                        <p className="font-semibold">ایمیل : Dr.alisabett@gmail.com</p>
                    </div>
                    <div className="w-32 h-32 rounded-full mb-4 sm:mb-0 order-1 sm:order-2 bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-md">
                        <i className="fas fa-user-tie text-6xl text-indigo-500 dark:text-indigo-400"></i>
                    </div>
                </header>
                
                <ResumeSection title="خلاصه تجربیات">
                    <ResumeListItem>بیش از ۲۰ سال سابقه فعالیت در بازارهای کالایی ایران و جهان، با تمرکز ویژه بر صنعت فولاد.</ResumeListItem>
                    <ResumeListItem>تحلیلگر ارشد و استراتژیست بازار، مسلط بر تحلیل‌های بنیادی و تکنیکال.</ResumeListItem>
                    <ResumeListItem>دارای دکترای اقتصاد با گرایش بازارهای مالی و کالایی.</ResumeListItem>
                    <ResumeListItem>مدرس دوره‌های تخصصی تحلیل بازار فولاد و مدیریت ریسک در بورس کالا.</ResumeListItem>
                </ResumeSection>
                <ResumeSection title="سوابق تحصیلی">
                    <ResumeListItem><strong>دکترای اقتصاد:</strong> دانشگاه تهران، با رساله "تحلیل نوسانات قیمت در زنجیره ارزش فولاد ایران"</ResumeListItem>
                    <ResumeListItem><strong>کارشناسی ارشد مدیریت بازرگانی (MBA):</strong> دانشگاه صنعتی شریف</ResumeListItem>
                    <ResumeListItem><strong>کارشناسی مهندسی مواد - متالورژی صنعتی:</strong> دانشگاه علم و صنعت ایران</ResumeListItem>
                </ResumeSection>
                <ResumeSection title="سوابق اجرایی و مدیریتی">
                    <ResumeListItem><strong>مدیرعامل و عضو هیئت مدیره شرکت سرمایه‌گذاری آتیه فولاد نقش جهان</strong> (۱۳۹۹ - تاکنون)</ResumeListItem>
                    <ResumeListItem><strong>معاون بازرگانی شرکت فولاد مبارکه اصفهان</strong> (۱۳۹۵ - ۱۳۹۹)</ResumeListItem>
                    <ResumeListItem><strong>مدیر فروش داخلی و صادرات شرکت فولاد خوزستان</strong> (۱۳۹۰ - ۱۳۹۵)</ResumeListItem>
                    <ResumeListItem><strong>کارشناس و تحلیلگر ارشد بورس کالای ایران</strong> (۱۳۸۶ - ۱۳۹۰)</ResumeListItem>
                </ResumeSection>
                </div>
                <div className="print-break-before">
                <ResumeSection title="مهارت‌های تخصصی">
                    <ResumeSkill>تحلیل بنیادی (Fundamental Analysis) زنجیره فولاد (سنگ آهن، قراضه، محصولات نهایی)</ResumeSkill>
                    <ResumeSkill>تحلیل تکنیکال (Technical Analysis) پیشرفته و الگوهای قیمتی</ResumeSkill>
                    <ResumeSkill>مدیریت ریسک و ابزارهای پوشش ریسک (قراردادهای آتی و اختیار معامله)</ResumeSkill>
                    <ResumeSkill>آشنایی کامل با بازارهای LME, SHFE و Platts</ResumeSkill>
                    <ResumeSkill>اقتصاد کلان و تأثیر آن بر بازارهای کالایی</ResumeSkill>
                    <ResumeSkill>اصول بازاریابی، فروش و توسعه بازارهای صادراتی</ResumeSkill>
                </ResumeSection>
                <ResumeSection title="دستاوردها و افتخارات">
                    <ResumeListItem>افزایش سهم بازار صادراتی فولاد مبارکه به میزان ۳۰٪ در دوران تصدی معاونت بازرگانی.</ResumeListItem>
                    <ResumeListItem>طراحی و پیاده‌سازی سیستم نوین قیمت‌گذاری محصولات فولادی در بورس کالا.</ResumeListItem>
                    <ResumeListItem>کسب عنوان "تحلیلگر برتر کالایی" از جشنواره بورس ایران (سه دوره).</ResumeListItem>
                    <ResumeListItem>چاپ بیش از ۱۰ مقاله علمی-پژوهشی در مجلات معتبر اقتصادی و متالورژی.</ResumeListItem>
                </ResumeSection>
                <ResumeSection title="دوره‌ها و گواهینامه‌های بین‌المللی">
                    <ResumeListItem>گواهینامه تحلیلگری بازارهای کالایی از موسسه LME Education لندن</ResumeListItem>
                    <ResumeListItem>دوره پیشرفته مدیریت استراتژیک از دانشگاه INSEAD فرانسه</ResumeListItem>
                    <ResumeListItem>گواهینامه اصول مدیریت پروژه (PMP)</ResumeListItem>
                </ResumeSection>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- BUNDLED FROM App.tsx ---
function App() {
  const [activePage, setActivePage] = useState<Page>(Page.DASHBOARD);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) return storedTheme as Theme;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
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
      case Page.DASHBOARD: return <DashboardPage />;
      case Page.ANALYSIS: return <AnalysisPage />;
      case Page.PRICES: return <PricesPage />;
      case Page.NEWS: return <NewsPage />;
      case Page.PREMIUM_ANALYSIS: return <PremiumAnalysisPage />;
      case Page.PREDICTION: return <PredictionPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="antialiased text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 pb-28">
            {showResume ? (
              <ResumePage onBack={handleHideResume} />
            ) : (
              <>
                {renderPage()}
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
    </ThemeContext.Provider>
  );
}

// --- BUNDLED FROM index.tsx (original) ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);