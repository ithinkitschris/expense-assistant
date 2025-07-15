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

# Create grocery_items table for tracking individual grocery items
c.execute('''
    CREATE TABLE IF NOT EXISTS grocery_items (
        id INTEGER PRIMARY KEY,
        expense_id INTEGER,
        item_name TEXT,
        date_purchased TEXT,
        is_consumed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (expense_id) REFERENCES expenses (id)
    )
''')

conn.commit()
conn.close()
