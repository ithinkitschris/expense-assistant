#!/usr/bin/env python3
"""
Export local SQLite database to JSON format for import into React Native app
"""

import sqlite3
import json
from datetime import datetime

# Connect to local SQLite database
conn = sqlite3.connect('expenses.db')
cursor = conn.cursor()

# Export expenses
print("Exporting expenses...")
cursor.execute('SELECT id, amount, category, description, timestamp FROM expenses')
expenses = []
for row in cursor.fetchall():
    expenses.append({
        'id': row[0],
        'amount': row[1],
        'category': row[2],
        'description': row[3],
        'timestamp': row[4]
    })

print(f"Found {len(expenses)} expenses")

# Export pantry items
print("Exporting pantry items...")
cursor.execute('SELECT id, name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items')
pantry_items = []
for row in cursor.fetchall():
    pantry_items.append({
        'id': row[0],
        'name': row[1],
        'quantity': row[2],
        'unit': row[3],
        'created_at': row[4],
        'is_consumed': bool(row[5]),  # Convert integer to boolean
        'grocery_type': row[6]
    })

print(f"Found {len(pantry_items)} pantry items")

conn.close()

# Create export data structure
export_data = {
    'version': '1.0',
    'exported_at': datetime.now().isoformat(),
    'expenses': expenses,
    'pantry_items': pantry_items
}

# Write to JSON file
output_file = 'ExpenseTracker/assets/initial_data.json'
with open(output_file, 'w') as f:
    json.dump(export_data, f, indent=2)

print(f"\n✅ Export complete!")
print(f"📁 Data exported to: {output_file}")
print(f"📊 Expenses: {len(expenses)}")
print(f"🛒 Pantry items: {len(pantry_items)}")
print(f"\nNext step: Import this data in your app using the import function")
