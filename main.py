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
        valid_categories = ['amazon', 'transportation', 'groceries', 'entertainment', 'fashion', 
                        'travel', 'food', 'monthly', 'personal']
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
        date_str = dt.strftime("%d %B %Y")
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

def get_expense_by_position(position: int, expenses_list: Optional[List] = None):
    """Get expense by its display position (1-based)"""
    if expenses_list is None:
        # Get all expenses in default order
        conn = sqlite3.connect('expenses.db')
        c = conn.cursor()
        c.execute("SELECT id, amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC")
        expenses_list = c.fetchall()
        conn.close()
    
    if 1 <= position <= len(expenses_list):
        return expenses_list[position - 1][0]  # Return the expense ID
    return None

def parse_position_input(input_str: str, max_position: int) -> List[int]:
    """Parse position input like '2', '2,5,10', '1-5', or '2,5-8,10'"""
    if not input_str.strip():
        return []
    
    positions = []
    parts = input_str.replace(' ', '').split(',')
    
    for part in parts:
        if '-' in part and part.count('-') == 1:
            # Handle ranges like "1-5"
            try:
                start, end = part.split('-')
                start, end = int(start), int(end)
                if start > end:
                    start, end = end, start  # Swap if backwards
                positions.extend(range(start, end + 1))
            except ValueError:
                print(f"❌ Invalid range format: '{part}'")
                return []
        else:
            # Handle single numbers
            try:
                pos = int(part)
                positions.append(pos)
            except ValueError:
                print(f"❌ Invalid position: '{part}'")
                return []
    
    # Remove duplicates and sort
    positions = sorted(set(positions))
    
    # Validate all positions are within range
    invalid_positions = [pos for pos in positions if pos < 1 or pos > max_position]
    if invalid_positions:
        print(f"❌ Invalid positions (out of range 1-{max_position}): {invalid_positions}")
        return []
    
    return positions

def get_expenses_by_positions(positions: List[int], expenses_list: List) -> List[tuple]:
    """Get expense details for multiple positions"""
    selected_expenses = []
    for pos in positions:
        if 1 <= pos <= len(expenses_list):
            expense_data = expenses_list[pos - 1]  # Get full expense data
            selected_expenses.append((pos, expense_data))
    return selected_expenses

@app.command()
def add(text: str):
    add_expense(text)

