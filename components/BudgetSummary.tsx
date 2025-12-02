import React from 'react';
import { BudgetSettings } from '../types';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/format';
import { Card } from './ui/Card';
import { AlertCircle, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface BudgetSummaryProps {
  totalSpent: number;
  settings: BudgetSettings;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ totalSpent, settings }) => {
  const remaining = settings.totalBudget - totalSpent;
  const percentageUsed = Math.min((totalSpent / settings.totalBudget) * 100, 100);
  const daysLeft = getDaysRemainingInMonth();
  const dailyAllowance = Math.max(remaining / (daysLeft || 1), 0);

  let statusColor = 'bg-primary'; // Green
  let textColor = 'text-emerald-700';
  let message = "You're doing great!";
  let icon = <CheckCircle size={16} className="text-emerald-600" />;
  let isOnTrack = true;

  if (percentageUsed > 100) {
    statusColor = 'bg-danger';
    textColor = 'text-red-700';
    message = "Over budget!";
    icon = <AlertCircle size={16} className="text-red-600" />;
    isOnTrack = false;
  } else if (percentageUsed > 85) {
    statusColor = 'bg-red-500';
    textColor = 'text-red-700';
    message = "Slow down a bit.";
    icon = <AlertCircle size={16} className="text-red-600" />;
    isOnTrack = false;
  } else if (percentageUsed > 65) {
    statusColor = 'bg-amber-400';
    textColor = 'text-amber-700';
    message = "Keep an eye on it.";
    isOnTrack = true; // Still considered roughly on track, just warning
  }

  return (
    <Card className="mb-6 relative overflow-hidden border-none shadow-lg">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        {/* Abstract shape */}
        <div className={`w-32 h-32 rounded-full blur-2xl ${statusColor}`} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-slate-500">Remaining</span>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-white/60 backdrop-blur-sm ${textColor}`}>
            {icon}
            {message}
          </div>
        </div>
        
        <h1 className={`text-4xl font-bold mb-4 tracking-tight ${remaining < 0 ? 'text-red-600' : 'text-slate-800'}`}>
          {formatCurrency(remaining, settings.currencySymbol)}
        </h1>

        <div className="flex justify-between text-xs text-slate-400 font-medium mb-2">
          <span>Spent: {formatCurrency(totalSpent, settings.currencySymbol)}</span>
          <span>Budget: {formatCurrency(settings.totalBudget, settings.currencySymbol)}</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-5 border border-slate-100">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${statusColor}`} 
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {remaining > 0 && (
          <div className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${isOnTrack ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${isOnTrack ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                {isOnTrack ? <Sparkles size={14} /> : <TrendingUp size={14} />}
            </div>
            <div>
                 <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isOnTrack ? 'text-emerald-600' : 'text-slate-500'}`}>
                    Daily Allowance
                 </p>
                 <p className="text-sm text-slate-700 font-medium leading-tight">
                    {isOnTrack ? "You're on track! " : "To stay safe, "} 
                    Limit spending to <strong className="text-slate-900">{formatCurrency(dailyAllowance, settings.currencySymbol)}</strong>/day.
                 </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};