#!/usr/bin/env python3
"""
Script to update existing pantry items with proper grocery type categorization.
This will categorize all existing items based on their names.
"""

import sqlite3
import sys
import os

# Add the api directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from api.utils.grocery_categories import categorize_grocery_item

def update_pantry_categories():
    """Update all pantry items with proper grocery type categorization"""
    
    # Connect to the database
    db_path = os.path.join(os.path.dirname(__file__), 'expenses.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    try:
        # Get all pantry items
        c.execute('SELECT id, name FROM pantry_items')
        items = c.fetchall()
        
        print(f"Found {len(items)} pantry items to categorize...")
        
        updated_count = 0
        for item_id, name in items:
            # Categorize the item
            grocery_type = categorize_grocery_item(name)
            
            # Update the item in the database
            c.execute('UPDATE pantry_items SET grocery_type = ? WHERE id = ?', (grocery_type, item_id))
            
            print(f"  {name} → {grocery_type}")
            updated_count += 1
        
        # Commit the changes
        conn.commit()
        print(f"\n✅ Successfully updated {updated_count} pantry items with grocery types!")
        
        # Show summary by category
        print("\n📊 Summary by category:")
        c.execute('''
            SELECT grocery_type, COUNT(*) as count 
            FROM pantry_items 
            GROUP BY grocery_type 
            ORDER BY count DESC
        ''')
        
        for grocery_type, count in c.fetchall():
            print(f"  {grocery_type}: {count} items")
        
    except Exception as e:
        print(f"❌ Error updating pantry categories: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_pantry_categories() 