@app.command()
def summary(
    days: Optional[int] = typer.Option(None, help="Number of days to look back (default: all time)")
    ):
    """Generate expense summary with interactive menu selection
    
    Examples:
      expense summary                    # Interactive mode - choose from menu
      expense summary --days 30          # Interactive mode for last 30 days
    """
    
    print("\n📊 Expense Summary Options")
    print("=" * 40)
    print("1. Quick Summary      - Brief 3-4 sentence overview")
    print("2. Insights          - Detailed spending patterns & trends")
    print("3. Budget Analysis   - Budget recommendations & analysis")
    print("4. Comprehensive     - Complete detailed report")
    print("5. Custom Prompt     - Enter your own analysis request")
    print("-" * 40)
    
    # Get user's report type selection
    subcommand = ""
    while True:
        choice = input("Select an option (1-5) or 'q' to quit: ").strip().lower()
        
        if choice == 'q':
            print("👋 Summary cancelled.")
            return
        elif choice == '1':
            subcommand = "quick"
            break
        elif choice == '2':
            subcommand = "insights"
            break
        elif choice == '3':
            subcommand = "budget"
            break
        elif choice == '4':
            subcommand = "comprehensive"
            break
        elif choice == '5':
            custom_prompt = input("\nEnter your custom analysis request: ").strip()
            if custom_prompt:
                subcommand = custom_prompt
                break
            else:
                print("❌ Please enter a valid prompt.")
                continue
        else:
            print("❌ Please enter 1-5 or 'q' to quit.")
            continue
    
    # Ask about timeframe if not already specified
    if days is None:
        print("\n📅 Time Range Options")
        print("1. All time (default)")
        print("2. Last 7 days")
        print("3. Last 30 days")
        print("4. Last 90 days")
        print("5. Custom days")
        
        while True:
            time_choice = input("Select time range (1-5) or press Enter for all time: ").strip()
            
            if not time_choice or time_choice == '1':
                days = None
                break
            elif time_choice == '2':
                days = 7
                break
            elif time_choice == '3':
                days = 30
                break
            elif time_choice == '4':
                days = 90
                break
            elif time_choice == '5':
                while True:
                    custom_days = input("Enter number of days to look back: ").strip()
                    try:
                        days = int(custom_days)
                        if days <= 0:
                            print("❌ Please enter a positive number.")
                            continue
                        break
                    except ValueError:
                        print("❌ Please enter a valid number.")
                        continue
                break
            else:
                print("❌ Please enter 1-5 or press Enter.")
                continue
    
    print(f"\n🔄 Generating {subcommand} summary...")
    if days:
        print(f"📅 Looking back {days} days")
    else:
        print("📅 Including all expenses")
    print("-" * 40)
    
    # Check if subcommand is a predefined report type
    valid_types = ["quick", "insights", "budget", "comprehensive"]
    
    if subcommand.lower() in valid_types:
        # Convert budget to budget_analysis for internal use
        report_type = "budget_analysis" if subcommand.lower() == "budget" else subcommand.lower()
        summarize(report_type=report_type, timeframe_days=days)
    else:
        # Treat as custom prompt
        summarize(prompt=subcommand, timeframe_days=days)

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
    """List expenses with interactive menu selection"""
    
    print("\n📋 List Expenses Options")
    print("=" * 40)
    print("1. All Expenses      - Show all expenses")
    print("2. Weekly            - Last 7 days")
    print("3. Monthly           - Filter by month")
    print("4. By Category       - Filter by expense category")
    print("5. Custom Date Range - Specify number of days back")
    print("-" * 40)
    
    # Get user's filter selection
    filter_choice = ""
    while True:
        choice = input("Select an option (1-5) or 'q' to quit: ").strip().lower()
        
        if choice == 'q':
            print("👋 List cancelled.")
            return
        elif choice == '1':
            filter_choice = "all"
            break
        elif choice == '2':
            filter_choice = "weekly"
            break
        elif choice == '3':
            filter_choice = "monthly"
            break
        elif choice == '4':
            filter_choice = "category"
            break
        elif choice == '5':
            filter_choice = "custom_days"
            break
        else:
            print("❌ Please enter 1-5 or 'q' to quit.")
            continue
    
    # Month name mapping for flexible input
    month_mapping = {
        'january': 1, 'jan': 1,
        'february': 2, 'feb': 2,
        'march': 3, 'mar': 3,
        'april': 4, 'apr': 4,
        'may': 5,
        'june': 6, 'jun': 6,
        'july': 7, 'jul': 7,
        'august': 8, 'aug': 8,
        'september': 9, 'sep': 9, 'sept': 9,
        'october': 10, 'oct': 10,
        'november': 11, 'nov': 11,
        'december': 12, 'dec': 12
    }
    
    # Handle different filter types
    if filter_choice == "weekly":
        # Weekly filter - last 7 days
        from datetime import timedelta
        
        conn = sqlite3.connect('expenses.db')
        c = conn.cursor()
        
        cutoff_date = (datetime.now() - timedelta(days=7)).isoformat()
        c.execute("SELECT id, amount, category, description, timestamp FROM expenses WHERE timestamp >= ? ORDER BY timestamp DESC", (cutoff_date,))
        expenses = c.fetchall()
        
        header = f"📋 Weekly Expenses - Last 7 Days"
        
    elif filter_choice == "monthly":
        # Monthly filter - let user choose month
        print("\n📅 Select Month:")
        print("1. January    2. February   3. March      4. April")
        print("5. May        6. June       7. July       8. August")
        print("9. September  10. October   11. November  12. December")
        
        while True:
            month_choice = input("Enter month number (1-12): ").strip()
            try:
                target_month = int(month_choice)
                if 1 <= target_month <= 12:
                    break
                else:
                    print("❌ Please enter a number between 1 and 12.")
            except ValueError:
                print("❌ Please enter a valid number.")
        
        month_names = ["", "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"]
        
        conn = sqlite3.connect('expenses.db')
        c = conn.cursor()
        
        # Get all expenses and filter by month
        c.execute("SELECT id, amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC")
        all_expenses = c.fetchall()
        
        # Filter expenses by month (any year)
        expenses = []
        for expense in all_expenses:
            expense_id, amount, category, description, timestamp = expense
            try:
                dt = datetime.fromisoformat(timestamp)
                if dt.month == target_month:
                    expenses.append(expense)
            except:
                continue
        
        header = f"📋 {month_names[target_month]} Expenses"
        
    elif filter_choice == "category":
        # Category filter - let user choose from available categories
        conn = sqlite3.connect('expenses.db')
        c = conn.cursor()
        
        # Get available categories
        c.execute("SELECT DISTINCT category FROM expenses ORDER BY category")
        categories = c.fetchall()
        
        if not categories:
            print("❌ No categories found in your expenses.")
            conn.close()
            return
        
        print("\n📂 Available Categories:")
        for i, (category,) in enumerate(categories, 1):
            print(f"{i:2d}. {category}")
        
        while True:
            try:
                cat_choice = input(f"Select category (1-{len(categories)}): ").strip()
                cat_index = int(cat_choice) - 1
                if 0 <= cat_index < len(categories):
                    selected_category = categories[cat_index][0]
                    break
                else:
                    print(f"❌ Please enter a number between 1 and {len(categories)}.")
            except ValueError:
                print("❌ Please enter a valid number.")
        
        c.execute("SELECT id, amount, category, description, timestamp FROM expenses WHERE category = ? ORDER BY timestamp DESC", (selected_category,))
        expenses = c.fetchall()
        header = f"📋 {selected_category.title()} Expenses"
        
    elif filter_choice == "custom_days":
        # Custom date range
        while True:
            try:
                days_input = input("Enter number of days to look back: ").strip()
                days_back = int(days_input)
                if days_back <= 0:
                    print("❌ Please enter a positive number.")
                    continue
                break
            except ValueError:
                print("❌ Please enter a valid number.")
        
        from datetime import timedelta
        
        conn = sqlite3.connect('expenses.db')
        c = conn.cursor()
        
        cutoff_date = (datetime.now() - timedelta(days=days_back)).isoformat()
        c.execute("SELECT id, amount, category, description, timestamp FROM expenses WHERE timestamp >= ? ORDER BY timestamp DESC", (cutoff_date,))
        expenses = c.fetchall()
        
        header = f"📋 Last {days_back} Days Expenses"
        
    else:
        # All expenses
        conn = sqlite3.connect('expenses.db')
        c = conn.cursor()
        c.execute("SELECT id, amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC")
        expenses = c.fetchall()
        header = f"📋 All Expenses"
    
    conn.close()
    
    if not expenses:
        if filter_choice == "weekly":
            print("No expenses found in the last 7 days.")
        elif filter_choice == "monthly":
            print(f"No expenses found for {month_names[target_month]}.")
        elif filter_choice == "category":
            print(f"No expenses found for category '{selected_category}'.")
        elif filter_choice == "custom_days":
            print(f"No expenses found in the last {days_back} days.")
        else:
            print("No expenses found.")
        return
    
    # Calculate total
    total_amount = sum(amount for _, amount, _, _, _ in expenses if amount is not None)
    
    print(f"\n{header} ({len(expenses)} total):")
    print("-" * 80)
    for i, (expense_id, amount, category_name, description, timestamp) in enumerate(expenses, 1):
        amount_str = f"${amount}" if amount else "No amount"
        # Format timestamp for display
        try:
            dt = datetime.fromisoformat(timestamp)
            date_str = dt.strftime("%d %b %Y")
        except:
            date_str = timestamp[:10] if timestamp else "No date"
        print(f"{i:2d}. {amount_str:>8} | {category_name:12} | {description:25} | {date_str}")
    print("-" * 80)
    print(f"💰 Total: ${total_amount:.2f}")
    print("-" * 80)


