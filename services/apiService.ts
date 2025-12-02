import { Expense, BudgetSettings } from '../types';
import { DEFAULT_BUDGET, DEFAULT_CURRENCY } from '../constants';

const API_BASE_URL = '/api'; 

// Using unique endpoint names to avoid file conflicts
const ENDPOINTS = {
  EXPENSES: '/journal',
  SETTINGS: '/preferences',
  RESET: '/journal?reset=true'
};

const LS_KEYS = {
  SETTINGS: 'budget_settings',
  EXPENSES: 'budget_expenses'
};

// Helper to attempt fetch, returning null if network fails or response is not JSON
const tryFetch = async <T>(url: string, options?: RequestInit): Promise<T | null> => {
  try {
    const res = await fetch(url, options);
    // If 404/500, return null to trigger fallback
    if (!res.ok) return null;
    
    const text = await res.text();
    // If empty response, return null to trigger fallback
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      // If response is not valid JSON
      return null;
    }
  } catch (e) {
    // Network error
    return null;
  }
};

export const apiService = {
  async getSettings(): Promise<BudgetSettings> {
    const data = await tryFetch<BudgetSettings>(`${API_BASE_URL}${ENDPOINTS.SETTINGS}`);
    
    if (data) return data;

    // Fallback: Read from LocalStorage
    console.warn('API unavailable, falling back to LocalStorage for Settings');
    const local = localStorage.getItem(LS_KEYS.SETTINGS);
    if (local) return JSON.parse(local);
    
    // Default values if nothing in storage
    return {
      totalBudget: DEFAULT_BUDGET,
      currencySymbol: DEFAULT_CURRENCY,
      partnerName: 'Partner',
      userName: 'Me'
    };
  },

  async saveSettings(settings: BudgetSettings): Promise<void> {
    // Try to save to server
    await tryFetch(`${API_BASE_URL}${ENDPOINTS.SETTINGS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    // Always save to local storage as backup/cache
    localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getExpenses(): Promise<Expense[]> {
    const data = await tryFetch<Expense[]>(`${API_BASE_URL}${ENDPOINTS.EXPENSES}`);
    
    if (data) return data;

    // Fallback: Read from LocalStorage
    console.warn('API unavailable, falling back to LocalStorage for Expenses');
    const local = localStorage.getItem(LS_KEYS.EXPENSES);
    return local ? JSON.parse(local) : [];
  },

  async addExpense(expense: Expense): Promise<void> {
    const success = await tryFetch(`${API_BASE_URL}${ENDPOINTS.EXPENSES}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });

    if (!success) {
      const expenses = this._getLocalExpenses();
      expenses.unshift(expense);
      this._saveLocalExpenses(expenses);
    }
  },

  async updateExpense(expense: Expense): Promise<void> {
    const success = await tryFetch(`${API_BASE_URL}${ENDPOINTS.EXPENSES}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });

    if (!success) {
      const expenses = this._getLocalExpenses();
      const index = expenses.findIndex(e => e.id === expense.id);
      if (index !== -1) {
        expenses[index] = expense;
        this._saveLocalExpenses(expenses);
      }
    }
  },

  async deleteExpense(id: string): Promise<void> {
    const success = await tryFetch(`${API_BASE_URL}${ENDPOINTS.EXPENSES}?id=${id}`, {
      method: 'DELETE',
    });

    if (!success) {
      const expenses = this._getLocalExpenses();
      const newExpenses = expenses.filter(e => e.id !== id);
      this._saveLocalExpenses(newExpenses);
    }
  },

  async resetExpenses(): Promise<void> {
    const success = await tryFetch(`${API_BASE_URL}${ENDPOINTS.RESET}`, {
      method: 'DELETE',
    });

    if (!success) {
      this._saveLocalExpenses([]);
    }
  },

  // Internal Helpers for Local Storage Fallback
  _getLocalExpenses(): Expense[] {
    const local = localStorage.getItem(LS_KEYS.EXPENSES);
    return local ? JSON.parse(local) : [];
  },

  _saveLocalExpenses(expenses: Expense[]) {
    localStorage.setItem(LS_KEYS.EXPENSES, JSON.stringify(expenses));
  }
};
