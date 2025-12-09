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
      console.log('📡 API URL:', `${API_BASE_URL}/expenses`);
      await api.get('/expenses/');
      console.log('✅ API connection successful');
      return true;
    } catch (error) {
      console.log('❌ API connection failed:', error.message);
      return false;
    }
  },
  
  // Add expense using structured data (form input)
  addExpense: async (amount, category, description) => {
    try {
      console.log('🚀 Sending expense to API:', { amount, category, description });
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
  }
};