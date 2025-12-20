"""
Summary and Analytics API Routes

These endpoints provide AI-powered insights and analytics:
- Quick summaries
- Detailed insights 
- Budget analysis
- Custom prompts

All operations use your existing summarize() function and AI logic.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
import sys
import os
from datetime import datetime, timedelta

# Import your existing CLI functions
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from summarize import summarize

# Import our API schemas
from api.models.schemas import SummaryRequest, SummaryResponse, SuccessResponse

# Import dependencies
from api.dependencies import get_db

# Create the router
router = APIRouter()


@router.get("/summary/quick", response_model=SummaryResponse)
async def get_quick_summary(
    days: Optional[int] = Query(None, ge=1, description="Number of days to look back (default: all time)"),
    category: Optional[str] = Query(None, description="Filter by specific category"),
    db = Depends(get_db)
):
    """
    Get a quick 3-4 sentence summary of expenses
    Uses your existing summarize() function with report_type='quick'
    """
    try:
        # Call your existing summarize function
        summary_result = summarize(report_type='quick', timeframe_days=days)
        summary_text = summary_result if summary_result is not None else "Unable to generate summary"
        
        # Get basic statistics for the response
        c = db.cursor()
        
        # Build query with filters
        query = "SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM expenses WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = %s"
            params.append(category)
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            query += " AND timestamp >= %s"
            params.append(cutoff_date)
        
        c.execute(query, params)
        result = c.fetchone()
        count = result[0] if result else 0
        total_amount = result[1] if result else 0
        
        # Determine time period description
        if days:
            time_period = f"Last {days} days"
        else:
            time_period = "All time"
        
        return SummaryResponse(
            summary_text=summary_text,
            total_amount=total_amount or 0,
            expense_count=count or 0,
            time_period=time_period,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quick summary: {str(e)}"
        )


@router.get("/summary/insights", response_model=SummaryResponse)
async def get_insights_summary(
    days: Optional[int] = Query(None, ge=1, description="Number of days to look back (default: all time)"),
    category: Optional[str] = Query(None, description="Filter by specific category"),
    db = Depends(get_db)
):
    """
    Get detailed spending insights and patterns
    Uses your existing summarize() function with report_type='insights'
    """
    try:
        # Call your existing summarize function
        summary_result = summarize(report_type='insights', timeframe_days=days)
        summary_text = summary_result if summary_result is not None else "Unable to generate insights"
        
        # Get basic statistics for the response
        c = db.cursor()
        
        # Build query with filters
        query = "SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM expenses WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = %s"
            params.append(category)
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            query += " AND timestamp >= %s"
            params.append(cutoff_date)
        
        c.execute(query, params)
        result = c.fetchone()
        count = result[0] if result else 0
        total_amount = result[1] if result else 0
        
        # Determine time period description
        if days:
            time_period = f"Last {days} days"
        else:
            time_period = "All time"
        
        return SummaryResponse(
            summary_text=summary_text,
            total_amount=total_amount or 0,
            expense_count=count or 0,
            time_period=time_period,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights summary: {str(e)}"
        )


@router.get("/summary/budget", response_model=SummaryResponse)
async def get_budget_analysis(
    days: Optional[int] = Query(None, ge=1, description="Number of days to look back (default: all time)"),
    category: Optional[str] = Query(None, description="Filter by specific category"),
    db = Depends(get_db)
):
    """
    Get budget analysis and recommendations
    Uses your existing summarize() function with report_type='budget_analysis'
    """
    try:
        # Call your existing summarize function
        summary_result = summarize(report_type='budget_analysis', timeframe_days=days)
        summary_text = summary_result if summary_result is not None else "Unable to generate budget analysis"
        
        # Get basic statistics for the response
        c = db.cursor()
        
        # Build query with filters
        query = "SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM expenses WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = %s"
            params.append(category)
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            query += " AND timestamp >= %s"
            params.append(cutoff_date)
        
        c.execute(query, params)
        result = c.fetchone()
        count = result[0] if result else 0
        total_amount = result[1] if result else 0
        
        # Determine time period description
        if days:
            time_period = f"Last {days} days"
        else:
            time_period = "All time"
        
        return SummaryResponse(
            summary_text=summary_text,
            total_amount=total_amount or 0,
            expense_count=count or 0,
            time_period=time_period,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate budget analysis: {str(e)}"
        )


@router.post("/summary/custom", response_model=SummaryResponse)
async def get_custom_summary(
    prompt: str = Query(..., description="Custom analysis prompt"),
    days: Optional[int] = Query(None, ge=1, description="Number of days to look back (default: all time)"),
    category: Optional[str] = Query(None, description="Filter by specific category"),
    db = Depends(get_db)
):
    """
    Get custom AI analysis with your own prompt
    Uses your existing summarize() function with custom prompt
    """
    try:
        # Call your existing summarize function with custom prompt
        summary_result = summarize(prompt=prompt, timeframe_days=days)
        summary_text = summary_result if summary_result is not None else "Unable to generate custom summary"
        
        # Get basic statistics for the response
        c = db.cursor()
        
        # Build query with filters
        query = "SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM expenses WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = %s"
            params.append(category)
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            query += " AND timestamp >= %s"
            params.append(cutoff_date)
        
        c.execute(query, params)
        result = c.fetchone()
        count = result[0] if result else 0
        total_amount = result[1] if result else 0
        
        # Determine time period description
        if days:
            time_period = f"Last {days} days"
        else:
            time_period = "All time"
        
        return SummaryResponse(
            summary_text=summary_text,
            total_amount=total_amount or 0,
            expense_count=count or 0,
            time_period=time_period,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate custom summary: {str(e)}"
        )


@router.get("/summary/categories", response_model=dict)
async def get_category_breakdown(
    days: Optional[int] = Query(None, ge=1, description="Number of days to look back (default: all time)"),
    db = Depends(get_db)
):
    """
    Get spending breakdown by category
    """
    try:
        c = db.cursor()
        
        # Build query with optional time filter
        query = """
            SELECT category, COUNT(*) as count, COALESCE(SUM(amount), 0) as total, COALESCE(AVG(amount), 0) as average
            FROM expenses 
            WHERE 1=1
        """
        params = []
        
        if days:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            query += " AND timestamp >= %s"
            params.append(cutoff_date)
        
        query += " GROUP BY category ORDER BY total DESC"
        
        c.execute(query, params)
        results = c.fetchall()
        
        # Format results
        categories = []
        total_spent = 0
        
        for row in results:
            category_data = {
                "category": row[0],
                "count": row[1],
                "total": row[2],
                "average": row[3]
            }
            categories.append(category_data)
            total_spent += row[2]
        
        # Add percentages
        for category in categories:
            if total_spent > 0:
                category["percentage"] = (category["total"] / total_spent) * 100
            else:
                category["percentage"] = 0
        
        # Determine time period description
        if days:
            time_period = f"Last {days} days"
        else:
            time_period = "All time"
        
        return {
            "categories": categories,
            "total_spent": total_spent,
            "time_period": time_period,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate category breakdown: {str(e)}"
        ) 