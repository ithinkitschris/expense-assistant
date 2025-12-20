import * as SQLite from 'expo-sqlite';
import { APP_CONSTANTS } from '../config';

// Open database connection
const db = SQLite.openDatabaseSync('expenses.db');

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create expenses table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Create pantry_items table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pantry_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity REAL DEFAULT 1,
        unit TEXT DEFAULT 'pieces',
        created_at TEXT DEFAULT (datetime('now')),
        is_consumed INTEGER DEFAULT 0,
        grocery_type TEXT DEFAULT 'other'
      );
    `);
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Initialize on module load (fire and forget)
initializeDatabase().catch(err => console.error('Database init error:', err));

// Helper function to convert SQLite row to expense object
const rowToExpense = (row) => {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category,
    description: row.description,
    timestamp: row.timestamp
  };
};

// Helper function to convert SQLite row to pantry item object
const rowToPantryItem = (row) => {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    created_at: row.created_at,
    is_consumed: row.is_consumed === 1, // Convert integer to boolean
    grocery_type: row.grocery_type
  };
};

// API service functions (mirroring services/api.js structure)
export const expenseAPI = {
  
  // Test connection (always returns true for local database)
  testConnection: async () => {
    try {
      console.log('🔍 Testing local database connection...');
      // Simple query to test connection
      await db.getFirstAsync('SELECT 1 as test');
      console.log('✅ Local database connection successful');
      return true;
    } catch (error) {
      console.log('❌ Local database connection failed:', error.message);
      return false;
    }
  },
  
  // Add expense using structured data (form input)
  addExpenseStructured: async (amount, category, description) => {
    try {
      console.log('🚀 Adding structured expense to local database:', { amount, category, description });
      
      const timestamp = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO expenses (amount, category, description, timestamp) 
         VALUES (?, ?, ?, ?)`,
        [parseFloat(amount), category, description, timestamp]
      );
      
      // Fetch the inserted expense
      const expenseRow = await db.getFirstAsync(
        'SELECT id, amount, category, description, timestamp FROM expenses WHERE id = ?',
        [result.lastInsertRowId]
      );
      
      const expense = rowToExpense(expenseRow);
      console.log('✅ Expense added to local database:', expense);
      return expense;
    } catch (error) {
      console.log('❌ Error adding expense:', error);
      throw new Error(`Failed to add expense: ${error.message}`);
    }
  },

  // Add expense using AI parsing (not available in local mode)
  addExpenseWithAI: async (text) => {
    // AI parsing not available in local-only mode
    throw new Error('AI parsing is not available. Please use structured input.');
  },

  // Get list of expenses
  getExpenses: async (limit = APP_CONSTANTS.MAX_EXPENSES_LIMIT) => {
    try {
      const rows = await db.getAllAsync(
        `SELECT id, amount, category, description, timestamp 
         FROM expenses 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [limit]
      );
      
      const expenses = rows.map(rowToExpense);
      
      // Calculate total amount
      const totalResult = await db.getFirstAsync('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
      const totalAmount = totalResult?.total || 0;
      
      return {
        expenses: expenses,
        total_amount: totalAmount,
        count: expenses.length
      };
    } catch (error) {
      console.log('❌ Error fetching expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }
  },

  // Get quick summary
  getQuickSummary: async () => {
    try {
      // Get total expenses count
      const countResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM expenses');
      const count = countResult?.count || 0;
      
      // Get total amount
      const totalResult = await db.getFirstAsync('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
      const totalAmount = totalResult?.total || 0;
      
      // Get expenses by category
      const categoryRows = await db.getAllAsync(
        `SELECT category, SUM(amount) as total 
         FROM expenses 
         GROUP BY category 
         ORDER BY total DESC`
      );
      
      const byCategory = {};
      categoryRows.forEach(row => {
        byCategory[row.category] = row.total;
      });
      
      return {
        total_expenses: count,
        total_amount: totalAmount,
        by_category: byCategory
      };
    } catch (error) {
      console.log('❌ Error getting summary:', error);
      throw new Error(`Failed to get summary: ${error.message}`);
    }
  },

  // Update an existing expense
  updateExpense: async (expenseId, updateData) => {
    try {
      console.log('🔄 Updating expense in local database:', expenseId, updateData);
      
      const updates = [];
      const values = [];
      
      if (updateData.amount !== undefined) {
        updates.push('amount = ?');
        values.push(parseFloat(updateData.amount));
      }
      if (updateData.category !== undefined) {
        updates.push('category = ?');
        values.push(updateData.category);
      }
      if (updateData.description !== undefined) {
        updates.push('description = ?');
        values.push(updateData.description);
      }
      if (updateData.timestamp !== undefined) {
        updates.push('timestamp = ?');
        values.push(updateData.timestamp);
      }
      
      if (updates.length === 0) {
        throw new Error('No fields to update');
      }
      
      values.push(expenseId);
      
      await db.runAsync(
        `UPDATE expenses 
         SET ${updates.join(', ')} 
         WHERE id = ?`,
        ...values
      );
      
      // Fetch updated expense
      const updatedRow = await db.getFirstAsync(
        'SELECT id, amount, category, description, timestamp FROM expenses WHERE id = ?',
        [expenseId]
      );
      
      if (!updatedRow) {
        throw new Error('Expense not found after update');
      }
      
      const expense = rowToExpense(updatedRow);
      console.log('✅ Expense updated in local database:', expense);
      return expense;
    } catch (error) {
      console.log('❌ Error updating expense:', error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  },

  // Delete an expense
  deleteExpense: async (expenseId) => {
    try {
      console.log('🗑️ Deleting expense from local database:', expenseId);
      
      await db.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
      
      console.log('✅ Expense deleted from local database');
      return { success: true, message: 'Expense deleted successfully' };
    } catch (error) {
      console.log('❌ Error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  },

  // Get all pantry items
  getAllPantryItems: async () => {
    try {
      console.log('🛒 Getting all pantry items from local database');
      
      const rows = await db.getAllAsync(
        `SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type 
         FROM pantry_items 
         ORDER BY created_at DESC`
      );
      
      const items = rows.map(rowToPantryItem);
      console.log('✅ Retrieved pantry items from local database:', items.length);
      return items;
    } catch (error) {
      console.log('❌ Error getting pantry items:', error);
      throw new Error(`Failed to get all pantry items: ${error.message}`);
    }
  },

  // Add pantry item directly
  addPantryItemDirectly: async (itemName, quantity = 1, unit = 'pieces') => {
    try {
      console.log('🛒 Adding pantry item to local database:', itemName, quantity, unit);
      
      const created_at = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO pantry_items (name, quantity, unit, created_at) 
         VALUES (?, ?, ?, ?)`,
        [itemName, quantity, unit, created_at]
      );
      
      // Fetch the inserted item
      const itemRow = await db.getFirstAsync(
        'SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items WHERE id = ?',
        [result.lastInsertRowId]
      );
      
      const item = rowToPantryItem(itemRow);
      console.log('✅ Pantry item added to local database:', item);
      return item;
    } catch (error) {
      console.log('❌ Error adding pantry item:', error);
      throw new Error(`Failed to add pantry item: ${error.message}`);
    }
  },

  // Update pantry item
  updatePantryItem: async (itemId, itemName, quantity = 1, unit = 'pieces', isConsumed = false, groceryType = 'other') => {
    try {
      console.log('✏️ Updating pantry item in local database:', itemId, itemName, quantity, unit, isConsumed, groceryType);
      
      await db.runAsync(
        `UPDATE pantry_items 
         SET name = ?, quantity = ?, unit = ?, is_consumed = ?, grocery_type = ? 
         WHERE id = ?`,
        [itemName, quantity, unit, isConsumed ? 1 : 0, groceryType, itemId]
      );
      
      // Fetch updated item
      const updatedRow = await db.getFirstAsync(
        'SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items WHERE id = ?',
        [itemId]
      );
      
      if (!updatedRow) {
        throw new Error('Pantry item not found after update');
      }
      
      const item = rowToPantryItem(updatedRow);
      console.log('✅ Pantry item updated in local database:', item);
      return item;
    } catch (error) {
      console.log('❌ Error updating pantry item:', error);
      throw new Error(`Failed to update pantry item: ${error.message}`);
    }
  },

  // Delete pantry item
  deletePantryItem: async (itemId) => {
    try {
      console.log('🗑️ Deleting pantry item from local database:', itemId);
      
      await db.runAsync('DELETE FROM pantry_items WHERE id = ?', [itemId]);
      
      console.log('✅ Pantry item deleted from local database');
      return { success: true, message: 'Pantry item deleted successfully' };
    } catch (error) {
      console.log('❌ Error deleting pantry item:', error);
      throw new Error(`Failed to delete pantry item: ${error.message}`);
    }
  },

  // Parse grocery items from description (not available in local mode)
  parseGroceryItemsFromDescription: async (description) => {
    // AI parsing not available in local-only mode
    throw new Error('AI parsing is not available. Please enter items manually.');
  },

  // Parse grocery expense and add to pantry (not available in local mode)
  parseGroceryToPantry: async (expenseId) => {
    // AI parsing not available in local-only mode
    throw new Error('AI parsing is not available. Please add pantry items manually.');
  },

  // Get grocery categories (return static list)
  getGroceryCategories: async () => {
    // Return static list of categories since we don't have AI parsing
    return [
      'produce',
      'dairy',
      'meat',
      'bakery',
      'frozen',
      'beverages',
      'snacks',
      'pantry',
      'other'
    ];
  },

  // Import data from JSON file (for initial data migration)
  importFromJSON: async (jsonData) => {
    try {
      console.log('📥 Starting data import...');
      let importedExpenses = 0;
      let importedPantryItems = 0;
      let skippedExpenses = 0;
      let skippedPantryItems = 0;

      // Import expenses
      if (jsonData.expenses && Array.isArray(jsonData.expenses)) {
        console.log(`📊 Importing ${jsonData.expenses.length} expenses...`);
        
        for (const expense of jsonData.expenses) {
          try {
            // Check if expense already exists (by timestamp and amount)
            const existing = await db.getFirstAsync(
              'SELECT id FROM expenses WHERE timestamp = ? AND amount = ? AND description = ?',
              [expense.timestamp, expense.amount, expense.description]
            );
            
            if (!existing) {
              await db.runAsync(
                'INSERT INTO expenses (amount, category, description, timestamp) VALUES (?, ?, ?, ?)',
                [expense.amount, expense.category, expense.description, expense.timestamp]
              );
              importedExpenses++;
            } else {
              skippedExpenses++;
            }
          } catch (error) {
            console.log(`⚠️ Error importing expense ${expense.id}:`, error.message);
          }
        }
      }

      // Import pantry items
      if (jsonData.pantry_items && Array.isArray(jsonData.pantry_items)) {
        console.log(`🛒 Importing ${jsonData.pantry_items.length} pantry items...`);
        
        for (const item of jsonData.pantry_items) {
          try {
            // Check if item already exists (by name and created_at)
            const existing = await db.getFirstAsync(
              'SELECT id FROM pantry_items WHERE name = ? AND created_at = ?',
              [item.name, item.created_at]
            );
            
            if (!existing) {
              await db.runAsync(
                'INSERT INTO pantry_items (name, quantity, unit, created_at, is_consumed, grocery_type) VALUES (?, ?, ?, ?, ?, ?)',
                [item.name, item.quantity, item.unit, item.created_at, item.is_consumed ? 1 : 0, item.grocery_type]
              );
              importedPantryItems++;
            } else {
              skippedPantryItems++;
            }
          } catch (error) {
            console.log(`⚠️ Error importing pantry item ${item.id}:`, error.message);
          }
        }
      }

      console.log('✅ Import complete!');
      console.log(`📊 Expenses: ${importedExpenses} imported, ${skippedExpenses} skipped`);
      console.log(`🛒 Pantry items: ${importedPantryItems} imported, ${skippedPantryItems} skipped`);

      return {
        success: true,
        expenses: { imported: importedExpenses, skipped: skippedExpenses },
        pantry_items: { imported: importedPantryItems, skipped: skippedPantryItems }
      };
    } catch (error) {
      console.error('❌ Import error:', error);
      throw new Error(`Failed to import data: ${error.message}`);
    }
  },

  // Export all data to JSON format
  exportToJSON: async () => {
    try {
      console.log('📤 Starting data export...');
      
      // Get all expenses
      const expenseRows = await db.getAllAsync(
        'SELECT id, amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC'
      );
      const expenses = expenseRows.map(rowToExpense);
      
      // Get all pantry items
      const pantryRows = await db.getAllAsync(
        'SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items ORDER BY created_at DESC'
      );
      const pantry_items = pantryRows.map(rowToPantryItem);
      
      // Create export data structure
      const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        expenses: expenses,
        pantry_items: pantry_items
      };
      
      console.log(`✅ Export complete: ${expenses.length} expenses, ${pantry_items.length} pantry items`);
      return exportData;
    } catch (error) {
      console.error('❌ Export error:', error);
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }
};
