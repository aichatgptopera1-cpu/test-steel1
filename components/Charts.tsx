
import React, { useContext } from 'react';
import { AreaChart, Area, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Legend, ReferenceLine } from 'recharts';
import { ThemeContext } from '../contexts/ThemeContext.tsx';

interface AnalyticsChartProps {
  data: any[];
  dataKey: string;
  color: string;
  unit: string;
  labels: string[];
  simple?: boolean;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, dataKey, color, unit, labels, simple = false }) => {
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


interface GaugeChartProps {
  value: number; // 0 to 100
  color: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ value, color }) => {
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

interface TechnicalAnalysisChartProps {
  data: any[];
  dataKey: string;
  maKey: string;
  unit: string;
  supportLevel?: number;
  resistanceLevel?: number;
}

export const TechnicalAnalysisChart: React.FC<TechnicalAnalysisChartProps> = ({ data, dataKey, maKey, unit, supportLevel, resistanceLevel }) => {
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

interface PredictionChartProps {
    data: any[];
    unit: string;
}

export const PredictionChart: React.FC<PredictionChartProps> = ({ data, unit }) => {
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