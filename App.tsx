import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Settings as SettingsIcon, Heart, Lightbulb, Loader2 } from 'lucide-react';
import { BudgetSummary } from './components/BudgetSummary';
import { Stats } from './components/Stats';
import { ExpenseList } from './components/ExpenseList';
import { AddExpenseForm } from './components/AddExpenseForm';
import { SettingsModal } from './components/SettingsModal';
import { TipsModal } from './components/TipsModal';
import { Expense, BudgetSettings, Category, Payer } from './types';
import { DEFAULT_BUDGET, DEFAULT_CURRENCY } from './constants';
import { getCurrentMonthName } from './utils/format';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<BudgetSettings>({
    totalBudget: DEFAULT_BUDGET,
    currencySymbol: DEFAULT_CURRENCY,
    partnerName: 'Partner',
    userName: 'Me'
  });
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, visible: boolean}>({ message: '', visible: false });

  // Initial Data Fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [fetchedSettings, fetchedExpenses] = await Promise.all([
          apiService.getSettings(),
          apiService.getExpenses()
        ]);
        setSettings(fetchedSettings);
        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error("Failed to load data:", error);
        setShowToast({ message: "Could not connect to database", visible: true });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Derived State
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Handlers
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    // Optimistic Update
    setExpenses(prev => [newExpense, ...prev]);
    setIsAddModalOpen(false);

    try {
      await apiService.addExpense(newExpense);
      setShowToast({ 
        message: `Added ${settings.currencySymbol}${expenseData.amount}`, 
        visible: true 
      });
    } catch (error) {
      console.error(error);
      setShowToast({ message: "Failed to save to database", visible: true });
      // Rollback
      setExpenses(prev => prev.filter(e => e.id !== newExpense.id));
    }
    
    setTimeout(() => setShowToast({ message: '', visible: false }), 3000);
  };

  const updateExpense = async (updatedExpense: Expense) => {
    // Optimistic Update
    const previousExpenses = [...expenses];
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    setEditingExpense(null);
    setIsAddModalOpen(false);

    try {
      await apiService.updateExpense(updatedExpense);
      setShowToast({ 
        message: `Updated expense`, 
        visible: true 
      });
    } catch (error) {
      console.error(error);
      setShowToast({ message: "Failed to update database", visible: true });
      setExpenses(previousExpenses); // Rollback
    }

    setTimeout(() => setShowToast({ message: '', visible: false }), 3000);
  };

  const deleteExpense = async (id: string) => {
    const previousExpenses = [...expenses];
    setExpenses(prev => prev.filter(e => e.id !== id));

    try {
      await apiService.deleteExpense(id);
    } catch (error) {
      console.error(error);
      setShowToast({ message: "Failed to delete from database", visible: true });
      setExpenses(previousExpenses); // Rollback
    }
  };

  const handleSettingsSave = async (newSettings: BudgetSettings) => {
    setSettings(newSettings);
    try {
      await apiService.saveSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings", error);
      setShowToast({ message: "Failed to save settings", visible: true });
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingExpense(null);
  };

  const resetMonth = async () => {
    if (confirm("Are you sure? This will delete all expense history for this month from the database.")) {
      const previousExpenses = [...expenses];
      setExpenses([]);
      try {
        await apiService.resetExpenses();
        setShowToast({ message: "Month reset complete", visible: true });
      } catch (error) {
        setExpenses(previousExpenses);
        setShowToast({ message: "Failed to reset database", visible: true });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
          <p className="text-slate-500 font-medium">Loading Budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-30">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{getCurrentMonthName()}</h2>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Budget Tracker</h1>
              <Heart size={20} className="text-emerald-500 fill-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsTipsOpen(true)}
              className="p-2.5 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors text-amber-600"
              aria-label="Saving Tips"
            >
              <Lightbulb size={20} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
              aria-label="Settings"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 px-6 pb-24 overflow-y-auto no-scrollbar space-y-8">
          
          {/* Dashboard Section */}
          <section>
            <BudgetSummary totalSpent={totalSpent} settings={settings} />
            <Stats expenses={expenses} settings={settings} />
          </section>

          {/* History Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            </div>
            <ExpenseList 
              expenses={expenses} 
              onDelete={deleteExpense} 
              onEdit={handleEditClick}
              settings={settings}
            />
          </section>
        </main>

        {/* Floating Action Button (FAB) */}
        <div className="absolute bottom-6 left-0 right-0 px-6 z-40 flex justify-center pointer-events-none">
           <button
            onClick={() => {
              setEditingExpense(null);
              setIsAddModalOpen(true);
            }}
            className="pointer-events-auto bg-slate-900 text-white flex items-center gap-2 px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <div className="bg-emerald-500 rounded-full p-1 group-hover:rotate-90 transition-transform duration-300">
              <Plus size={20} className="text-white" strokeWidth={3} />
            </div>
            <span className="font-bold text-lg pr-1">Add Expense</span>
          </button>
        </div>

        {/* Toast Notification */}
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showToast.visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
           <div className="bg-slate-800 text-white px-4 py-3 rounded-full shadow-xl text-sm font-medium flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             {showToast.message}
           </div>
        </div>

        {/* Modals */}
        {isAddModalOpen && (
          <AddExpenseForm 
            onClose={handleModalClose}
            onAdd={addExpense}
            onEdit={updateExpense}
            initialData={editingExpense}
            currencySymbol={settings.currencySymbol}
            userName={settings.userName}
            partnerName={settings.partnerName}
          />
        )}

        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={handleSettingsSave}
          onReset={resetMonth}
        />

        <TipsModal
          isOpen={isTipsOpen}
          onClose={() => setIsTipsOpen(false)}
          expenses={expenses}
        />

      </div>
    </div>
  );
};

export default App;