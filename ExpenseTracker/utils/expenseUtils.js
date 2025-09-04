/**
 * Expense Data Processing Utility Functions
 * 
 * Centralized expense calculation and data transformation utilities
 * to eliminate duplicate code across components and improve maintainability.
 */

/**
 * Calculate total amount from array of expenses
 * @param {Array} expenses - Array of expense objects with amount property
 * @returns {number} Total amount
 */
export function calculateTotalAmount(expenses) {
  if (!expenses || !Array.isArray(expenses)) return 0;
  return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
}

/**
 * Calculate total amount for a specific category
 * @param {Array} expenses - Array of expense objects
 * @param {string} category - Category to filter by
 * @returns {number} Total amount for category
 */
export function calculateCategoryTotal(expenses, category) {
  if (!expenses || !Array.isArray(expenses)) return 0;
  const categoryExpenses = expenses.filter(expense => expense.category === category);
  return calculateTotalAmount(categoryExpenses);
}

/**
 * Calculate totals by category
 * @param {Array} expenses - Array of expense objects
 * @returns {object} Object with category totals
 */
export function calculateCategoryTotals(expenses) {
  if (!expenses || !Array.isArray(expenses)) return {};
  
  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    acc[category] = (acc[category] || 0) + (expense.amount || 0);
    return acc;
  }, {});
}

/**
 * Get top categories by amount
 * @param {Array} expenses - Array of expense objects
 * @param {number} limit - Number of top categories to return (default: 3)
 * @returns {Array} Array of {category, amount} objects sorted by amount
 */
export function getTopCategories(expenses, limit = 3) {
  const categoryTotals = calculateCategoryTotals(expenses);
  
  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Get local date string in YYYY-MM-DD format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getLocalDateString(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Group expenses by day
 * @param {Array} expenses - Array of expense objects
 * @returns {object} Object with date keys and expense arrays as values
 */
export function groupExpensesByDay(expenses) {
  if (!expenses || !Array.isArray(expenses)) return {};
  
  return expenses.reduce((acc, expense) => {
    const dateKey = getLocalDateString(expense.timestamp);
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(expense);
    return acc;
  }, {});
}

/**
 * Group expenses by month
 * @param {Array} expenses - Array of expense objects
 * @returns {object} Object with month keys (YYYY-MM format) and expense arrays as values
 */
export function groupExpensesByMonth(expenses) {
  if (!expenses || !Array.isArray(expenses)) return {};
  
  return expenses.reduce((acc, expense) => {
    const date = new Date(expense.timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(expense);
    return acc;
  }, {});
}

/**
 * Group expenses by category
 * @param {Array} expenses - Array of expense objects
 * @returns {object} Object with category keys and expense arrays as values
 */
export function groupExpensesByCategory(expenses) {
  if (!expenses || !Array.isArray(expenses)) return {};
  
  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expense);
    return acc;
  }, {});
}

/**
 * Filter expenses by category
 * @param {Array} expenses - Array of expense objects
 * @param {string} category - Category to filter by ('All' returns all expenses)
 * @returns {Array} Filtered array of expenses
 */
export function filterExpensesByCategory(expenses, category) {
  if (!expenses || !Array.isArray(expenses)) return [];
  if (category === 'All') return expenses;
  
  return expenses.filter(expense => expense.category === category);
}

/**
 * Filter expenses by date range
 * @param {Array} expenses - Array of expense objects
 * @param {Date} startDate - Start date (inclusive)
 * @param {Date} endDate - End date (inclusive)
 * @returns {Array} Filtered array of expenses
 */
export function filterExpensesByDateRange(expenses, startDate, endDate) {
  if (!expenses || !Array.isArray(expenses)) return [];
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.timestamp);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

/**
 * Get expenses for a specific day
 * @param {Array} expenses - Array of expense objects
 * @param {string|Date} date - Date to filter by (YYYY-MM-DD format or Date object)
 * @returns {Array} Array of expenses for the specified day
 */
export function getExpensesForDay(expenses, date) {
  if (!expenses || !Array.isArray(expenses)) return [];
  
  const targetDate = typeof date === 'string' ? date : getLocalDateString(date);
  
  return expenses.filter(expense => {
    const expenseDate = getLocalDateString(expense.timestamp);
    return expenseDate === targetDate;
  });
}

/**
 * Calculate expense count for a specific day
 * @param {Array} expenses - Array of expense objects
 * @param {string|Date} date - Date to count expenses for
 * @returns {number} Number of expenses for the day
 */
export function getExpenseCountForDay(expenses, date) {
  return getExpensesForDay(expenses, date).length;
}

/**
 * Sort expenses by date (newest first)
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Sorted array of expenses
 */
export function sortExpensesByDate(expenses) {
  if (!expenses || !Array.isArray(expenses)) return [];
  
  return [...expenses].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
}

/**
 * Sort expenses by amount (highest first)
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Sorted array of expenses
 */
export function sortExpensesByAmount(expenses) {
  if (!expenses || !Array.isArray(expenses)) return [];
  
  return [...expenses].sort((a, b) => {
    return (b.amount || 0) - (a.amount || 0);
  });
}

/**
 * Get unique categories from expenses
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Array of unique category names
 */
export function getUniqueCategories(expenses) {
  if (!expenses || !Array.isArray(expenses)) return [];
  
  const categories = expenses.map(expense => expense.category || 'other');
  return [...new Set(categories)].sort();
}

/**
 * Calculate average expense amount
 * @param {Array} expenses - Array of expense objects
 * @returns {number} Average expense amount
 */
export function calculateAverageExpense(expenses) {
  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) return 0;
  
  const total = calculateTotalAmount(expenses);
  return total / expenses.length;
}

/**
 * Get expense statistics
 * @param {Array} expenses - Array of expense objects
 * @returns {object} Object with various expense statistics
 */
export function getExpenseStatistics(expenses) {
  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
    return {
      total: 0,
      average: 0,
      count: 0,
      min: 0,
      max: 0,
      categories: 0
    };
  }
  
  const amounts = expenses.map(expense => expense.amount || 0).filter(amount => amount > 0);
  const categories = getUniqueCategories(expenses);
  
  return {
    total: calculateTotalAmount(expenses),
    average: calculateAverageExpense(expenses),
    count: expenses.length,
    min: Math.min(...amounts),
    max: Math.max(...amounts),
    categories: categories.length
  };
}

/**
 * Format expense amount for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount string
 */
export function formatExpenseAmount(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0';
  
  // Remove trailing zeros for whole numbers
  const formatted = num.toFixed(2);
  const cleanFormatted = formatted.replace(/\.00$/, '');
  
  return `$${cleanFormatted}`;
} 