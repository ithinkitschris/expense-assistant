"""
API Data Models and Schemas

These define the structure of data coming into and going out of the API.
Pydantic automatically validates the data and provides clear error messages.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class ExpenseCategory(str, Enum):
    """Valid expense categories"""
    AMAZON = "amazon"
    TRANSPORTATION = "transportation"
    GROCERIES = "groceries"
    PERSONAL = "personal"
    FASHION = "fashion"
    TRAVEL = "travel"
    FOOD = "food"
    MONTHLY = "monthly"
    FURNITURE = "furniture"


class ExpenseCreate(BaseModel):
    """Schema for creating a new expense"""
    amount: float = Field(..., gt=0, description="Expense amount (must be positive)")
    category: ExpenseCategory = Field(..., description="Expense category")
    description: str = Field(..., min_length=1, max_length=500, description="Expense description")
    timestamp: Optional[datetime] = Field(None, description="Expense timestamp (defaults to now)")
    
    class Config:
        # Example for API documentation
        schema_extra = {
            "example": {
                "amount": 12.50,
                "category": "food",
                "description": "lunch at cafe",
                "timestamp": "2024-01-10T12:00:00"
            }
        }


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense"""
    amount: Optional[float] = Field(None, gt=0, description="New expense amount")
    category: Optional[ExpenseCategory] = Field(None, description="New expense category")
    description: Optional[str] = Field(None, min_length=1, max_length=500, description="New expense description")
    timestamp: Optional[datetime] = Field(None, description="New expense timestamp")


class ExpenseResponse(BaseModel):
    """Schema for expense responses"""
    id: int = Field(..., description="Unique expense ID")
    amount: float = Field(..., description="Expense amount")
    category: str = Field(..., description="Expense category")
    description: str = Field(..., description="Expense description")
    timestamp: datetime = Field(..., description="Expense timestamp")
    
    class Config:
        from_attributes = True  # Allows conversion from SQLite rows


class ExpenseListResponse(BaseModel):
    """Schema for listing multiple expenses"""
    expenses: List[ExpenseResponse]
    total_amount: float = Field(..., description="Sum of all expense amounts")
    count: int = Field(..., description="Number of expenses")
    
    class Config:
        schema_extra = {
            "example": {
                "expenses": [
                    {
                        "id": 1,
                        "amount": 12.50,
                        "category": "food",
                        "description": "lunch at cafe",
                        "timestamp": "2024-01-10T12:00:00"
                    }
                ],
                "total_amount": 12.50,
                "count": 1
            }
        }


class NaturalLanguageExpense(BaseModel):
    """Schema for natural language expense input"""
    text: str = Field(..., min_length=1, max_length=500, description="Natural language expense description")
    
    class Config:
        schema_extra = {
            "example": {
                "text": "lunch at starbucks $12.50"
            }
        }


class SummaryRequest(BaseModel):
    """Schema for summary requests"""
    days: Optional[int] = Field(None, ge=1, description="Number of days to look back (default: all time)")
    category: Optional[ExpenseCategory] = Field(None, description="Filter by specific category")


class SummaryResponse(BaseModel):
    """Schema for summary responses"""
    summary_text: str = Field(..., description="AI-generated summary")
    total_amount: float = Field(..., description="Total amount spent")
    expense_count: int = Field(..., description="Number of expenses")
    time_period: str = Field(..., description="Time period covered")
    generated_at: datetime = Field(..., description="When summary was generated")


class ErrorResponse(BaseModel):
    """Schema for error responses"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    
    class Config:
        schema_extra = {
            "example": {
                "error": "Expense not found",
                "detail": "No expense found with ID 123"
            }
        }


class SuccessResponse(BaseModel):
    """Schema for success responses"""
    message: str = Field(..., description="Success message")
    data: Optional[dict] = Field(None, description="Additional response data")
    
    class Config:
        schema_extra = {
            "example": {
                "message": "Expense created successfully",
                "data": {"id": 123}
            }
        } 


class PantryItemResponse(BaseModel):
    id: int
    name: str
    quantity: float = Field(default=1, description="Item quantity")
    unit: str = Field(default="pieces", description="Measurement unit")
    created_at: Optional[str]
    is_consumed: bool
    grocery_type: str = Field(default="other", description="Food category type") 