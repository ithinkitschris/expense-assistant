import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import os

# Connect to SQLite
sqlite_conn = sqlite3.connect('expenses.db')
sqlite_cursor = sqlite_conn.cursor()

# Connect to PostgreSQL (from environment variable)
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set")
    print("Set it with: export DATABASE_URL='postgresql://user:pass@host:port/dbname'")
    exit(1)

postgres_conn = psycopg2.connect(DATABASE_URL)
postgres_cursor = postgres_conn.cursor()

# Migrate expenses table
print("Migrating expenses...")
sqlite_cursor.execute('SELECT amount, category, description, timestamp FROM expenses')
expenses = sqlite_cursor.fetchall()

if expenses:
    execute_values(
        postgres_cursor,
        'INSERT INTO expenses (amount, category, description, timestamp) VALUES %s',
        expenses
    )
    print(f"Migrated {len(expenses)} expenses")
else:
    print("No expenses to migrate")

# Migrate pantry_items table
print("Migrating pantry_items...")
sqlite_cursor.execute('SELECT name, quantity, unit, created_at, is_consumed, grocery_type FROM pantry_items')
pantry_items = sqlite_cursor.fetchall()

if pantry_items:
    execute_values(
        postgres_cursor,
        'INSERT INTO pantry_items (name, quantity, unit, created_at, is_consumed, grocery_type) VALUES %s',
        pantry_items
    )
    print(f"Migrated {len(pantry_items)} pantry items")
else:
    print("No pantry items to migrate")

postgres_conn.commit()
sqlite_conn.close()
postgres_conn.close()
print("Migration complete!")
