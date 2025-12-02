import React from 'react';
import { Expense, CATEGORY_EMOJIS, BudgetSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { Trash2, Pencil } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  settings: BudgetSettings;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onEdit, settings }) => {
  
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">
          🍃
        </div>
        <p className="text-slate-500 font-medium">No expenses yet this month.</p>
        <p className="text-slate-400 text-sm mt-1">Enjoy the savings while they last!</p>
      </div>
    );
  }

  // Group by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6 pb-24">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
            {new Date(date).toDateString() === new Date().toDateString() ? 'Today' : formatDate(date)}
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {groupedExpenses[date].sort((a, b) => b.timestamp - a.timestamp).map((expense, index) => (
              <div 
                key={expense.id} 
                className={`p-4 flex items-center justify-between group ${
                  index !== groupedExpenses[date].length - 1 ? 'border-b border-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg border border-slate-100">
                    {CATEGORY_EMOJIS[expense.category]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{expense.category}</span>
                      {expense.payer === 'Partner' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wide">
                          {settings.partnerName}
                        </span>
                      )}
                    </div>
                    {expense.note && (
                      <p className="text-xs text-slate-400">{expense.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 mr-1">
                    {formatCurrency(expense.amount, settings.currencySymbol)}
                  </span>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(expense)}
                      className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      aria-label="Edit expense"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm('Are you sure you want to delete this expense?')) onDelete(expense.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};