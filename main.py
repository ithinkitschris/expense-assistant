import warnings
from urllib3.exceptions import NotOpenSSLWarning
warnings.simplefilter("ignore", NotOpenSSLWarning)
import typer
from add_expense import add_expense
from summarize import summarize
import sqlite3
from datetime import datetime
from typing import Optional, List
import re


app = typer.Typer()

# Helper functions for robust editing
def get_expense_by_id(expense_id: int):
    """Get expense details by ID"""
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute("SELECT id, amount, category, description, timestamp FROM expenses WHERE id = ?", (expense_id,))
    expense = c.fetchone()
    conn.close()
    return expense

def validate_amount(amount_str: str) -> float:
    """Validate and convert amount string to float"""
    try:
        # Remove $ symbol and whitespace
        clean_amount = amount_str.replace('$', '').strip()
        amount = float(clean_amount)
        if amount < 0:
            raise ValueError("Amount cannot be negative")
        return amount
    except ValueError:
        raise ValueError(f"Invalid amount: '{amount_str}'. Please enter a valid positive number.")

def validate_category(category: str) -> str:
    """Validate category against allowed values"""
    valid_categories = ['amazon', 'uber', 'groceries', 'entertainment', 'fashion', 
                       'travel', 'food', 'rent', 'insurance', 'subscriptions', 'other']
    category = category.lower().strip()
    if category not in valid_categories:
        print(f"⚠️  Category '{category}' not in standard list. Valid categories:")
        for i, cat in enumerate(valid_categories, 1):
            print(f"  {i:2d}. {cat}")
        confirm = input(f"Use '{category}' anyway? (y/n): ").lower()
        if confirm not in ['y', 'yes']:
            raise ValueError("Category validation failed")
    return category

def validate_date(date_str: str) -> str:
    """Validate and parse date string"""
    if not date_str.strip():
        return datetime.now().isoformat()
    
    try:
        # Try to parse as ISO format first
        dt = datetime.fromisoformat(date_str)
        return dt.isoformat()
    except ValueError:
        pass
    
    # Try common date formats
    date_formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%Y-%m-%d %H:%M:%S",
        "%m/%d/%Y %H:%M:%S"
    ]
    
    for fmt in date_formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.isoformat()
        except ValueError:
            continue
    
    raise ValueError(f"Invalid date format: '{date_str}'. Use YYYY-MM-DD or MM/DD/YYYY")

def format_expense_display(expense):
    """Format expense for nice display"""
    expense_id, amount, category, description, timestamp = expense
    amount_str = f"${amount:.2f}" if amount else "No amount"
    try:
        dt = datetime.fromisoformat(timestamp)
        date_str = dt.strftime("%Y-%m-%d %H:%M")
    except:
        date_str = timestamp[:19] if timestamp else "No date"
    
    return f"ID: {expense_id} | {amount_str:>8} | {category:12} | {description:30} | {date_str}"

def search_expenses(search_term: str = "", category: str = "", days: Optional[int] = None) -> List:
    """Search expenses with filters"""
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    query = "SELECT id, amount, category, description, timestamp FROM expenses WHERE 1=1"
    params = []
    
    if search_term:
        query += " AND (description LIKE ? OR category LIKE ?)"
        params.extend([f"%{search_term}%", f"%{search_term}%"])
    
    if category:
        query += " AND category = ?"
        params.append(category)
    
    if days:
        from datetime import timedelta
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        query += " AND timestamp >= ?"
        params.append(cutoff_date)
    
    query += " ORDER BY timestamp DESC"
    
    c.execute(query, params)
    expenses = c.fetchall()
    conn.close()
    return expenses