@app.command()
def edit(
    positions: Optional[str] = typer.Argument(None, help="Position(s) to edit: single (2), multiple (2,5,10), or range (1-5)")
    ):
    """Interactive batch editing mode - supports single or multiple expense editing
    
    Examples:
        expense edit              # Interactive selection
        expense edit 2            # Edit position 2
        expense edit 2,5,10       # Edit positions 2, 5, and 10
        expense edit 1-5          # Edit positions 1 through 5
        expense edit 2,5-8,10     # Edit positions 2, 5-8, and 10
    """
    
    # Get all expenses first
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute("SELECT id, amount, category, description, timestamp FROM expenses ORDER BY timestamp DESC")
    expenses = c.fetchall()
    conn.close()
    
    if not expenses:
        print("❌ No expenses found to edit.")
        return
    
    selected_positions = []
    
    # Parse positions if provided
    if positions:
        selected_positions = parse_position_input(positions, len(expenses))
        if not selected_positions:
            return
    else:
        # Interactive selection
        print("\n📋 Select expense(s) to edit:")
        print("=" * 90)
        
        # Show expenses with selection numbers
        for i, (exp_id, amount, category, description, timestamp) in enumerate(expenses, 1):
            amount_str = f"${amount:.2f}" if amount else "No amount"
            try:
                dt = datetime.fromisoformat(timestamp)
                date_str = dt.strftime("%d %B %Y")
            except:
                date_str = timestamp[:10] if timestamp else "No date"
            print(f"{i:2d}. {amount_str:>8} | {category:12} | {description:25} | {date_str}")
        
        print("-" * 90)
        print("💡 Examples: '2' (single), '2,5,10' (multiple), '1-5' (range), '2,5-8,10' (mixed)")
        print("-" * 90)
        
        # Get user selection
        while True:
            choice = input(f"Select expense(s) to edit (1-{len(expenses)}) or 'q' to quit: ").strip()
            if choice.lower() == 'q':
                print("👋 Edit cancelled.")
                return
            
            selected_positions = parse_position_input(choice, len(expenses))
            if selected_positions:
                break
    
    # Get expense details for selected positions
    selected_expenses = get_expenses_by_positions(selected_positions, expenses)
    
    if not selected_expenses:
        print("❌ No valid expenses selected.")
        return
    
    # Show selected expenses
    print(f"\n🎯 Selected {len(selected_expenses)} expense(s) for editing:")
    print("-" * 90)
    for pos, (exp_id, amount, category, description, timestamp) in selected_expenses:
        amount_str = f"${amount:.2f}" if amount else "No amount"
        try:
            dt = datetime.fromisoformat(timestamp)
            date_str = dt.strftime("%d %B %Y")
        except:
            date_str = timestamp[:10] if timestamp else "No date"
        print(f"Pos {pos:2d}: {amount_str:>8} | {category:12} | {description:25} | {date_str}")
    print("-" * 90)
    
    # For single expense, use traditional individual editing
    if len(selected_expenses) == 1:
        pos, expense_data = selected_expenses[0]
        expense_id = expense_data[0]
        
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
        
        # Individual editing for single expense
        if not edit_single_expense(expense):
            return
    else:
        # Batch editing for multiple expenses
        if not edit_multiple_expenses(selected_expenses):
            return

