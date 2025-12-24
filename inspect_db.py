#!/usr/bin/env python3
"""Quick script to inspect the SQLite database"""

import sqlite3

conn = sqlite3.connect('expenses.db')
cursor = conn.cursor()

print("=" * 60)
print("DATABASE: expenses.db")
print("=" * 60)

# Show table structure
print("\n📊 TABLES:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
for table in tables:
    print(f"  - {table[0]}")

# Show expenses count and sample
print("\n💰 EXPENSES:")
cursor.execute("SELECT COUNT(*) FROM expenses")
exp_count = cursor.fetchone()[0]
print(f"  Total: {exp_count}")
cursor.execute("SELECT id, amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC LIMIT 5")
print("  Sample (latest 5):")
for row in cursor.fetchall():
    print(f"    ID: {row[0]}, ${row[1]:.2f}, {row[2]}, '{row[3]}', {row[4]}")

# Show pantry items count and sample
print("\n🛒 PANTRY ITEMS:")
cursor.execute("SELECT COUNT(*) FROM pantry_items")
pantry_count = cursor.fetchone()[0]
print(f"  Total: {pantry_count}")
cursor.execute("SELECT id, name, quantity, unit, grocery_type, is_consumed FROM pantry_items ORDER BY created_at DESC LIMIT 5")
print("  Sample (latest 5):")
for row in cursor.fetchall():
    consumed = "✓" if row[5] else "✗"
    print(f"    ID: {row[0]}, {row[1]}, {row[2]} {row[3]}, {row[4]}, consumed: {consumed}")

# Show expense_backups if it exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='expense_backups'")
if cursor.fetchone():
    cursor.execute("SELECT COUNT(*) FROM expense_backups")
    backup_count = cursor.fetchone()[0]
    print(f"\n💾 EXPENSE BACKUPS: {backup_count}")

print("\n" + "=" * 60)
print(f"Database file: expenses.db")
print("=" * 60)

conn.close()



