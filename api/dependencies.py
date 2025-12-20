import psycopg2
from psycopg2.extras import RealDictCursor
import os

# Try DATABASE_PUBLIC_URL first (Railway public proxy), fall back to DATABASE_URL
DATABASE_URL = os.getenv('DATABASE_PUBLIC_URL') or os.getenv('DATABASE_URL')

def get_db():
    """
    FastAPI dependency to get a database connection.
    Yields a connection and ensures it's closed.
    """
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()
