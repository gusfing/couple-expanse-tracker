export const formatCurrency = (amount: number, symbol: string) => {
  return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export const getDaysRemainingInMonth = () => {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diffTime = Math.abs(endOfMonth.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays; 
};

export const getCurrentMonthName = () => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
};

// Safe ID generator that works in all environments (even non-secure contexts)
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};