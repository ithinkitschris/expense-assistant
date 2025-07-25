#!/usr/bin/env python3
"""
Script to recategorize all pantry items in the database using the latest categorization logic.
"""
import sqlite3
import sys
import os

# Add the api directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))
from api.utils.grocery_categories import categorize_grocery_item_rule_based

def recategorize_all_pantry_items():
    db_path = os.path.join(os.path.dirname(__file__), 'expenses.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        c.execute('SELECT id, name, grocery_type FROM pantry_items')
        items = c.fetchall()
        print(f"Found {len(items)} pantry items to recategorize...")
        print("=" * 80)
        changes = []
        for item_id, name, current_category in items:
            new_category = categorize_grocery_item_rule_based(name)
            if new_category != current_category:
                c.execute('UPDATE pantry_items SET grocery_type = ? WHERE id = ?', (new_category, item_id))
                changes.append({'name': name, 'old': current_category, 'new': new_category})
        conn.commit()
        print(f"Recategorization complete. {len(changes)} items updated.")
        if changes:
            print("\nSummary of changes:")
            for change in changes:
                print(f"- {change['name']}: {change['old']} → {change['new']}")
        print("\nFinal category distribution:")
        c.execute('SELECT grocery_type, COUNT(*) FROM pantry_items GROUP BY grocery_type ORDER BY COUNT(*) DESC')
        for cat, count in c.fetchall():
            print(f"  {cat}: {count}")
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    recategorize_all_pantry_items() 