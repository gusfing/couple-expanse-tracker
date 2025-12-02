import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Expense, Category, CATEGORY_COLORS, BudgetSettings } from '../types';
import { formatCurrency } from '../utils/format';
import { Card } from './ui/Card';

interface StatsProps {
  expenses: Expense[];
  settings: BudgetSettings;
}

export const Stats: React.FC<StatsProps> = ({ expenses, settings }) => {
  // 1. Calculate Payer Split
  const meSpent = expenses.filter(e => e.payer === 'Me').reduce((sum, e) => sum + e.amount, 0);
  const partnerSpent = expenses.filter(e => e.payer === 'Partner').reduce((sum, e) => sum + e.amount, 0);
  const total = meSpent + partnerSpent;
  
  const mePercent = total === 0 ? 50 : (meSpent / total) * 100;

  // 2. Weekly Split Data (Stacked Bar)
  const getWeeklyData = () => {
    const data = [];
    const today = new Date();
    // Show last 5 days for better mobile fit
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.getDate() === today.getDate() ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);

      const dayExpenses = expenses.filter(e => e.date === dateStr);
      const meVal = dayExpenses.filter(e => e.payer === 'Me').reduce((sum, e) => sum + e.amount, 0);
      const partnerVal = dayExpenses.filter(e => e.payer === 'Partner').reduce((sum, e) => sum + e.amount, 0);

      data.push({
        day: dayLabel,
        me: meVal,
        partner: partnerVal
      });
    }
    return data;
  };
  
  const weeklyData = getWeeklyData();
  const hasWeeklyData = weeklyData.some(d => d.me > 0 || d.partner > 0);

  // 3. Calculate Category Breakdown
  const categoryData = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<Category, number>);

  const chartData = (Object.entries(categoryData) as [string, number][])
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const activeChartData = chartData.filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* 1. Payer Split Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase truncate pr-1">{settings.userName} Paid</span>
          <span className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(meSpent, settings.currencySymbol)}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-emerald-400">
          <span className="text-xs font-semibold text-slate-400 uppercase truncate pr-1">{settings.partnerName} Paid</span>
          <span className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(partnerSpent, settings.currencySymbol)}</span>
        </Card>
      </div>

      {/* 2. Visual Balance Bar */}
      <div className="relative pt-2 pb-2">
         <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>{Math.round(mePercent)}%</span>
            <span>{Math.round(100 - mePercent)}%</span>
         </div>
         <div className="flex h-4 w-full rounded-full overflow-hidden shadow-inner bg-slate-100">
            <div 
               className="bg-slate-800 transition-all duration-700 ease-out flex items-center justify-center relative group" 
               style={{ width: `${mePercent}%` }}
            />
            <div 
                className="bg-emerald-400 transition-all duration-700 ease-out" 
                style={{ width: `${100 - mePercent}%` }}
            />
         </div>
         <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
             <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <span>{settings.userName}</span>
             </div>
             <div className="flex items-center gap-1">
                <span>{settings.partnerName}</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
             </div>
         </div>
      </div>

      {/* 3. NEW: Weekly Stacked Bar Chart */}
      {hasWeeklyData && (
        <Card className="p-5">
           <h3 className="text-sm font-bold text-slate-800 mb-4">Spending This Week</h3>
           <div className="h-52 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} 
                    dy={10}
                 />
                 <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    tickFormatter={(val) => `${val}`}
                 />
                 <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}
                    formatter={(value: number, name: string) => [
                        formatCurrency(value, settings.currencySymbol), 
                        name === 'me' ? settings.userName : settings.partnerName
                    ]}
                 />
                 <Legend 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                    formatter={(value) => (
                      <span className="text-slate-500 font-medium ml-1">
                        {value === 'me' ? settings.userName : settings.partnerName}
                      </span>
                    )}
                 />
                 {/* Stacked Bars */}
                 <Bar dataKey="me" name="me" stackId="a" fill="#1e293b" radius={[0, 0, 4, 4]} barSize={24} />
                 <Bar dataKey="partner" name="partner" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </Card>
      )}

      {/* 4. Category Breakdown */}
      {activeChartData.length > 0 ? (
        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Category Breakdown</h3>
          
          <div className="flex flex-row items-center">
            {/* Chart */}
            <div className="w-1/2 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value), settings.currencySymbol)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* List */}
            <div className="w-1/2 space-y-2">
              {activeChartData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: CATEGORY_COLORS[item.name as Category] }} 
                    />
                    <span className="text-slate-600 truncate max-w-[80px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(item.value, settings.currencySymbol)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">No expenses to analyze yet.</div>
      )}
    </div>
  );
};
