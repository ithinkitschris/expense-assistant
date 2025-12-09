// Configuration File
// =================
// 
// This is the centralized configuration file for the ExpenseTracker app.
// All hardcoded values, constants, and settings should be defined here.
// 
// To find your local IP address, run this command in your terminal:
//   ifconfig | grep "inet " | grep -v 127.0.0.1

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_BASE_URL = 'http://192.168.1.167:8000/api/v1';

// 192.168.1.167
// 172.20.10.2
// 204.147.202.57 (old IP)

// Examples:
// If your IP is 192.168.1.100: export const API_BASE_URL = 'http://192.168.1.100:8000/api/v1';
// If your IP is 172.20.10.2:   export const API_BASE_URL = 'http://172.20.10.2:8000/api/v1';

// API Settings
export const API_CONFIG = {
  timeout: 30000,  // 30 seconds for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
};

// ============================================================================
// DEVELOPMENT FLAGS
// ============================================================================

export const DEV_FLAGS = {
  ENABLE_SCROLL_ANIMATIONS: true,
  ENABLE_DEBUG_LOGGING: true,
  ENABLE_HAPTIC_FEEDBACK: true,
};

// ============================================================================
// APP CONSTANTS
// ============================================================================

export const APP_CONSTANTS = {
  // Default values
  DEFAULT_AMOUNT: '0',
  DEFAULT_CATEGORY: 'personal',
  DEFAULT_VIEW_MODE: 'day', // 'day' or 'monthly'

  // Limits and ranges
  MAX_AMOUNT: 99999,
  MIN_AMOUNT: 0,
  MAX_EXPENSES_LIMIT: 200,

  // Date formats
  DATE_FORMAT: 'YYYY-MM-DD',

  // Animation durations
  SCROLL_ANIMATION_DURATION: 300,
  BUTTON_ANIMATION_DURATION: 150,
};

// ============================================================================
// PICKER OPTIONS
// ============================================================================

export const PICKER_OPTIONS = {
  // Dollar picker options (0 to 9999)
  dollarOptions: Array.from({ length: 10000 }, (_, i) => i)
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  // Amount validation
  amount: {
    min: APP_CONSTANTS.MIN_AMOUNT,
    max: APP_CONSTANTS.MAX_AMOUNT,
    errorMessage: `Please enter a value between $${APP_CONSTANTS.MIN_AMOUNT} and $${APP_CONSTANTS.MAX_AMOUNT.toLocaleString()}`
  },

  // Text input validation
  text: {
    maxLength: 100,
    minLength: 1,
    errorMessage: 'Please enter a valid description (1-100 characters)'
  }
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONSTANTS = {
  // Animation values
  animations: {
    addButtonScale: {
      normal: 1,
      pressed: 0.95
    },
    expenseTimeSelectorScale: {
      hidden: 0,
      visible: 1
    },
    viewSelector: {
      width: {
        normal: 0,
        compact: 0
      },
      padding: {
        normal: 5,
        compact: 3
      }
    }
  },
  
  // Scroll behavior
  scroll: {
    programmaticScrollTimeout: 100,
    categoryScrollOffset: 50
  },
  
  // Modal settings
  modal: {
    animationDuration: 300,
    backdropOpacity: 0.5
  }
};

// ============================================================================
// EXPENSE CATEGORIES
// ============================================================================

export const EXPENSE_CATEGORIES = [
  'amazon',
  'transportation', 
  'groceries',
  'personal',
  'fashion',
  'travel',
  'food',
  'monthly',
  'furniture'
];

// ============================================================================
// CATEGORY ICONS
// ============================================================================

export const CATEGORY_ICONS = {
  amazon: 'shippingbox.fill',
  transportation: 'tram.fill',
  groceries: 'cart.fill',
  personal: 'gamecontroller.fill',
  fashion: 'tshirt.fill',
  travel: 'airplane',
  food: 'fork.knife',
  monthly: 'calendar',
  furniture: 'bed.double.fill',
  default: 'chart.bar.fill'
};


// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  api: {
    connectionFailed: 'Failed to connect to server',
    addExpense: 'Failed to add expense',
    updateExpense: 'Failed to update expense',
    deleteExpense: 'Failed to delete expense',
    fetchExpenses: 'Failed to fetch expenses'
  },
  validation: {
    invalidAmount: VALIDATION_RULES.amount.errorMessage,
    invalidText: VALIDATION_RULES.text.errorMessage
  }
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  addExpense: 'Expense added successfully',
  updateExpense: 'Expense updated successfully',
  deleteExpense: 'Expense deleted successfully'
}; 