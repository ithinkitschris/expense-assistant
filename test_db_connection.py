import sqlite3
import os

def test_db_connection():
    """Test which database the API is connecting to"""
    db_path = '/Users/chris/Documents/GitHub/expense-assistant/expenses.db'
    
    print(f"Testing database connection to: {db_path}")
    print(f"File exists: {os.path.exists(db_path)}")
    
    if os.path.exists(db_path):
        print(f"File size: {os.path.getsize(db_path)} bytes")
        
        try:
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            
            # Check tables
            c.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = c.fetchall()
            print(f"Tables: {tables}")
            
            # Check grocery items
            c.execute("SELECT COUNT(*) FROM grocery_items;")
            count = c.fetchone()[0]
            print(f"Grocery items count: {count}")
            
            # Show some items
            c.execute("SELECT id, item_name FROM grocery_items LIMIT 5;")
            items = c.fetchall()
            print(f"Sample items: {items}")
            
            conn.close()
            
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("Database file not found!")

if __name__ == "__main__":
    test_db_connection() 