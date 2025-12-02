import React, { useState } from 'react';
import { X, RefreshCw, Save } from 'lucide-react';
import { BudgetSettings } from '../types';
import { Button } from './ui/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BudgetSettings;
  onSave: (settings: BudgetSettings) => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, settings, onSave, onReset 
}) => {
  const [formData, setFormData] = useState(settings);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Settings</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
              <input 
                type="text"
                value={formData.userName}
                onChange={e => setFormData({...formData, userName: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Partner's Name</label>
              <input 
                type="text"
                value={formData.partnerName}
                onChange={e => setFormData({...formData, partnerName: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Monthly Budget</label>
            <input 
              type="number"
              value={formData.totalBudget}
              onChange={e => setFormData({...formData, totalBudget: parseFloat(e.target.value) || 0})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Currency Symbol</label>
            <input 
              type="text"
              value={formData.currencySymbol}
              onChange={e => setFormData({...formData, currencySymbol: e.target.value})}
              maxLength={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="pt-4 space-y-3">
             <Button 
                variant="primary" 
                fullWidth 
                onClick={() => {
                  onSave(formData);
                  onClose();
                }}
                className="gap-2"
              >
               <Save size={18} /> Save Changes
             </Button>

             <Button 
                variant="danger" 
                fullWidth 
                onClick={() => {
                  onReset();
                  onClose();
                }}
                className="gap-2 bg-red-50 text-red-600 hover:bg-red-100"
              >
               <RefreshCw size={18} /> Reset Month Data
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};