def backup_expense(expense_id: int):
    """Create a backup of expense before editing (for undo)"""
    expense = get_expense_by_id(expense_id)
    if expense:
        conn = sqlite3.connect('expenses.db')
        c = conn.cursor()
        # Create backup table if not exists
        c.execute('''
            CREATE TABLE IF NOT EXISTS expense_backups (
                backup_id INTEGER PRIMARY KEY,
                original_id INTEGER,
                amount REAL,
                category TEXT,
                description TEXT,
                timestamp TEXT,
                backup_timestamp TEXT
            )
        ''')
        
        # Insert backup
        c.execute('''
            INSERT INTO expense_backups (original_id, amount, category, description, timestamp, backup_timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (*expense, datetime.now().isoformat()))
        conn.commit()
        backup_id = c.lastrowid
        conn.close()
        return backup_id
    return None

@app.command()
def add(text: str):
    add_expense(text)

@app.command()
def summary(
    prompt: str = typer.Argument("", help="Custom prompt for expense analysis"),
    type: str = typer.Option("comprehensive", help="Report type: quick, comprehensive, insights, budget_analysis"),
    days: Optional[int] = typer.Option(None, help="Number of days to look back (default: all time)")
):
    """Generate expense summary with various report types"""
    if prompt:
        # If custom prompt provided, use it
        summarize(prompt=prompt, timeframe_days=days)
    else:
        # Use the report type
        summarize(report_type=type, timeframe_days=days)

@app.command()
def quick():
    """Quick expense summary (1-2 sentences)"""
    summarize(report_type="quick")

@app.command()
def insights():
    """Detailed insights about spending patterns"""
    summarize(report_type="insights")

@app.command()
def budget():
    """Budget-focused analysis with recommendations"""
    summarize(report_type="budget_analysis")

@app.command()
def weekly():
    """Weekly expense summary (last 7 days)"""
    summarize(report_type="comprehensive", timeframe_days=7)

@app.command()
def monthly():
    """Monthly expense summary (last 30 days)"""
    summarize(report_type="comprehensive", timeframe_days=30)

@app.command()
def clear():
    """Clear all expenses from the database"""
    # Get count of expenses first
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM expenses")
    count = c.fetchone()[0]
    conn.close()
    
    if count == 0:
        print("No expenses to clear.")
        return
    
    # Show confirmation prompt
    print(f"⚠️  You are about to delete ALL {count} expenses from the database!")
    confirmation = input("Type 'yes' to confirm, or anything else to cancel: ")
    
    if confirmation.lower() != 'yes':
        print("❌ Clear operation cancelled.")
        return
    
    # Proceed with deletion
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute("DELETE FROM expenses")
    conn.commit()
    conn.close()
    print("✅ All expenses cleared from database.")

@app.command()
def list():
    """List all expenses in the database"""
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute("SELECT id, amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC")
    expenses = c.fetchall()
    conn.close()
    
    if not expenses:
        print("No expenses found.")
        return
    
    print(f"\n📋 All Expenses ({len(expenses)} total):")
    print("-" * 80)
    for i, (expense_id, amount, category, description, timestamp) in enumerate(expenses, 1):
        amount_str = f"${amount}" if amount else "No amount"
        # Format timestamp for display
        try:
            dt = datetime.fromisoformat(timestamp)
            date_str = dt.strftime("%d-%m-%Y")
        except:
            date_str = timestamp[:10] if timestamp else "No date"
        print(f"{i:2d}. {amount_str:>8} | {category:12} | {description:25} | {date_str} (ID: {expense_id})")
    print("-" * 80)

# Legacy simple edit command (keeping for backwards compatibility)
@app.command()
def edit(expense_id: int, field: str, new_value):
    """Edit an existing expense entry (simple mode)"""
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    # First, check if the expense exists
    c.execute("SELECT id, amount, category, description FROM expenses WHERE id = ?", (expense_id,))
    expense = c.fetchone()
    
    if not expense:
        print(f"❌ Expense with ID {expense_id} not found.")
        conn.close()
        return
    
    # Validate field name
    valid_fields = ['amount', 'category', 'description']
    if field.lower() not in valid_fields:
        print(f"❌ Invalid field. Use one of: {', '.join(valid_fields)}")
        conn.close()
        return
    
    # Handle amount field specially (convert to float)
    if field.lower() == 'amount':
        try:
            # Remove $ if present and convert to float
            new_value = new_value.replace('$', '').strip()
            new_value = float(new_value)
        except ValueError:
            print("❌ Invalid amount. Please enter a valid number.")
            conn.close()
            return
    
    # Update the database
    field = field.lower()
    c.execute(f"UPDATE expenses SET {field} = ? WHERE id = ?", (new_value, expense_id))
    conn.commit()
    conn.close()
    
    print(f"✅ Updated expense {expense_id}: {field} = {new_value}")

# New comprehensive editing commands
@app.command()
def edit_interactive(expense_id: int):
    """Interactive editing mode for comprehensive expense modification"""
    expense = get_expense_by_id(expense_id)
    if not expense:
        print(f"❌ Expense with ID {expense_id} not found.")
        return
    
    print(f"\n🔧 Interactive Editing Mode - Expense {expense_id}")
    print("=" * 60)
    print("Current values:")
    print(format_expense_display(expense))
    print("-" * 60)
    
    # Create backup
    backup_id = backup_expense(expense_id)
    if backup_id:
        print(f"📋 Backup created (ID: {backup_id})")
    
    # Interactive editing
    exp_id, current_amount, current_category, current_description, current_timestamp = expense
    
    # Edit amount
    print(f"\n💰 Amount (current: ${current_amount:.2f})")
    new_amount = input("Enter new amount (or press Enter to keep current): ").strip()
    if new_amount:
        try:
            current_amount = validate_amount(new_amount)
            print(f"✅ Amount updated to: ${current_amount:.2f}")
        except ValueError as e:
            print(f"❌ {e}")
            return
    
    # Edit category
    print(f"\n📂 Category (current: {current_category})")
    new_category = input("Enter new category (or press Enter to keep current): ").strip()
    if new_category:
        try:
            current_category = validate_category(new_category)
            print(f"✅ Category updated to: {current_category}")
        except ValueError as e:
            print(f"❌ {e}")
            return
    
    # Edit description
    print(f"\n📝 Description (current: {current_description})")
    new_description = input("Enter new description (or press Enter to keep current): ").strip()
    if new_description:
        current_description = new_description
        print(f"✅ Description updated to: {current_description}")
    
    # Edit date
    try:
        dt = datetime.fromisoformat(current_timestamp)
        date_display = dt.strftime("%Y-%m-%d %H:%M")
    except:
        date_display = current_timestamp
    
    print(f"\n📅 Date (current: {date_display})")
    new_date = input("Enter new date (YYYY-MM-DD or MM/DD/YYYY, or press Enter to keep current): ").strip()
    if new_date:
        try:
            current_timestamp = validate_date(new_date)
            dt = datetime.fromisoformat(current_timestamp)
            print(f"✅ Date updated to: {dt.strftime('%Y-%m-%d %H:%M')}")
        except ValueError as e:
            print(f"❌ {e}")
            return
    
    # Show summary and confirm
    print(f"\n📋 Summary of Changes:")
    print("-" * 40)
    new_expense = (exp_id, current_amount, current_category, current_description, current_timestamp)
    print(format_expense_display(new_expense))
    
    confirm = input("\n💾 Save changes? (y/n): ").lower()
    if confirm in ['y', 'yes']:
        # Apply changes
        conn = sqlite3.connect('expenses.db')
        c = conn.cursor()
        c.execute('''
            UPDATE expenses 
            SET amount = ?, category = ?, description = ?, timestamp = ?
            WHERE id = ?
        ''', (current_amount, current_category, current_description, current_timestamp, expense_id))
        conn.commit()
        conn.close()
        print("✅ Changes saved successfully!")
    else:
        print("❌ Changes cancelled.")

@app.command()
def edit_multiple(
    field: str,
    new_value: str,
    search: str = typer.Option("", help="Search term to filter expenses"),
    category: str = typer.Option("", help="Filter by category"),
    days: Optional[int] = typer.Option(None, help="Filter by days back")
):
    """Edit multiple expenses at once based on filters"""
    
    # Find matching expenses
    expenses = search_expenses(search, category, days)
    
    if not expenses:
        print("❌ No expenses found matching the criteria.")
        return
    
    # Validate field
    valid_fields = ['amount', 'category', 'description']
    if field.lower() not in valid_fields:
        print(f"❌ Invalid field. Use one of: {', '.join(valid_fields)}")
        return
    
    print(f"\n🎯 Found {len(expenses)} expenses matching your criteria:")
    print("-" * 80)
    for expense in expenses[:10]:  # Show first 10
        print(format_expense_display(expense))
    if len(expenses) > 10:
        print(f"... and {len(expenses) - 10} more")
    print("-" * 80)
    
    # Validate new value
    field = field.lower()
    processed_value = new_value
    try:
        if field == 'amount':
            processed_value = validate_amount(new_value)
        elif field == 'category':
            processed_value = validate_category(new_value)
        # description needs no validation
    except ValueError as e:
        print(f"❌ {e}")
        return
    
    # Confirm bulk edit
    print(f"\n⚠️  About to update {field} = {processed_value} for {len(expenses)} expenses")
    confirm = input("Type 'yes' to confirm: ").lower()
    
    if confirm != 'yes':
        print("❌ Bulk edit cancelled.")
        return
    
    # Apply changes
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    expense_ids = [exp[0] for exp in expenses]
    placeholders = ','.join(['?'] * len(expense_ids))
    
    c.execute(f"UPDATE expenses SET {field} = ? WHERE id IN ({placeholders})", 
              [processed_value] + expense_ids)
    conn.commit()
    updated_count = c.rowcount
    conn.close()
    
    print(f"✅ Successfully updated {updated_count} expenses!")

@app.command()
def search(
    term: str = typer.Option("", help="Search term for description/category"),
    category: str = typer.Option("", help="Filter by category"),
    days: Optional[int] = typer.Option(None, help="Filter by days back"),
    limit: int = typer.Option(20, help="Maximum number of results")
):
    """Search and filter expenses"""
    
    expenses = search_expenses(term, category, days)
    
    if not expenses:
        print("❌ No expenses found matching your criteria.")
        return
    
    print(f"\n🔍 Search Results ({len(expenses)} total, showing first {min(limit, len(expenses))}):")
    print("-" * 90)
    
    for expense in expenses[:limit]:
        print(format_expense_display(expense))
    
    if len(expenses) > limit:
        print(f"\n... and {len(expenses) - limit} more results")
    print("-" * 90)

@app.command()
def undo(expense_id: int):
    """Undo the last edit made to an expense"""
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    # Find the most recent backup for this expense
    c.execute('''
        SELECT backup_id, amount, category, description, timestamp, backup_timestamp
        FROM expense_backups 
        WHERE original_id = ? 
        ORDER BY backup_timestamp DESC 
        LIMIT 1
    ''', (expense_id,))
    
    backup = c.fetchone()
    if not backup:
        print(f"❌ No backup found for expense {expense_id}")
        conn.close()
        return
    
    backup_id, amount, category, description, timestamp, backup_time = backup
    
    print(f"🔄 Found backup from {backup_time[:19]}")
    print("Restoring values:")
    restored_expense = (expense_id, amount, category, description, timestamp)
    print(format_expense_display(restored_expense))
    
    confirm = input("\n💾 Restore this backup? (y/n): ").lower()
    if confirm in ['y', 'yes']:
        # Restore the expense
        c.execute('''
            UPDATE expenses 
            SET amount = ?, category = ?, description = ?, timestamp = ?
            WHERE id = ?
        ''', (amount, category, description, timestamp, expense_id))
        
        # Remove the backup
        c.execute("DELETE FROM expense_backups WHERE backup_id = ?", (backup_id,))
        
        conn.commit()
        conn.close()
        print("✅ Expense restored successfully!")
    else:
        conn.close()
        print("❌ Restore cancelled.")

@app.command()
def delete(expense_id: int):
    """Delete a specific expense entry"""
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    # First, check if the expense exists and get its details
    c.execute("SELECT id, amount, category, description FROM expenses WHERE id = ?", (expense_id,))
    expense = c.fetchone()
    
    if not expense:
        print(f"❌ Expense with ID {expense_id} not found.")
        conn.close()
        return
    
    # Show what we're about to delete
    expense_id, amount, category, description = expense
    amount_str = f"${amount}" if amount else "No amount"
    print(f"🗑️  About to delete: {amount_str} | {category} | {description}")
    
    # Delete the expense
    c.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    
    print(f"✅ Deleted expense {expense_id}")

if __name__ == "__main__":
    app()
