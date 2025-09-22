import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header.tsx';
import Card from '../components/Card.tsx';
import { premiumReports } from '../data/premiumAnalysis.ts';
import { PremiumReport, ReportType } from '../types.ts';
import { TechnicalAnalysisChart } from '../components/Charts.tsx';
import ErrorBoundary from '../components/ErrorBoundary.tsx';

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

    // Cleanup speech synthesis on component unmount
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
        utterance.onerror = () => setIsSpeaking(false); // Handle errors too
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
        window.scrollTo(0, 0); // Scroll to top when a report is selected
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

export default PremiumAnalysisPage;