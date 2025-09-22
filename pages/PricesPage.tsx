import React from 'react';
import Header from '../components/Header.tsx';
import Card from '../components/Card.tsx';
import { useMarketData } from '../contexts/MarketDataContext.tsx';
import { ProductPriceRow } from '../types.ts';

interface ProductTableProps {
  title: string;
  rows: ProductPriceRow[];
  headers?: string[];
  lastChange: number;
}

const ProductTable: React.FC<ProductTableProps> = ({ title, rows, headers = ['مشخصات', 'عرض / استاندارد', 'قیمت', 'تغییر'], lastChange }) => {
    const changeType = lastChange >= 0 ? 'up' : 'down';
    const changeFormatted = `${lastChange > 0 ? '+' : ''}${lastChange.toFixed(1)}%`;

    return (
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
                  <td className="p-4 whitespace-nowrap">{row.spec}</td>
                  <td className="p-4 whitespace-nowrap">{row.dimension}</td>
                  <td className="p-4 font-semibold whitespace-nowrap">{row.price.toLocaleString('fa-IR')}</td>
                  <td className={`p-4 whitespace-nowrap font-semibold ${changeType === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{changeFormatted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
};


const PricesPage: React.FC = () => {
    const { productsData, isLoading } = useMarketData();

    const tables = [
        { key: 'rebars', title: 'میلگرد (Rebar)', headers: ['سایز', 'استاندارد', 'قیمت', 'تغییر'] },
        { key: 'i-beam', title: 'تیرآهن (I-Beam)', headers: ['سایز', 'طول شاخه', 'قیمت', 'تغییر'] },
        { key: 'hot-rolled', title: 'ورق گرم (Hot Rolled Sheet)', headers: ['ضخامت', 'عرض', 'قیمت', 'تغییر'] },
        { key: 'cold-rolled', title: 'ورق سرد (Cold Rolled Sheet)', headers: ['ضخامت', 'عرض', 'قیمت', 'تغییر'] },
        { key: 'galvanized', title: 'ورق گالوانیزه (Galvanized Sheet)', headers: ['ضخامت', 'عرض', 'قیمت', 'تغییر'] },
    ];

  return (
    <div className="animate-fadeIn">
      <Header title="قیمت‌ها" />
      <main className="py-6 space-y-6 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-30 rounded-2xl pt-20">
                <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          )}
          {tables.map(tableInfo => {
              const product = productsData[tableInfo.key];
              if (!product || !product.detailedPrices) return null;
              return (
                <ProductTable 
                    key={tableInfo.key}
                    title={tableInfo.title}
                    rows={product.detailedPrices}
                    headers={tableInfo.headers}
                    lastChange={product.change}
                />
              )
          })}
           <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4">
                منبع قیمت‌ها: شبکه اطلاع‌رسانی آهن و فولاد ایران (بروزرسانی شبیه‌سازی شده)
            </div>
      </main>
    </div>
  );
};

export default PricesPage;