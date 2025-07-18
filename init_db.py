import sqlite3

conn = sqlite3.connect('expenses.db')
c = conn.cursor()
c.execute('''
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY,
        amount REAL,
        category TEXT,
        description TEXT,
        timestamp TEXT
    )
''')

# Remove old grocery_items table if it exists
c.execute('''
    DROP TABLE IF EXISTS grocery_items
''')

# Create new pantry_items table (standalone, no expense_id)
c.execute('''
    CREATE TABLE IF NOT EXISTS pantry_items (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        quantity REAL DEFAULT 1,
        unit TEXT DEFAULT 'pieces',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_consumed BOOLEAN DEFAULT FALSE,
        grocery_type TEXT DEFAULT 'other'
    )
''')

# Add quantity and unit columns to existing pantry_items table if they don't exist
try:
    c.execute('ALTER TABLE pantry_items ADD COLUMN quantity REAL DEFAULT 1')
    print("Added quantity column to pantry_items table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("quantity column already exists")
    else:
        print(f"Error adding quantity column: {e}")

try:
    c.execute('ALTER TABLE pantry_items ADD COLUMN unit TEXT DEFAULT "pieces"')
    print("Added unit column to pantry_items table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("unit column already exists")
    else:
        print(f"Error adding unit column: {e}")

try:
    c.execute('ALTER TABLE pantry_items ADD COLUMN grocery_type TEXT DEFAULT "other"')
    print("Added grocery_type column to pantry_items table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("grocery_type column already exists")
    else:
        print(f"Error adding grocery_type column: {e}")

conn.commit()
conn.close()
print("Database initialization completed successfully!")
