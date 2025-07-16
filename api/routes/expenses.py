"""
Expense Management API Routes

These endpoints handle all expense-related operations:
- Creating expenses (both structured and natural language)
- Reading/listing expenses  
- Updating expenses
- Deleting expenses

All operations use your existing CLI functions and database.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
import sqlite3
from datetime import datetime, timedelta
import sys
import os

# Import your existing CLI functions
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from add_expense import add_expense

# Define get_expense_by_id locally to avoid circular import
def get_expense_by_id(expense_id: int):
    """Get expense details by ID"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, amount, category, description, timestamp FROM expenses WHERE id = ?", (expense_id,))
    expense = c.fetchone()
    conn.close()
    return expense

# Import our API schemas
from api.models.schemas import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseListResponse,
    NaturalLanguageExpense, SuccessResponse, ErrorResponse
)

# Create the router
router = APIRouter()


def get_db_connection():
    """Get database connection"""
    # Use absolute path to avoid any working directory issues
    db_path = '/Users/chris/Documents/GitHub/expense-assistant/expenses.db'
    return sqlite3.connect(db_path)


def expense_row_to_dict(row):
    """Convert SQLite row to dictionary"""
    if not row:
        return None
    return {
        "id": row[0],
        "amount": row[1],
        "category": row[2], 
        "description": row[3],
        "timestamp": datetime.fromisoformat(row[4]) if row[4] else None
    }


@router.post("/expenses/parse", response_model=SuccessResponse)
async def add_expense_natural_language(expense_input: NaturalLanguageExpense):
    """
    Add expense using natural language parsing (like your CLI)
    
    Example: "lunch at starbucks $12.50"
    This uses your existing AI parsing logic!
    """
    try:
        # Call your existing add_expense function!
        # This handles all the AI parsing and database insertion
        result = add_expense(expense_input.text)
        
        return SuccessResponse(
            message="Expense parsed and added successfully!",
            data={
                "original_text": expense_input.text,
                "parsed_result": str(result)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse expense: {str(e)}"
        )


@router.post("/expenses/", response_model=ExpenseResponse)
async def create_expense_structured(expense: ExpenseCreate):
    """
    Add expense using structured data (form input)
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Use current time if no timestamp provided
        timestamp = expense.timestamp or datetime.now()
        
        # Insert the expense
        c.execute('''
            INSERT INTO expenses (amount, category, description, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (expense.amount, expense.category.value, expense.description, timestamp.isoformat()))
        
        expense_id = c.lastrowid
        conn.commit()
        conn.close()
        
        # Return the created expense
        if expense_id is None:
            raise HTTPException(status_code=500, detail="Failed to create expense")
            
        return ExpenseResponse(
            id=expense_id,
            amount=expense.amount,
            category=expense.category.value,
            description=expense.description,
            timestamp=timestamp
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create expense: {str(e)}"
        )


@router.get("/expenses/", response_model=ExpenseListResponse)
async def list_expenses(
    limit: int = Query(50, ge=1, le=1000, description="Number of expenses to return"),
    offset: int = Query(0, ge=0, description="Number of expenses to skip"),
    category: Optional[str] = Query(None, description="Filter by category"),
    days: Optional[int] = Query(None, ge=1, description="Filter by days back")
):
    """
    List expenses with optional filtering
    Uses the same database queries as your CLI
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Build query with filters
        query = "SELECT id, amount, category, description, timestamp FROM expenses WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            query += " AND timestamp >= ?"
            params.append(cutoff_date)
        
        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        c.execute(query, params)
        expense_rows = c.fetchall()
        
        # Get total count for pagination
        count_query = "SELECT COUNT(*) FROM expenses WHERE 1=1"
        count_params = []
        if category:
            count_query += " AND category = ?"
            count_params.append(category)
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            count_query += " AND timestamp >= ?"
            count_params.append(cutoff_date)
        
        c.execute(count_query, count_params)
        total_count = c.fetchone()[0]
        
        # Calculate total amount
        amount_query = "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE 1=1"
        amount_params = []
        
        if category:
            amount_query += " AND category = ?"
            amount_params.append(category)
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            amount_query += " AND timestamp >= ?"
            amount_params.append(cutoff_date)
        
        c.execute(amount_query, amount_params)
        total_amount = c.fetchone()[0] or 0
        
        conn.close()
        
        # Convert rows to response format
        expenses = []
        for row in expense_rows:
            expense_dict = expense_row_to_dict(row)
            if expense_dict:
                expenses.append(ExpenseResponse(**expense_dict))
        
        return ExpenseListResponse(
            expenses=expenses,
            total_amount=total_amount,
            count=len(expenses)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch expenses: {str(e)}"
        )


@router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: int):
    """
    Get a specific expense by ID
    Uses your existing get_expense_by_id function
    """
    try:
        expense = get_expense_by_id(expense_id)
        if not expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        expense_dict = expense_row_to_dict(expense)
        if not expense_dict:
            raise HTTPException(status_code=404, detail=f"Expense with ID {expense_id} not found")
        return ExpenseResponse(**expense_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch expense: {str(e)}"
        )


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: int, expense_update: ExpenseUpdate):
    """
    Update an existing expense
    """
    try:
        # Check if expense exists
        existing_expense = get_expense_by_id(expense_id)
        if not existing_expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        conn = get_db_connection()
        c = conn.cursor()
        
        # Build update query with only provided fields
        update_fields = []
        params = []
        
        if expense_update.amount is not None:
            update_fields.append("amount = ?")
            params.append(expense_update.amount)
        
        if expense_update.category is not None:
            update_fields.append("category = ?")
            params.append(expense_update.category.value)
        
        if expense_update.description is not None:
            update_fields.append("description = ?")
            params.append(expense_update.description)
        
        if expense_update.timestamp is not None:
            update_fields.append("timestamp = ?")
            params.append(expense_update.timestamp.isoformat())
        
        if not update_fields:
            # No fields to update
            expense_dict = expense_row_to_dict(existing_expense)
            if not expense_dict:
                raise HTTPException(status_code=500, detail="Failed to retrieve expense data")
            return ExpenseResponse(**expense_dict)
        
        # Execute update
        query = f"UPDATE expenses SET {', '.join(update_fields)} WHERE id = ?"
        params.append(expense_id)
        
        c.execute(query, params)
        conn.commit()
        conn.close()
        
        # Return updated expense
        updated_expense = get_expense_by_id(expense_id)
        expense_dict = expense_row_to_dict(updated_expense)
        if not expense_dict:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated expense")
        return ExpenseResponse(**expense_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update expense: {str(e)}"
        )


