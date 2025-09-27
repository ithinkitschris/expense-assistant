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

// 192.168.1.172
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
  DEFAULT_QUANTITY: '1',
  DEFAULT_UNIT: 'pieces',
  DEFAULT_CATEGORY: 'personal',
  DEFAULT_VIEW_MODE: 'day', // 'day' or 'monthly'
  DEFAULT_TAB: 'expenses', // 'expenses' or 'pantry'
  
  // Limits and ranges
  MAX_AMOUNT: 99999,
  MIN_AMOUNT: 0,
  MAX_QUANTITY: 1000,
  MIN_QUANTITY: 0.1,
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
  // Quantity picker options (0.1 to 100)
  quantityOptions: (() => {
    const options = [];
    for (let i = 0.1; i <= 10; i += 0.1) {
      options.push(parseFloat(i.toFixed(1)));
    }
    for (let i = 11; i <= 100; i += 1) {
      options.push(i);
    }
    return options;
  })(),
  
  // Dollar picker options (0 to 9999)
  dollarOptions: Array.from({ length: 10000 }, (_, i) => i),
  
  // Unit options for pantry items
  unitOptions: [
    'pieces',
    'lbs',
    'oz',
    'kg',
    'g',
    'liters',
    'ml',
    'gallons',
    'quarts',
    'pints',
    'cups',
    'tablespoons',
    'teaspoons',
    'bottles',
    'cans',
    'bags',
    'boxes',
    'packages'
  ],
  
  // Grocery type sort orders
  groceryTypeSortOrder: {
    'produce': 1,
    'meat': 2,
    'dairy': 3,
    'bread': 4,
    'staples': 5,
    'pantry': 6,
    'frozen': 7,
    'beverages': 8,
    'snacks': 9,
    'condiments': 10,
    'other': 11
  }
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
  
  // Quantity validation
  quantity: {
    min: APP_CONSTANTS.MIN_QUANTITY,
    max: APP_CONSTANTS.MAX_QUANTITY,
    errorMessage: `Please enter a value between ${APP_CONSTANTS.MIN_QUANTITY} and ${APP_CONSTANTS.MAX_QUANTITY}`
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
  'entertainment',
  'fashion',
  'travel',
  'food',
  'monthly',
  'furniture',
  'personal'
];

// ============================================================================
// CATEGORY ICONS
// ============================================================================

export const CATEGORY_ICONS = {
  amazon: 'shippingbox.fill',
  transportation: 'tram.fill',
  groceries: 'cart.fill',
  entertainment: 'gamecontroller.fill',
  fashion: 'tshirt.fill',
  travel: 'airplane',
  food: 'fork.knife',
  monthly: 'calendar',
  furniture: 'bed.double.fill',
  personal: 'person.fill',
  default: 'chart.bar.fill'
};

// ============================================================================
// GROCERY CATEGORIES
// ============================================================================

export const GROCERY_CATEGORIES = {
  produce: { displayName: 'Produce', icon: 'leaf' },
  meat: { displayName: 'Meat', icon: 'fish' },
  dairy: { displayName: 'Dairy', icon: 'drop' },
  bread: { displayName: 'Bread', icon: 'birthday.cake' },
  staples: { displayName: 'Staples', icon: 'grain' },
  pantry: { displayName: 'Pantry', icon: 'cabinet' },
  frozen: { displayName: 'Frozen', icon: 'snowflake' },
  beverages: { displayName: 'Beverages', icon: 'cup.and.saucer' },
  snacks: { displayName: 'Snacks', icon: 'candybarphone' },
  condiments: { displayName: 'Condiments', icon: 'drop' },
  other: { displayName: 'Other', icon: 'questionmark.circle' }
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
    fetchExpenses: 'Failed to fetch expenses',
    addPantryItem: 'Failed to add pantry item',
    updatePantryItem: 'Failed to update pantry item',
    deletePantryItem: 'Failed to delete pantry item',
    fetchPantryItems: 'Failed to fetch pantry items',
    parseGroceryItems: 'Failed to parse grocery items',
    getGroceryCategories: 'Failed to get grocery categories'
  },
  validation: {
    invalidAmount: VALIDATION_RULES.amount.errorMessage,
    invalidQuantity: VALIDATION_RULES.quantity.errorMessage,
    invalidText: VALIDATION_RULES.text.errorMessage
  }
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  addExpense: 'Expense added successfully',
  updateExpense: 'Expense updated successfully',
  deleteExpense: 'Expense deleted successfully',
  addPantryItem: 'Pantry item added successfully',
  updatePantryItem: 'Pantry item updated successfully',
  deletePantryItem: 'Pantry item deleted successfully'
}; 