def edit_single_expense(expense):
    """Edit a single expense with detailed interaction"""
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
            return False
    
    # Edit category
    print(f"\n📂 Category (current: {current_category})")
    new_category = input("Enter new category (or press Enter to keep current): ").strip()
    if new_category:
        try:
            current_category = validate_category(new_category)
            print(f"✅ Category updated to: {current_category}")
        except ValueError as e:
            print(f"❌ {e}")
            return False
    
    # Edit description
    print(f"\n📝 Description (current: {current_description})")
    new_description = input("Enter new description (or press Enter to keep current): ").strip()
    if new_description:
        current_description = new_description
        print(f"✅ Description updated to: {current_description}")
    
    # Edit date
    try:
        dt = datetime.fromisoformat(current_timestamp)
        date_display = dt.strftime("%d %B %Y")
    except:
        date_display = current_timestamp
    
    print(f"\n📅 Date (current: {date_display})")
    new_date = input("Enter new date (YYYY-MM-DD or MM/DD/YYYY, or press Enter to keep current): ").strip()
    if new_date:
        try:
            current_timestamp = validate_date(new_date)
            dt = datetime.fromisoformat(current_timestamp)
            print(f"✅ Date updated to: {dt.strftime('%d %B %Y')}")
        except ValueError as e:
            print(f"❌ {e}")
            return False
    
    # Show summary and confirm
    print(f"\n📋 Summary of Changes:")
    print("-" * 40)
    new_expense = (exp_id, current_amount, current_category, current_description, current_timestamp)
    print(format_expense_display(new_expense))
    
    confirm = input("\n💾 Save changes? (Press Enter to save, 'n' to cancel): ").lower().strip()
    if confirm == 'n':
        print("❌ Changes cancelled.")
        return False
    
    # Apply changes
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    c.execute('''
        UPDATE expenses 
        SET amount = ?, category = ?, description = ?, timestamp = ?
        WHERE id = ?
    ''', (current_amount, current_category, current_description, current_timestamp, exp_id))
    conn.commit()
    conn.close()
    print("✅ Changes saved successfully!")
    return True

