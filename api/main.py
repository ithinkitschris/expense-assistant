"""
Expense Tracker FastAPI Application

Main entry point for the expense tracker API.
This connects your existing CLI functionality to a web API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import sys
import os

# Add the parent directory to the path so we can import from main.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import route modules (we'll create these next)
from api.routes import expenses, summary
from api.routes.pantry import pantry_router

# Create the FastAPI application
app = FastAPI(
    title="Expense Assistant API",
    description="API for managing expenses, parsing receipts, and getting summaries.",
    version="1.0.0"
)

# Configure CORS to allow React Native to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production (or specify your app's domain)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include your API routers
app.include_router(expenses.router, prefix="/api/v1", tags=["Expenses"])
app.include_router(summary.router, prefix="/api/v1", tags=["Summary"])
app.include_router(pantry_router, prefix="/api/v1", tags=["Pantry"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Expense Assistant API!"}


@app.get("/health")
async def health_check():
    """
    Detailed health check for monitoring
    """
    # Test database connection
    try:
        from api.dependencies import get_db
        db = next(get_db())
        c = db.cursor()
        c.execute("SELECT COUNT(*) FROM expenses")
        result = c.fetchone()
        expense_count = result[0] if result else 0
        db.close()
        database_status = "healthy"
    except Exception as e:
        expense_count = None
        database_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if database_status == "healthy" else "degraded",
        "timestamp": datetime.now().isoformat(),
        "database": {
            "status": database_status,
            "expense_count": expense_count
        },
        "api": {
            "version": "1.0.0",
            "features": ["expense_crud", "ai_parsing", "analytics"]
        }
    }


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """
    Custom 404 handler
    """
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "available_endpoints": [
                "/api/v1/expenses",
                "/api/v1/summary",
                "/docs",
                "/health"
            ]
        }
    )


if __name__ == "__main__":
    import uvicorn
    # Run the server if this file is executed directly
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",  # Accept connections from any IP
        port=8000,
        reload=True,     # Auto-reload on code changes
        log_level="info"
    ) 