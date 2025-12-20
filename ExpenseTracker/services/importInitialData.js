/**
 * Import initial data from bundled JSON file
 * This runs once on first app launch to migrate existing data
 */

import { expenseAPI } from './database';

// Use require for JSON files in React Native (more reliable than import)
const initialData = require('../assets/initial_data.json');

let hasImported = false;

export const importInitialData = async () => {
  // Only import once per app session
  if (hasImported) {
    console.log('📦 Initial data already imported in this session, skipping...');
    return { alreadyImported: true };
  }

  try {
    console.log('📥 Starting initial data import...');
    const result = await expenseAPI.importFromJSON(initialData);
    hasImported = true;
    console.log('✅ Initial data import complete:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to import initial data:', error);
    throw error;
  }
};
