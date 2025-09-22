import React from 'react';

interface ResumePageProps {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h3 className="text-xl font-bold border-r-4 border-indigo-500 pr-3 mb-4 text-slate-800 dark:text-slate-200">{title}</h3>
    <ul className="space-y-3">{children}</ul>
  </section>
);

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start">
    <i className="fas fa-check-circle text-indigo-400 mt-1.5 ml-3 flex-shrink-0"></i>
    <span>{children}</span>
  </li>
);

const Skill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
      <i className="fas fa-star text-amber-400 mt-1.5 ml-3 flex-shrink-0"></i>
      <span>{children}</span>
    </li>
);

const ResumePage: React.FC<ResumePageProps> = ({ onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fadeIn mt-6 mb-6">
        <div className="p-4 sm:p-8 bg-white dark:bg-slate-900/70 rounded-2xl shadow-2xl relative print:shadow-none print:p-0 print:m-0">
            <style>{`
                @media print {
                body {
                    background-color: #fff !important;
                }
                html, body {
                    font-size: 10pt;
                }
                .no-print {
                    display: none !important;
                }
                .print-break-before {
                    page-break-before: always;
                }
                .dark .print-dark-hidden {
                    display: none;
                }
                .dark body {
                    color: #000 !important;
                }
                .dark h1, .dark h2, .dark h3, .dark span, .dark p, .dark li {
                    color: #000 !important;
                }
                .dark section {
                    border-color: #000 !important;
                }
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
                {/* Page 1 */}
                <div>
                {/* Header */}
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
                
                <Section title="خلاصه تجربیات">
                    <ListItem>بیش از ۲۰ سال سابقه فعالیت در بازارهای کالایی ایران و جهان، با تمرکز ویژه بر صنعت فولاد.</ListItem>
                    <ListItem>تحلیلگر ارشد و استراتژیست بازار، مسلط بر تحلیل‌های بنیادی و تکنیکال.</ListItem>
                    <ListItem>دارای دکترای اقتصاد با گرایش بازارهای مالی و کالایی.</ListItem>
                    <ListItem>مدرس دوره‌های تخصصی تحلیل بازار فولاد و مدیریت ریسک در بورس کالا.</ListItem>
                </Section>

                <Section title="سوابق تحصیلی">
                    <ListItem><strong>دکترای اقتصاد:</strong> دانشگاه تهران، با رساله "تحلیل نوسانات قیمت در زنجیره ارزش فولاد ایران"</ListItem>
                    <ListItem><strong>کارشناسی ارشد مدیریت بازرگانی (MBA):</strong> دانشگاه صنعتی شریف</ListItem>
                    <ListItem><strong>کارشناسی مهندسی مواد - متالورژی صنعتی:</strong> دانشگاه علم و صنعت ایران</ListItem>
                </Section>
                
                <Section title="سوابق اجرایی و مدیریتی">
                    <ListItem><strong>مدیرعامل و عضو هیئت مدیره شرکت سرمایه‌گذاری آتیه فولاد نقش جهان</strong> (۱۳۹۹ - تاکنون)</ListItem>
                    <ListItem><strong>معاون بازرگانی شرکت فولاد مبارکه اصفهان</strong> (۱۳۹۵ - ۱۳۹۹)</ListItem>
                    <ListItem><strong>مدیر فروش داخلی و صادرات شرکت فولاد خوزستان</strong> (۱۳۹۰ - ۱۳۹۵)</ListItem>
                    <ListItem><strong>کارشناس و تحلیلگر ارشد بورس کالای ایران</strong> (۱۳۸۶ - ۱۳۹۰)</ListItem>
                </Section>
                </div>
                
                {/* Page 2 */}
                <div className="print-break-before">
                <Section title="مهارت‌های تخصصی">
                    <Skill>تحلیل بنیادی (Fundamental Analysis) زنجیره فولاد (سنگ آهن، قراضه، محصولات نهایی)</Skill>
                    <Skill>تحلیل تکنیکال (Technical Analysis) پیشرفته و الگوهای قیمتی</Skill>
                    <Skill>مدیریت ریسک و ابزارهای پوشش ریسک (قراردادهای آتی و اختیار معامله)</Skill>
                    <Skill>آشنایی کامل با بازارهای LME, SHFE و Platts</Skill>
                    <Skill>اقتصاد کلان و تأثیر آن بر بازارهای کالایی</Skill>
                    <Skill>اصول بازاریابی، فروش و توسعه بازارهای صادراتی</Skill>
                </Section>

                <Section title="دستاوردها و افتخارات">
                    <ListItem>افزایش سهم بازار صادراتی فولاد مبارکه به میزان ۳۰٪ در دوران تصدی معاونت بازرگانی.</ListItem>
                    <ListItem>طراحی و پیاده‌سازی سیستم نوین قیمت‌گذاری محصولات فولادی در بورس کالا.</ListItem>
                    <ListItem>کسب عنوان "تحلیلگر برتر کالایی" از جشنواره بورس ایران (سه دوره).</ListItem>
                    <ListItem>چاپ بیش از ۱۰ مقاله علمی-پژوهشی در مجلات معتبر اقتصادی و متالورژی.</ListItem>
                </Section>

                <Section title="دوره‌ها و گواهینامه‌های بین‌المللی">
                    <ListItem>گواهینامه تحلیلگری بازارهای کالایی از موسسه LME Education لندن</ListItem>
                    <ListItem>دوره پیشرفته مدیریت استراتژیک از دانشگاه INSEAD فرانسه</ListItem>
                    <ListItem>گواهینامه اصول مدیریت پروژه (PMP)</ListItem>
                </Section>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ResumePage;