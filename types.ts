export enum Category {
  FOOD = 'Food',
  TRAVEL = 'Travel',
  SHOPPING = 'Shopping',
  BILLS = 'Bills',
  FUN = 'Fun',
  OTHER = 'Other'
}

export type Payer = 'Me' | 'Partner';

export interface Expense {
  id: string;
  amount: number;
  payer: Payer;
  category: Category;
  date: string; // ISO Date string YYYY-MM-DD
  note?: string;
  timestamp: number; // For sorting
}

export interface BudgetSettings {
  totalBudget: number;
  currencySymbol: string;
  partnerName: string;
  userName: string;
}

export const CATEGORY_EMOJIS: Record<Category, string> = {
  [Category.FOOD]: '🍔',
  [Category.TRAVEL]: '🚌',
  [Category.SHOPPING]: '🛍️',
  [Category.BILLS]: '💡',
  [Category.FUN]: '🎉',
  [Category.OTHER]: '📦',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#f59e0b', // Amber
  [Category.TRAVEL]: '#3b82f6', // Blue
  [Category.SHOPPING]: '#8b5cf6', // Violet
  [Category.BILLS]: '#ef4444', // Red
  [Category.FUN]: '#ec4899', // Pink
  [Category.OTHER]: '#64748b', // Slate
};