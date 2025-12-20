import psycopg2
import os

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set")
    exit(1)

conn = psycopg2.connect(DATABASE_URL)
c = conn.cursor()

# Create expenses table
c.execute('''
    CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount REAL,
        category TEXT,
        description TEXT,
        timestamp TEXT
    )
''')

# Create pantry_items table
c.execute('''
    CREATE TABLE IF NOT EXISTS pantry_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        quantity REAL DEFAULT 1,
        unit TEXT DEFAULT 'pieces',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_consumed BOOLEAN DEFAULT FALSE,
        grocery_type TEXT DEFAULT 'other'
    )
''')

conn.commit()
conn.close()
print("PostgreSQL schema created successfully!")
