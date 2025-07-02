from datetime import datetime
import sqlite3
from parse_expense import parse_expense

def add_to_db(entry):
    # Use parsed date if available, otherwise use current time
    timestamp = entry.get('parsed_date', datetime.now().isoformat())
    
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute(
        "INSERT INTO expenses (amount, category, description, timestamp) VALUES (?, ?, ?, ?)",
        (entry["amount"], entry["category"], entry["description"], timestamp)
    )
    conn.commit()
    conn.close()

def add_expense(natural_input):
    result = parse_expense(natural_input)
    
    if not result:
        print("⚠️ Failed to parse or add expense.")
        return
    
    # Handle multiple expenses
    if isinstance(result, list):
        print(f"🔍 Found {len(result)} expenses to add:")
        
        for i, entry in enumerate(result, 1):
            display_entry = {k: v for k, v in entry.items() if k != 'parsed_date'}
            if 'parsed_date' in entry:
                print(f"🗓️  Expense {i} - Using parsed date: {entry['parsed_date'][:10]}")
            
            add_to_db(entry)
            print(f"✅ Expense {i} added:", display_entry)
        
        print(f"🎉 Successfully added all {len(result)} expenses!")
        
    else:
        # Handle single expense
        display_entry = {k: v for k, v in result.items() if k != 'parsed_date'}
        if 'parsed_date' in result:
            print(f"🗓️  Using parsed date: {result['parsed_date'][:10]}")
        
        add_to_db(result)
        print("✅ Expense added:", display_entry)