def edit_multiple_expenses(selected_expenses):
    """Edit multiple expenses with batch operations"""
    print(f"\n🔧 Batch Editing Mode - {len(selected_expenses)} expenses")
    print("=" * 60)
    
    # Create backups for all selected expenses
    backup_ids = []
    for pos, expense_data in selected_expenses:
        expense_id = expense_data[0]
        backup_id = backup_expense(expense_id)
        if backup_id:
            backup_ids.append(backup_id)
    
    if backup_ids:
        print(f"📋 Created {len(backup_ids)} backups")
    
    print("\n🎯 Batch Editing Options:")
    print("1. Edit each expense individually")
    print("2. Apply same changes to all expenses")
    print("3. Bulk update specific field only")
    
    while True:
        choice = input("Select editing mode (1-3) or 'q' to quit: ").strip()
        if choice.lower() == 'q':
            print("👋 Batch edit cancelled.")
            return False
        elif choice == '1':
            return edit_individually(selected_expenses)
        elif choice == '2':
            return edit_apply_to_all(selected_expenses)
        elif choice == '3':
            return edit_bulk_field(selected_expenses)
        else:
            print("❌ Please enter 1, 2, 3, or 'q'")

def edit_individually(selected_expenses):
    """Edit each expense one by one"""
    print(f"\n📝 Individual Editing Mode")
    updated_count = 0
    
    for i, (pos, expense_data) in enumerate(selected_expenses, 1):
        expense_id = expense_data[0]
        expense = get_expense_by_id(expense_id)
        
        if not expense:
            print(f"❌ Expense {expense_id} not found, skipping...")
            continue
        
        print(f"\n--- Editing {i}/{len(selected_expenses)}: Position {pos} ---")
        print(format_expense_display(expense))
        
        skip = input(f"Edit this expense? (y/n/q to quit): ").strip().lower()
        if skip == 'q':
            print("👋 Stopping individual edits.")
            break
        elif skip == 'n':
            print("⏭️ Skipping this expense.")
            continue
        
        if edit_single_expense(expense):
            updated_count += 1
    
    print(f"\n✅ Individual editing complete! Updated {updated_count} out of {len(selected_expenses)} expenses.")
    return True

def edit_apply_to_all(selected_expenses):
    """Apply same changes to all selected expenses"""
    print(f"\n🔄 Apply to All Mode")
    print("Enter new values (press Enter to skip a field):")
    
    # Get new values for all fields
    new_amount = input("💰 New amount ($ format, e.g., 25.99): ").strip()
    validated_amount = None
    if new_amount:
        try:
            validated_amount = validate_amount(new_amount)
        except ValueError as e:
            print(f"❌ {e}")
            return False
    
    new_category = input("📂 New category: ").strip()
    validated_category = None
    if new_category:
        try:
            validated_category = validate_category(new_category)
        except ValueError as e:
            print(f"❌ {e}")
            return False
    
    new_description = input("📝 New description: ").strip()
    
    new_date = input("📅 New date (YYYY-MM-DD or MM/DD/YYYY): ").strip()
    validated_date = None
    if new_date:
        try:
            validated_date = validate_date(new_date)
        except ValueError as e:
            print(f"❌ {e}")
            return False
    
    # Show what will be applied
    changes = []
    if validated_amount: changes.append(f"Amount: ${validated_amount:.2f}")
    if validated_category: changes.append(f"Category: {validated_category}")
    if new_description: changes.append(f"Description: {new_description}")
    if validated_date: 
        dt = datetime.fromisoformat(validated_date)
        changes.append(f"Date: {dt.strftime('%d %B %Y')}")
    
    if not changes:
        print("❌ No changes specified.")
        return False
    
    print(f"\n📋 Will apply these changes to all {len(selected_expenses)} expenses:")
    for change in changes:
        print(f"  • {change}")
    
    confirm = input(f"\n⚠️ Apply to all {len(selected_expenses)} expenses? (type 'yes' to confirm): ")
    if confirm.lower() != 'yes':
        print("❌ Bulk changes cancelled.")
        return False
    
    # Apply changes to all expenses
    updated_count = 0
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    for pos, expense_data in selected_expenses:
        expense_id = expense_data[0]
        current_amount, current_category, current_description, current_timestamp = expense_data[1:5]
        
        # Use new values or keep current ones
        final_amount = validated_amount if validated_amount else current_amount
        final_category = validated_category if validated_category else current_category
        final_description = new_description if new_description else current_description
        final_timestamp = validated_date if validated_date else current_timestamp
        
        c.execute('''
            UPDATE expenses 
            SET amount = ?, category = ?, description = ?, timestamp = ?
            WHERE id = ?
        ''', (final_amount, final_category, final_description, final_timestamp, expense_id))
        updated_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"✅ Successfully applied changes to all {updated_count} expenses!")
    return True

