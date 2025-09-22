import { Article, NewsCategory } from '../types.ts';

export const categoryInfo: Record<NewsCategory, { name: string; color: string; }> = {
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

export const newsData: Article[] = [
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