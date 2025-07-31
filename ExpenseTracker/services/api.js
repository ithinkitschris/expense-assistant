import axios from 'axios';
import { API_BASE_URL, API_CONFIG, APP_CONSTANTS } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  ...API_CONFIG,
});

// API service functions
export const expenseAPI = {
  
  // Test API connectivity
  testConnection: async () => {
    try {
      console.log('🔍 Testing API connection...');
      console.log('📡 API URL:', `${API_BASE_URL}/pantry-items`);
      const response = await api.get('/pantry-items');
      console.log('✅ API connection successful');
      return true;
    } catch (error) {
      console.log('❌ API connection failed:', error.message);
      return false;
    }
  },
  
  // Add expense using structured data (form input)
  addExpenseStructured: async (amount, category, description) => {
    try {
      console.log('🚀 Sending structured expense to API:', { amount, category, description });
      console.log('📡 API URL:', `${API_BASE_URL}/expenses/`);
      const response = await api.post('/expenses/', {
        amount: parseFloat(amount),
        category: category,
        description: description
      });
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ API Error:', error);
      console.log('❌ Error type:', typeof error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error response:', error.response?.data);
      console.log('❌ Error response type:', typeof error.response?.data);
      console.log('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Handle different error response formats
      let errorMessage = 'Failed to add expense';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('📤 Throwing error message:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Add expense using AI parsing (natural language)
  addExpenseWithAI: async (text) => {
    try {
      console.log('🚀 Sending expense to API:', text);
      console.log('📡 API URL:', `${API_BASE_URL}/expenses/parse`);
      const response = await api.post('/expenses/parse', { text });
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ API Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to add expense');
    }
  },

  // Get list of expenses
  getExpenses: async (limit = APP_CONSTANTS.MAX_EXPENSES_LIMIT) => {
    try {
      const response = await api.get(`/expenses/?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch expenses');
    }
  },

  // Get quick summary
  getQuickSummary: async () => {
    try {
      const response = await api.get('/summary/quick');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get summary');
    }
  },

  // Update an existing expense
  updateExpense: async (expenseId, updateData) => {
    try {
      console.log('🔄 Updating expense:', expenseId, updateData);
      console.log('📡 API URL:', `${API_BASE_URL}/expenses/${expenseId}`);
      const response = await api.put(`/expenses/${expenseId}`, updateData);
      console.log('✅ Update Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Update Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to update expense');
    }
  },

  // Delete an expense
  deleteExpense: async (expenseId) => {
    try {
      console.log('🗑️ Deleting expense:', expenseId);
      console.log('📡 API URL:', `${API_BASE_URL}/expenses/${expenseId}`);
      const response = await api.delete(`/expenses/${expenseId}`);
      console.log('✅ Delete Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Delete Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to delete expense');
    }
  },

  // NEW PANTRY ENDPOINTS (replacing old grocery endpoints)

  // Get all pantry items
  getAllPantryItems: async () => {
    try {
      console.log('🛒 Getting all pantry items');
      const response = await api.get('/pantry-items');
      console.log('✅ All Pantry Items Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Get All Pantry Items Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to get all pantry items');
    }
  },

  // Add pantry item directly
  addPantryItemDirectly: async (itemName, quantity = 1, unit = 'pieces') => {
    try {
      console.log('🛒 Adding pantry item directly:', itemName, quantity, unit);
      console.log('📡 API URL:', `${API_BASE_URL}/pantry-items/add`);
      const response = await api.post('/pantry-items/add', { 
        name: itemName, 
        quantity: quantity, 
        unit: unit 
      });
      console.log('✅ Add Pantry Item Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Add Pantry Item Error:', error);
      console.log('❌ Error type:', typeof error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error response:', error.response?.data);
      console.log('❌ Error response type:', typeof error.response?.data);
      console.log('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Handle different error response formats
      let errorMessage = 'Failed to add pantry item';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('📤 Throwing error message:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Update pantry item
  updatePantryItem: async (itemId, itemName, quantity = 1, unit = 'pieces', isConsumed = false, groceryType = 'other') => {
    try {
      console.log('✏️ Updating pantry item:', itemId, itemName, quantity, unit, isConsumed, groceryType);
      console.log('📡 API URL:', `${API_BASE_URL}/pantry-items/${itemId}`);
      const response = await api.put(`/pantry-items/${itemId}`, { 
        name: itemName, 
        quantity: quantity, 
        unit: unit,
        is_consumed: isConsumed,
        grocery_type: groceryType
      });
      console.log('✅ Update Pantry Item Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Update Pantry Item Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to update pantry item');
    }
  },

  // Delete pantry item
  deletePantryItem: async (itemId) => {
    try {
      console.log('🗑️ Deleting pantry item:', itemId);
      console.log('📡 API URL:', `${API_BASE_URL}/pantry-items/${itemId}`);
      const response = await api.delete(`/pantry-items/${itemId}`);
      console.log('✅ Delete Pantry Item Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Delete Pantry Item Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to delete pantry item');
    }
  },

  // Parse grocery items from description (for grocery flow)
  parseGroceryItemsFromDescription: async (description) => {
    try {
      console.log('🔍 Parsing grocery items from description:', description);
      console.log('📡 API URL:', `${API_BASE_URL}/parse-grocery-items`);
      console.log('📡 Full URL:', `${API_BASE_URL}/parse-grocery-items`);
      console.log('📤 Request payload:', { description });
      
      const response = await api.post('/parse-grocery-items', { description });
      console.log('✅ Parse Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Parse Error:', error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error response:', error.response?.data);
      console.log('❌ Error status:', error.response?.status);
      console.log('❌ Error statusText:', error.response?.statusText);
      throw new Error(error.response?.data?.detail || 'Failed to parse grocery items');
    }
  },

  // Parse grocery expense and add to pantry
  parseGroceryToPantry: async (expenseId) => {
    try {
      console.log('🛒 Parsing grocery expense to pantry:', expenseId);
      console.log('📡 API URL:', `${API_BASE_URL}/expenses/${expenseId}/parse-grocery-to-pantry`);
      const response = await api.post(`/expenses/${expenseId}/parse-grocery-to-pantry`);
      console.log('✅ Parse to Pantry Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Parse to Pantry Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to parse grocery to pantry');
    }
  },

  // Get grocery categories
  getGroceryCategories: async () => {
    try {
      const response = await api.get('/grocery-categories');
      return response.data;
    } catch (error) {
      console.log('❌ Get Grocery Categories Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to get grocery categories');
    }
  }
};