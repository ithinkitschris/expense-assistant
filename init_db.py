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
conn.commit()
conn.close()
