import { ProductsData, GlobalCommoditiesData } from './types.ts';

const lastUpdatedDate = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });

export const productsData: ProductsData = {
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
    detailedPrices: [
        { spec: 'ضخامت 2mm', dimension: 1250, price: 41800 },
        { spec: 'ضخامت 3mm', dimension: 1500, price: 42000 },
        { spec: 'ضخامت 5mm', dimension: 1500, price: 42100 },
        { spec: 'ضخامت 8mm', dimension: 1500, price: 42250 },
        { spec: 'ضخامت 10mm', dimension: 1500, price: 42300 },
    ],
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
    detailedPrices: [
        { spec: 'ضخامت 0.5mm', dimension: 1000, price: 48200 },
        { spec: 'ضخامت 0.7mm', dimension: 1250, price: 47900 },
        { spec: 'ضخامت 0.9mm', dimension: 1250, price: 47750 },
        { spec: 'ضخامت 1mm', dimension: 1250, price: 47600 },
    ],
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
    detailedPrices: [
        { spec: 'ضخامت 0.5mm', dimension: 1250, price: 53100 },
        { spec: 'ضخامت 0.8mm', dimension: 1250, price: 52800 },
        { spec: 'ضخامت 1mm', dimension: 1250, price: 52500 },
    ],
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
    detailedPrices: [
        { spec: 'سایز 12', dimension: 'A3', price: 25450 },
        { spec: 'سایز 14', dimension: 'A3', price: 25150 },
        { spec: 'سایز 16', dimension: 'A3', price: 25150 },
        { spec: 'سایز 18', dimension: 'A3', price: 25200 },
        { spec: 'سایز 20', dimension: 'A3', price: 25200 },
        { spec: 'سایز 22', dimension: 'A3', price: 25300 },
    ],
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
    detailedPrices: [
        { spec: 'سایز 14', dimension: '12m', price: 39800 },
        { spec: 'سایز 16', dimension: '12m', price: 39950 },
        { spec: 'سایز 18', dimension: '12m', price: 40100 },
        { spec: 'سایز 20', dimension: '12m', price: 40500 },
    ],
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
    detailedPrices: [
        { spec: 'فولاد خوزستان', dimension: '1500*250', price: 35200 },
        { spec: 'فولاد هرمزگان', dimension: '1500*200', price: 35100 },
    ],
  },
};

export const globalCommoditiesData: GlobalCommoditiesData = {
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