import React from 'react';
import { X, Lightbulb, TrendingUp, PiggyBank } from 'lucide-react';
import { Expense, Category } from '../types';
import { Button } from './ui/Button';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose, expenses }) => {
  if (!isOpen) return null;

  // Calculate highest spending category
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<Category, number>);

  const sortedCategories = (Object.entries(categoryTotals) as [Category, number][])
    .sort((a, b) => b[1] - a[1]);
  
  const highestCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : null;

  const getSmartTip = (cat: Category | null) => {
    switch(cat) {
      case Category.FOOD:
        return "Food is your highest expense. Try meal prepping on Sundays or setting a 'eat out' limit of once a week!";
      case Category.TRAVEL:
        return "Travel costs are adding up. Look for transit passes or carpooling options to save on daily commutes.";
      case Category.SHOPPING:
        return "Shopping is taking a chunk of your budget. Try the '24-hour rule' - wait a day before buying non-essentials.";
      case Category.BILLS:
        return "Bills are high. Check for subscriptions you don't use anymore and cancel them.";
      case Category.FUN:
        return "You're having lots of fun! Try looking for free local events or movie nights at home to keep costs down.";
      default:
        return "Tracking every expense is the first step to saving. You're doing great!";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -mr-10 -mt-10 opacity-50 z-0"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <Lightbulb size={20} className="text-amber-600 fill-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Smart Tips</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Smart Insight */}
            {highestCategory && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <h3 className="font-bold text-amber-800 text-sm mb-1 flex items-center gap-2">
                  <TrendingUp size={16} /> Insight
                </h3>
                <p className="text-amber-900 text-sm leading-relaxed">
                  {getSmartTip(highestCategory)}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm mt-4">General Advice</h3>
              
              <div className="flex gap-3 items-start">
                <div className="bg-emerald-100 p-1.5 rounded-lg mt-0.5">
                   <PiggyBank size={16} className="text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm">The 50/30/20 Rule</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Try to spend 50% on needs, 30% on wants, and save 20% of your income.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="bg-blue-100 p-1.5 rounded-lg mt-0.5">
                   <TrendingUp size={16} className="text-blue-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm">Review Weekly</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Check this app every Sunday together to see how much budget is left for the rest of the month.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={onClose} className="mt-4 bg-slate-800 hover:bg-slate-900 shadow-none">
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};