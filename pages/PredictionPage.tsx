import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Header from '../components/Header.tsx';
import Card from '../components/Card.tsx';
import { PredictionChart, GaugeChart } from '../components/Charts.tsx';
import { predictionData, whatIfInitialData } from '../data/prediction.ts';
import { productsData } from '../data.ts';
import { PredictionDataPoint, WhatIfVariable, WhatIfData, ChatMessage } from '../types.ts';
import ErrorBoundary from '../components/ErrorBoundary.tsx';
import { GoogleGenAI, Chat } from '@google/genai';

const productOptions = Object.keys(predictionData).map(key => ({
    value: key,
    label: productsData[key].title
}));

// Manually add other flat products to the list if they are not in predictionData
const allFlatProducts = {
    'hot-rolled': 'ورق گرم',
    'cold-rolled': 'ورق سرد',
    'galvanized': 'ورق گالوانیزه',
    'slab': 'اسلب',
    'rebars': 'میلگرد' // Keep rebar as well
};

const allProductOptions = Object.entries(allFlatProducts)
    .filter(([key]) => predictionData[key]) // Ensure only products with prediction data are shown
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
    
    // Model settings state
    const [modelWeights, setModelWeights] = useState({
        dollar: 0.40,
        oil: 0.10,
        ironOre: 0.35,
        cokingCoal: 0.15
    });
    const [algorithm, setAlgorithm] = useState<Algorithm>('hybrid');

    // Chat state
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initializeChat = async () => {
            // FIX: The `process` object does not exist in browser environments. 
            // We must check for its existence to prevent a runtime crash.
            // The Gemini chat feature will be disabled if the API key is not available
            // through a proper build process that defines environment variables.
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
                     // Initial welcome message from AI
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
                // Handle the case where API_KEY is not available
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
        // Auto-scroll chat to the bottom
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);


    const predictionResult = useMemo(() => {
        return predictionData[selectedProduct]?.[selectedHorizon] || Object.values(Object.values(predictionData)[0])[0];
    }, [selectedProduct, selectedHorizon]);

    const handleWhatIfChange = useCallback((id: keyof WhatIfData, value: number) => {
        setWhatIfInputs(prev => ({
            ...prev,
            [id]: { ...prev[id], value }
        }));
    }, []);

    const handleWeightChange = useCallback((id: keyof typeof modelWeights, value: number) => {
        setModelWeights(prev => ({
            ...prev,
            [id]: value
        }));
    }, []);

    // Effect to run simulation when inputs change
    useEffect(() => {
        const initialDollar = whatIfInitialData.dollar.value;
        const initialOil = whatIfInitialData.oil.value;
        const initialIronOre = whatIfInitialData.ironOre.value;
        const initialCokingCoal = whatIfInitialData.cokingCoal.value;

        const dollarChange = (whatIfInputs.dollar.value - initialDollar) / initialDollar;
        const oilChange = (whatIfInputs.oil.value - initialOil) / initialOil;
        const ironOreChange = (whatIfInputs.ironOre.value - initialIronOre) / initialIronOre;
        const cokingCoalChange = (whatIfInputs.cokingCoal.value - initialCokingCoal) / initialCokingCoal;
        
        const baseImpact = (dollarChange * modelWeights.dollar) + 
                           (oilChange * modelWeights.oil) + 
                           (ironOreChange * modelWeights.ironOre) + 
                           (cokingCoalChange * modelWeights.cokingCoal);

        let algoModifier = 1.0;
        if (algorithm === 'lstm') algoModifier = 1.05; // More volatile
        if (algorithm === 'linear') algoModifier = 0.95; // More conservative

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
                const currentAIMessage: ChatMessage = {
                    id: aiMessageId,
                    sender: 'ai',
                    text: aiResponseText + '▍'
                };
                setChatMessages(prev => [...prev.slice(0, -1), currentAIMessage]);
            }

            const groundingChunks = finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
            const sources = groundingChunks
                ?.map(chunk => chunk.web)
                .filter(web => web && web.uri);

            const finalAIMessage: ChatMessage = {
                id: aiMessageId,
                sender: 'ai',
                text: aiResponseText,
                sources: sources?.length ? sources : undefined,
            };
            setChatMessages(prev => [...prev.slice(0, -1), finalAIMessage]);

        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: ChatMessage = {
                id: aiMessageId,
                sender: 'ai',
                text: 'متاسفانه در پردازش درخواست شما خطایی رخ داد. لطفا دوباره تلاش کنید.',
            };
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
    
    const algorithmLabels: Record<Algorithm, string> = {
        hybrid: "مدل ترکیبی (پیش‌فرض)",
        lstm: "شبکه عصبی LSTM (نوسانی)",
        linear: "تحلیل خطی (محافظه‌کار)",
    };

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
                                     type="range"
                                     min={variable.min}
                                     max={variable.max}
                                     step={variable.step}
                                     value={variable.value}
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
                                    type="text"
                                    value={userInput}
                                    onChange={e => setUserInput(e.target.value)}
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

export default PredictionPage;