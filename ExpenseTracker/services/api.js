import axios from 'axios';

// Your FastAPI server URL - replace with your computer's IP address
// Run this command to find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1
const API_BASE_URL = 'http://192.168.1.172:8000/api/v1';  // Replace XXX with your actual IP

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,  // Increased to 30 seconds for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const expenseAPI = {
  
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
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to add expense');
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
  getExpenses: async (limit = 50) => {
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

  // Parse grocery items from an expense
  parseGroceryItems: async (expenseId) => {
    try {
      console.log('🛒 Parsing grocery items for expense:', expenseId);
      console.log('📡 API URL:', `${API_BASE_URL}/expenses/${expenseId}/parse-grocery-items`);
      const response = await api.post(`/expenses/${expenseId}/parse-grocery-items`);
      console.log('✅ Parse Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Parse Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to parse grocery items');
    }
  },

  // Get grocery items for a specific expense
  getGroceryItemsForExpense: async (expenseId) => {
    try {
      console.log('🛒 Getting grocery items for expense:', expenseId);
      const response = await api.get(`/expenses/${expenseId}/grocery-items`);
      console.log('✅ Items Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Get Items Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to get grocery items');
    }
  },

  // Get all grocery items
  getAllGroceryItems: async () => {
    try {
      console.log('🛒 Getting all grocery items');
      const response = await api.get('/grocery-items');
      console.log('✅ All Items Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Get All Items Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to get all grocery items');
    }
  },

  // Parse grocery items from description (for grocery flow)
  parseGroceryItemsFromDescription: async (description) => {
    try {
      console.log('🔍 Parsing grocery items from description:', description);
      console.log('📡 API URL:', `${API_BASE_URL}/parse-grocery-items`);
      const response = await api.post('/parse-grocery-items', { description });
      console.log('✅ Parse Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Parse Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to parse grocery items');
    }
  },

  // Add grocery item directly to pantry
  addGroceryItemDirectly: async (itemName) => {
    try {
      console.log('🛒 Adding grocery item directly:', itemName);
      console.log('📡 API URL:', `${API_BASE_URL}/grocery-items/add`);
      const response = await api.post('/grocery-items/add', { name: itemName });
      console.log('✅ Add Item Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Add Item Error:', error);
      console.log('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to add grocery item');
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