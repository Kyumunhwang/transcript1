"""
Database configuration and session management.
Supports PostgreSQL (Production / Vercel Neon / Supabase) and SQLite (Local Fallback).
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from backend.models import Base

# Ensure stdout handles UTF-8
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Load environment variables
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

DATABASE_URL = os.environ.get("DATABASE_URL", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
SQLITE_PATH = DATA_DIR / "lighthouse_sis.db"

def get_engine():
    """
    Connect to PostgreSQL if available, otherwise safely fallback to SQLite.
    Returns:
        tuple[Engine, str]: The SQLAlchemy engine and a status description string.
    """
    if DATABASE_URL and DATABASE_URL.startswith("postgres"):
        pg_url = DATABASE_URL
        # Normalize dialect if needed
        if pg_url.startswith("postgres://"):
            pg_url = pg_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif pg_url.startswith("postgresql://") and not pg_url.startswith("postgresql+"):
            pg_url = pg_url.replace("postgresql://", "postgresql+psycopg://", 1)

        try:
            pg_engine = create_engine(
                pg_url,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3}
            )
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return pg_engine, f"Connected to PostgreSQL ({DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'remote'})"
        except Exception as e:
            print(f"[Warning] Could not connect to PostgreSQL ({e}). Using local SQLite at {SQLITE_PATH}")

    # Fallback SQLite
    sqlite_url = f"sqlite:///{SQLITE_PATH}"
    sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    return sqlite_engine, f"Connected to Local SQLite Database ({SQLITE_PATH})"

engine, DB_STATUS = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all tables in the database if they do not exist."""
    Base.metadata.create_all(bind=engine)
    print(f"[Database Init] Tables initialized successfully. Status: {DB_STATUS}")

def get_db_session() -> Session:
    """Yield a database session."""
    session = SessionLocal()
    return session
