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
from api.dependencies import get_db
from api.utils.parsing import parse_grocery_items_and_categories

# Define get_expense_by_id locally to avoid circular import
def get_expense_by_id(expense_id: int, db: sqlite3.Connection):
    """Get expense details by ID"""
    c = db.cursor()
    c.execute("SELECT id, amount, category, description, timestamp FROM expenses WHERE id = ?", (expense_id,))
    expense = c.fetchone()
    return expense

# Import our API schemas
from api.models.schemas import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseListResponse,
    NaturalLanguageExpense, SuccessResponse, ErrorResponse
)

# Create the router
router = APIRouter()


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
async def create_expense_structured(expense: ExpenseCreate, db: sqlite3.Connection = Depends(get_db)):
    """
    Add expense using structured data (form input)
    """
    try:
        c = db.cursor()
        
        # Use current time if no timestamp provided
        timestamp = expense.timestamp or datetime.now()
        
        # Insert the expense
        c.execute('''
            INSERT INTO expenses (amount, category, description, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (expense.amount, expense.category.value, expense.description, timestamp.isoformat()))
        
        expense_id = c.lastrowid
        db.commit()
        
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
    days: Optional[int] = Query(None, ge=1, description="Filter by days back"),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    List expenses with optional filtering
    Uses the same database queries as your CLI
    """
    try:
        c = db.cursor()
        
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
async def get_expense(expense_id: int, db: sqlite3.Connection = Depends(get_db)):
    """
    Get a specific expense by ID
    Uses your existing get_expense_by_id function
    """
    try:
        expense = get_expense_by_id(expense_id, db)
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
async def update_expense(expense_id: int, expense_update: ExpenseUpdate, db: sqlite3.Connection = Depends(get_db)):
    """
    Update an existing expense
    """
    try:
        # Check if expense exists
        existing_expense = get_expense_by_id(expense_id, db)
        if not existing_expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        c = db.cursor()
        
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
        db.commit()
        
        # Return updated expense
        updated_expense = get_expense_by_id(expense_id, db)
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
async def delete_expense(expense_id: int, db: sqlite3.Connection = Depends(get_db)):
    """
    Delete an expense by ID
    Uses similar logic to your CLI delete function
    """
    try:
        # Check if expense exists
        expense = get_expense_by_id(expense_id, db)
        if not expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        c = db.cursor()
        
        # Delete the expense
        c.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
        
        if c.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        db.commit()
        
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

@router.post("/expenses/{expense_id}/parse-grocery-to-pantry", response_model=SuccessResponse)
async def parse_grocery_to_pantry(expense_id: int, db: sqlite3.Connection = Depends(get_db)):
    """
    Parse a grocery expense description and add the items to the pantry
    """
    try:
        # Get the expense to extract the description
        expense = get_expense_by_id(expense_id, db)
        if not expense:
            raise HTTPException(
                status_code=404,
                detail=f"Expense with ID {expense_id} not found"
            )
        
        description = expense[3]  # description is the 4th column (index 3)
        if not description or not description.strip():
            raise HTTPException(
                status_code=400,
                detail="Expense has no description to parse"
            )
        
        # Parse the description into grocery items using the unified parsing function
        parsed_items = parse_grocery_items_and_categories(description)
        
        if not parsed_items:
            raise HTTPException(
                status_code=400,
                detail="No grocery items found in the expense description"
            )
        
        # Add each parsed item to the pantry
        c = db.cursor()
        added_items = []
        
        for item in parsed_items:
            grocery_type = item["category"]
            item_name = item["item"]
            
            c.execute('''
                INSERT INTO pantry_items (name, quantity, unit, created_at, is_consumed, grocery_type)
                VALUES (?, ?, ?, datetime('now'), ?, ?)
            ''', (item_name, 1, 'pieces', False, grocery_type))
            
            added_items.append({
                "name": item_name,
                "category": grocery_type
            })
        
        db.commit()
        
        return SuccessResponse(
            message=f"Successfully parsed and added {len(added_items)} items to pantry",
            data={
                "expense_id": expense_id,
                "parsed_items": added_items,
                "original_description": description
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse grocery to pantry: {str(e)}"
        ) 