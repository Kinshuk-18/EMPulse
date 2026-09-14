"""
database.py — EMPulse Backend
==============================
Responsibilities:
  1. Load DATABASE_URL from the .env file (never hard-code credentials).
  2. Create the SQLAlchemy 'engine' that knows how to talk to MySQL.
  3. Create 'SessionLocal' — a factory that produces individual DB sessions.
  4. Create 'Base' — the parent class all ORM models will inherit from.
  5. Expose get_db() — a FastAPI dependency that opens a session per request
     and closes it cleanly when the request is done.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    connect_args={"ssl": {"ssl_mode": "REQUIRED"}}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()