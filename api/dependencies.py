import sqlite3
import os

DATABASE_URL = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', 'expenses.db')
)

def get_db():
    """
    FastAPI dependency to get a database connection.
    Yields a connection and ensures it's closed.
    """
    db = sqlite3.connect(DATABASE_URL, check_same_thread=False)
    try:
        yield db
    finally:
        db.close()
