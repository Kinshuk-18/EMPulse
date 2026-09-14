"""
main.py — EMPulse Backend
==========================
Entry point for the FastAPI application.

Responsibilities:
  1. Create the FastAPI application instance.
  2. Register CORS middleware so the React frontend can call the API.
  3. Auto-create MySQL tables on server startup (if they don't exist yet).
  4. Define API routes:
       GET /               → health check
       GET /api/trainees   → list all trainees

Run the server with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

# Internal modules
from database import engine, get_db, Base
import models  # importing models registers them with Base so create_all knows about them


# ════════════════════════════════════════════════════════════════════════════
# Pydantic Response Schemas
# These define the *shape of data* returned by the API.
# Pydantic automatically validates and serialises the SQLAlchemy ORM objects.
# ════════════════════════════════════════════════════════════════════════════

class TraineeResponse(BaseModel):
    """
    Schema for a single trainee returned by the API.
    Only exposes safe fields — Aadhaar last-four is intentionally kept since
    it's already partial, but you can remove it for extra caution.
    """
    id: int
    name: str
    phone: str
    aadhaar_last_four: str
    institute_name: str
    course_name: str
    graduation_date: datetime
    current_status: str          # will be the string value of the enum, e.g. "Employed"
    district: str

    class Config:
        # 'from_attributes' (Pydantic v2) or 'orm_mode' (Pydantic v1)
        # tells Pydantic to read data from ORM object attributes, not dicts.
        from_attributes = True   # Pydantic v2


# ════════════════════════════════════════════════════════════════════════════
# Lifespan — startup & shutdown logic (modern FastAPI pattern)
# ════════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager runs code at server startup (before yield)
    and at server shutdown (after yield).

    On startup:
      create_all() inspects all classes that inherit from Base (our ORM models)
      and creates any tables that don't yet exist in MySQL.
      It does NOT drop or modify existing tables — safe to run every startup.
    """
    print("🚀 EMPulse API starting up …")
    print("📦 Creating database tables (if they don't exist) …")

    # This call reads models.py's Trainee and OutcomeLog class definitions
    # and issues CREATE TABLE IF NOT EXISTS statements to MySQL.
    Base.metadata.create_all(bind=engine)

    print("✅ Database tables are ready.")
    yield  # ← server is running and handling requests here
    print("🛑 EMPulse API shutting down …")


# ════════════════════════════════════════════════════════════════════════════
# FastAPI Application Instance
# ════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="EMPulse API",
    description=(
        "Longitudinal skilling outcome tracking platform. "
        "Tracks employment outcomes of vocational trainees at 3, 6, and 12 months "
        "after course completion — SIH26135 Schema."
    ),
    version="1.0.0",
    lifespan=lifespan,   # registers our startup/shutdown logic
)


# ════════════════════════════════════════════════════════════════════════════
# CORS Middleware
# ════════════════════════════════════════════════════════════════════════════
# CORS (Cross-Origin Resource Sharing) is a browser security feature that
# blocks JavaScript running on one domain from calling an API on another.
#
# For development, we allow ALL origins ("*").
# ⚠️  For production, replace "*" with the actual frontend URL, e.g.:
#       allow_origins=["https://empulse.vercel.app"]
# ════════════════════════════════════════════════════════════════════════════

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow requests from any origin (dev mode)
    allow_credentials=True,       # allow cookies / auth headers
    allow_methods=["*"],          # allow GET, POST, PUT, DELETE, OPTIONS, etc.
    allow_headers=["*"],          # allow any request header
)


# ════════════════════════════════════════════════════════════════════════════
# Routes
# ════════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    Useful for:
      - Confirming the server is running (e.g., after deploying).
      - Uptime monitoring tools (ping this every 30 s).
      - A quick sanity check during hackathon demos.

    Returns:
        dict: A simple status message.
    """
    return {"status": "EMPulse API is running"}


@app.get(
    "/api/trainees",
    response_model=List[TraineeResponse],   # FastAPI validates the output shape
    tags=["Trainees"],
    summary="List all trainees",
    description="Returns every trainee registered in the EMPulse system.",
)
def get_all_trainees(db: Session = Depends(get_db)):
    """
    Fetch and return all trainees from the `trainees` table.

    How Depends(get_db) works:
      FastAPI sees the  db: Session = Depends(get_db)  parameter and calls
      get_db() automatically before this function runs.  get_db() opens a
      database session, hands it to us via  yield, and closes it when we're done.

    Args:
        db (Session): SQLAlchemy database session (injected by FastAPI).

    Returns:
        List[TraineeResponse]: A list of trainee records.

    Raises:
        HTTPException 500: If the database query fails unexpectedly.
    """
    try:
        # db.query(models.Trainee) → SELECT * FROM trainees
        # .all()                   → fetch every row as a list of Trainee objects
        trainees = db.query(models.Trainee).all()
        return trainees

    except Exception as exc:
        # Log the error (in production, use Python's logging module)
        print(f"❌ Database error in /api/trainees: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch trainees from the database.",
        )