@router.delete("/expenses/{expense_id}", response_model=SuccessResponse)
async def delete_expense(expense_id: int):
    """
    Delete an expense by ID
    Uses similar logic to your CLI delete function
    """
    try:
        # Check if expense exists
        expense = get_expense_by_id(expense_id)
        if not expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        conn = get_db_connection()
        c = conn.cursor()
        
        # Delete the expense
        c.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
        
        if c.rowcount == 0:
            conn.close()
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        conn.commit()
        conn.close()
        
        return SuccessResponse(
            message=f"Expense {expense_id} deleted successfully",
            data={"deleted_expense_id": expense_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete expense: {str(e)}"
        ) 


@router.post("/expenses/{expense_id}/parse-grocery-items", response_model=SuccessResponse)
async def parse_grocery_items(expense_id: int):
    """
    Parse grocery items from an expense description
    This will use AI (Gemma3n) to extract individual grocery items
    """
    try:
        # Check if expense exists
        expense = get_expense_by_id(expense_id)
        if not expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        # Extract expense details
        expense_id, amount, category, description, timestamp = expense
        
        # Only parse grocery expenses
        if category != 'groceries':
            raise HTTPException(
                status_code=400,
                detail="Only grocery expenses can be parsed for items"
            )
        
        # Parse grocery items using AI (placeholder for now)
        parsed_items = parse_grocery_items_with_ai(description)
        
        # Save parsed items to database
        conn = get_db_connection()
        c = conn.cursor()
        
        # Clear existing items for this expense
        c.execute("DELETE FROM grocery_items WHERE expense_id = ?", (expense_id,))
        
        # Insert new items
        for item in parsed_items:
            c.execute('''
                INSERT INTO grocery_items (expense_id, item_name, date_purchased, is_consumed)
                VALUES (?, ?, ?, ?)
            ''', (expense_id, item, timestamp, False))
        
        conn.commit()
        conn.close()
        
        return SuccessResponse(
            message=f"Parsed {len(parsed_items)} items from grocery expense",
            data={
                "expense_id": expense_id,
                "items": parsed_items
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse grocery items: {str(e)}"
        )


@router.get("/expenses/{expense_id}/grocery-items")
async def get_grocery_items_for_expense(expense_id: int):
    """
    Get all grocery items for a specific expense
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Get grocery items for this expense
        c.execute('''
            SELECT id, item_name, date_purchased, is_consumed 
            FROM grocery_items 
            WHERE expense_id = ? 
            ORDER BY item_name
        ''', (expense_id,))
        
        items = c.fetchall()
        conn.close()
        
        return {
            "expense_id": expense_id,
            "items": [{
                "id": item[0],
                "name": item[1],
                "date_purchased": item[2],
                "is_consumed": item[3]
            } for item in items]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get grocery items: {str(e)}"
        )


@router.get("/grocery-items")
async def get_all_grocery_items():
    """
    Get all grocery items across all expenses
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Get all grocery items with expense details
        c.execute('''
            SELECT gi.id, gi.item_name, gi.date_purchased, gi.is_consumed, 
                   gi.expense_id, e.amount, e.description
            FROM grocery_items gi
            JOIN expenses e ON gi.expense_id = e.id
            ORDER BY gi.date_purchased DESC, gi.item_name
        ''')
        
        items = c.fetchall()
        conn.close()
        
        return {
            "items": [{
                "id": item[0],
                "name": item[1],
                "date_purchased": item[2],
                "is_consumed": item[3],
                "expense_id": item[4],
                "expense_amount": item[5],
                "expense_description": item[6]
            } for item in items]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get grocery items: {str(e)}"
        )


def parse_grocery_items_with_ai(description: str) -> List[str]:
    """
    Parse grocery items from description using AI
    This is a placeholder function - will integrate with Gemma3n later
    """
    # Simple regex-based parsing for now
    import re
    
    # Convert to lowercase for easier matching
    text = description.lower()
    
    # Common grocery items patterns
    grocery_keywords = [
        'milk', 'eggs', 'bread', 'butter', 'cheese', 'yogurt', 'chicken', 'beef', 
        'fish', 'salmon', 'tuna', 'rice', 'pasta', 'tomatoes', 'potatoes', 'onions',
        'carrots', 'bananas', 'apples', 'oranges', 'lettuce', 'spinach', 'broccoli',
        'peppers', 'cucumber', 'avocado', 'berries', 'strawberries', 'grapes',
        'cereal', 'oatmeal', 'soup', 'sauce', 'oil', 'vinegar', 'salt', 'pepper',
        'flour', 'sugar', 'coffee', 'tea', 'juice', 'water', 'soda', 'beer', 'wine'
    ]
    
    # Find items that match our keywords
    found_items = []
    for keyword in grocery_keywords:
        if keyword in text:
            found_items.append(keyword)
    
    # If no specific items found, try to split by common separators
    if not found_items:
        # Remove common non-food words
        text = re.sub(r'\b(grocery|store|shopping|trip|bought|got|purchased|at|the|and|some|from)\b', '', text)
        # Split by common separators
        potential_items = re.split(r'[,\s]+', text.strip())
        # Filter out empty strings and very short words
        found_items = [item for item in potential_items if len(item) > 2]
    
    # Remove duplicates and return
    return list(set(found_items)) if found_items else ['groceries']


@router.post("/parse-grocery-items")
async def parse_grocery_items_only(request: dict):
    """
    Parse grocery items from a description without creating an expense
    Used for the grocery flow preview step
    """
    try:
        description = request.get('description', '')
        if not description.strip():
            raise HTTPException(
                status_code=400,
                detail="Description is required"
            )
        
        # Parse grocery items using AI (placeholder for now)
        parsed_items = parse_grocery_items_with_ai(description)
        
        return {
            "items": parsed_items,
            "description": description
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse grocery items: {str(e)}"
        )


@router.post("/grocery-items/add")
async def add_grocery_item_directly(request: dict):
    """
    Add a grocery item directly to the pantry without creating an expense
    """
    try:
        item_name = request.get('name', '').strip()
        if not item_name:
            raise HTTPException(
                status_code=400,
                detail="Item name is required"
            )
        
        # Create a dummy expense for the grocery item
        conn = get_db_connection()
        c = conn.cursor()
        
        # Insert a minimal expense record (amount 0, category 'groceries')
        c.execute('''
            INSERT INTO expenses (amount, category, description, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (0, 'groceries', f'Added {item_name} to pantry', datetime.now().isoformat()))
        
        expense_id = c.lastrowid
        
        # Insert the grocery item
        c.execute('''
            INSERT INTO grocery_items (expense_id, item_name, date_purchased, is_consumed)
            VALUES (?, ?, ?, ?)
        ''', (expense_id, item_name, datetime.now().isoformat(), False))
        
        item_id = c.lastrowid
        conn.commit()
        conn.close()
        
        return {
            "message": f"Added {item_name} to pantry",
            "item": {
                "id": item_id,
                "name": item_name,
                "expense_id": expense_id,
                "date_purchased": datetime.now().isoformat(),
                "is_consumed": False
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add grocery item: {str(e)}"
        ) 