
import React from 'react';
import Header from '../components/Header.tsx';
import Card from '../components/Card.tsx';

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

const ProductsPage: React.FC = () => {
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
      <Header title="قیمت محصولات فولادی" />
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

export default ProductsPage;