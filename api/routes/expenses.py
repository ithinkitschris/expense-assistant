"""
Expense Management API Routes

These endpoints handle all expense-related operations:
- Creating expenses with structured data
- Reading/listing expenses
- Updating expenses
- Deleting expenses
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import sys
import os

# Import dependencies
from api.dependencies import get_db

# Define get_expense_by_id locally to avoid circular import
def get_expense_by_id(expense_id: int, db):
    """Get expense details by ID"""
    c = db.cursor()
    c.execute("SELECT id, amount, category, description, timestamp FROM expenses WHERE id = %s", (expense_id,))
    expense = c.fetchone()
    return expense

# Import our API schemas
from api.models.schemas import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseListResponse,
    SuccessResponse, ErrorResponse
)

# Create the router
router = APIRouter()


def expense_row_to_dict(row):
    """Convert database row to dictionary"""
    if not row:
        return None
    # Handle both tuple (from fetchone) and dict (from RealDictCursor)
    if isinstance(row, dict):
        return {
            "id": row["id"],
            "amount": row["amount"],
            "category": row["category"],
            "description": row["description"],
            "timestamp": datetime.fromisoformat(row["timestamp"]) if row["timestamp"] else None
        }
    else:
        return {
            "id": row[0],
            "amount": row[1],
            "category": row[2], 
            "description": row[3],
            "timestamp": datetime.fromisoformat(row[4]) if row[4] else None
        }


@router.post("/expenses/", response_model=ExpenseResponse)
async def create_expense_structured(request: dict, db = Depends(get_db)):
    """
    Add expense using structured data (form input)
    """
    try:
        print(f"🔍 Raw request data: {request}")
        
        # Parse the request data manually to see what's being sent
        try:
            expense = ExpenseCreate(**request)
        except Exception as validation_error:
            print(f"❌ Validation error: {validation_error}")
            raise HTTPException(
                status_code=422,
                detail=f"Validation error: {str(validation_error)}"
            )
        
        print(f"🔍 Received expense data: {expense}")
        print(f"🔍 Amount: {expense.amount} (type: {type(expense.amount)})")
        print(f"🔍 Category: {expense.category} (type: {type(expense.category)})")
        print(f"🔍 Description: {expense.description} (type: {type(expense.description)})")
        
        c = db.cursor()
        
        # Use current time if no timestamp provided
        timestamp = expense.timestamp or datetime.now()
        
        # Insert the expense
        c.execute('''
            INSERT INTO expenses (amount, category, description, timestamp)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        ''', (expense.amount, expense.category.value, expense.description, timestamp.isoformat()))
        
        expense_id = c.fetchone()[0]
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
        print(f"❌ Error creating expense: {e}")
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
    db = Depends(get_db)
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
            query += " AND category = %s"
            params.append(category)
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            query += " AND timestamp >= %s"
            params.append(cutoff_date)
        
        query += " ORDER BY timestamp DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        c.execute(query, params)
        expense_rows = c.fetchall()
        
        # Get total count for pagination
        count_query = "SELECT COUNT(*) FROM expenses WHERE 1=1"
        count_params = []
        if category:
            count_query += " AND category = %s"
            count_params.append(category)
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            count_query += " AND timestamp >= %s"
            count_params.append(cutoff_date)
        
        c.execute(count_query, count_params)
        total_count = c.fetchone()[0]
        
        # Calculate total amount
        amount_query = "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE 1=1"
        amount_params = []
        
        if category:
            amount_query += " AND category = %s"
            amount_params.append(category)
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            amount_query += " AND timestamp >= %s"
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
async def get_expense(expense_id: int, db = Depends(get_db)):
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
async def update_expense(expense_id: int, expense_update: ExpenseUpdate, db = Depends(get_db)):
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
            update_fields.append("amount = %s")
            params.append(expense_update.amount)
        
        if expense_update.category is not None:
            update_fields.append("category = %s")
            params.append(expense_update.category.value)
        
        if expense_update.description is not None:
            update_fields.append("description = %s")
            params.append(expense_update.description)
        
        if expense_update.timestamp is not None:
            update_fields.append("timestamp = %s")
            params.append(expense_update.timestamp.isoformat())
        
        if not update_fields:
            # No fields to update
            expense_dict = expense_row_to_dict(existing_expense)
            if not expense_dict:
                raise HTTPException(status_code=500, detail="Failed to retrieve expense data")
            return ExpenseResponse(**expense_dict)
        
        # Execute update
        query = f"UPDATE expenses SET {', '.join(update_fields)} WHERE id = %s"
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
async def delete_expense(expense_id: int, db = Depends(get_db)):
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
        c.execute("DELETE FROM expenses WHERE id = %s", (expense_id,))
        
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