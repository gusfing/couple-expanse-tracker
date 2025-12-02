import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, Payer, CATEGORY_EMOJIS, Expense } from '../types';
import { CATEGORIES } from '../constants';
import { Button } from './ui/Button';

interface AddExpenseFormProps {
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  onEdit?: (expense: Expense) => void;
  initialData?: Expense | null;
  currencySymbol: string;
  userName: string;
  partnerName: string;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ 
  onClose, 
  onAdd, 
  onEdit,
  initialData,
  currencySymbol,
  userName,
  partnerName
}) => {
  // Initialize state with initialData if present, otherwise defaults
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [payer, setPayer] = useState<Payer>(initialData?.payer || 'Me');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.FOOD);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(initialData?.note || '');

  const isEditing = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    if (isEditing && initialData && onEdit) {
      onEdit({
        ...initialData,
        amount: parseFloat(amount),
        payer,
        category,
        date,
        note
      });
    } else {
      onAdd({
        amount: parseFloat(amount),
        payer,
        category,
        date,
        note
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-5 duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-3xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-300"
                autoFocus={!isEditing}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Payer Selection */}
          <div className="grid grid-cols-2 gap-3">
             {(['Me', 'Partner'] as Payer[]).map((p) => (
               <button
                key={p}
                type="button"
                onClick={() => setPayer(p)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  payer === p 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
               >
                 {p === 'Me' ? userName : partnerName} paid
               </button>
             ))}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    category === cat
                      ? 'border-primary bg-emerald-50 text-emerald-800'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <span className="text-xl mb-1">{CATEGORY_EMOJIS[cat]}</span>
                  <span className="text-[10px] font-medium">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Note (Optional)</label>
              <input 
                type="text" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Dinner"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <Button type="submit" fullWidth className="mt-4 text-lg">
            {isEditing ? 'Save Changes' : 'Add Expense'}
          </Button>
        </form>
      </div>
    </div>
  );
};