def edit_bulk_field(selected_expenses):
    """Update a single field for all selected expenses"""
    print(f"\n🎯 Bulk Field Update Mode")
    print("Available fields:")
    print("1. Amount")
    print("2. Category") 
    print("3. Description")
    print("4. Date")
    
    while True:
        field_choice = input("Select field to update (1-4) or 'q' to quit: ").strip()
        if field_choice.lower() == 'q':
            return False
        
        if field_choice == '1':
            field_name = "amount"
            break
        elif field_choice == '2':
            field_name = "category"
            break
        elif field_choice == '3':
            field_name = "description"
            break
        elif field_choice == '4':
            field_name = "date"
            break
        else:
            print("❌ Please enter 1-4 or 'q'")
    
    # Get new value for the selected field
    if field_name == "amount":
        new_value = input(f"💰 Enter new amount for all {len(selected_expenses)} expenses: ").strip()
        try:
            validated_value = validate_amount(new_value)
        except ValueError as e:
            print(f"❌ {e}")
            return False
        field_column = "amount"
        display_value = f"${validated_value:.2f}"
        
    elif field_name == "category":
        new_value = input(f"📂 Enter new category for all {len(selected_expenses)} expenses: ").strip()
        try:
            validated_value = validate_category(new_value)
        except ValueError as e:
            print(f"❌ {e}")
            return False
        field_column = "category"
        display_value = validated_value
        
    elif field_name == "description":
        validated_value = input(f"📝 Enter new description for all {len(selected_expenses)} expenses: ").strip()
        if not validated_value:
            print("❌ Description cannot be empty.")
            return False
        field_column = "description"
        display_value = validated_value
        
    elif field_name == "date":
        new_value = input(f"📅 Enter new date for all {len(selected_expenses)} expenses (YYYY-MM-DD or MM/DD/YYYY): ").strip()
        try:
            validated_value = validate_date(new_value)
            dt = datetime.fromisoformat(validated_value)
            display_value = dt.strftime('%d %B %Y')
        except ValueError as e:
            print(f"❌ {e}")
            return False
        field_column = "timestamp"
    
    # Confirm bulk update
    print(f"\n⚠️ About to update {field_name} = '{display_value}' for all {len(selected_expenses)} expenses")
    confirm = input("Type 'yes' to confirm: ").lower()
    
    if confirm != 'yes':
        print("❌ Bulk update cancelled.")
        return False
    
    # Apply the bulk update
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    
    expense_ids = [expense_data[0] for pos, expense_data in selected_expenses]
    placeholders = ','.join(['?'] * len(expense_ids))
    
    c.execute(f"UPDATE expenses SET {field_column} = ? WHERE id IN ({placeholders})", 
              [validated_value] + expense_ids)
    updated_count = c.rowcount
    conn.commit()
    conn.close()
    
    print(f"✅ Successfully updated {field_name} for {updated_count} expenses!")
    return True


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
def undo(position: int):
    """Undo the last edit made to an expense by position (1, 2, 3, etc.)"""
    
    expense_id = get_expense_by_position(position)
    if not expense_id:
        print(f"❌ No expense found at position {position}")
        return
    print(f"🎯 Found expense at position {position} (ID: {expense_id})")
    
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
def delete(position: int):
    """Delete a specific expense entry by position (1, 2, 3, etc.)"""
    
    expense_id = get_expense_by_position(position)
    if not expense_id:
        print(f"❌ No expense found at position {position}")
        return
    print(f"🎯 Found expense at position {position} (ID: {expense_id})")
    
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
