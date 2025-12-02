import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Save, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { BudgetSettings } from '../types';
import { Button } from './ui/Button';
import { apiService } from '../services/apiService';

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
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      checkDb();
    }
  }, [isOpen, settings]);

  const checkDb = async () => {
    setDbStatus('checking');
    try {
      // Simple check to see if we can fetch settings from the DB
      await apiService.getSettings();
      setDbStatus('connected');
    } catch (e) {
      setDbStatus('error');
    }
  };

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

          {/* Database Status Indicator */}
          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
             <div className="flex items-center gap-2">
                <Database size={16} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500">Database Status</span>
             </div>
             <div>
                {dbStatus === 'checking' && <span className="text-xs text-slate-400">Checking...</span>}
                {dbStatus === 'connected' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        <CheckCircle2 size={12} /> Connected
                    </span>
                )}
                {dbStatus === 'error' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                        <AlertCircle size={12} /> Offline
                    </span>
                )}
             </div>
          </div>

          <div className="pt-2 space-y-3">
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