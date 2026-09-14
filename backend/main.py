"""
main.py — EMPulse Backend
==========================
Entry point for the FastAPI application.

Responsibilities:
  1. Create the FastAPI application instance.
  2. Register CORS middleware so the React frontend can call the API.
  3. Auto-create MySQL tables on server startup via the lifespan event.
  4. Define API routes:
       GET  /                → health check
       POST /api/trainees    → register a new trainee
       GET  /api/trainees    → list all trainees
       POST /api/outcomes    → log a check-in AND update trainee status atomically

Run the server with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# ── Internal modules ──────────────────────────────────────────────────────────
# database.py  → engine (DB connection), get_db (session factory), Base (ORM parent)
# models.py    → Trainee + OutcomeLog ORM classes (map to MySQL tables)
# schemas.py   → Pydantic validation schemas for request/response bodies
from database import engine, get_db, Base
import models
import schemas


# ════════════════════════════════════════════════════════════════════════════
# Lifespan — startup & shutdown logic (modern FastAPI pattern, replaces @app.on_event)
# ════════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager: code BEFORE yield runs at startup;
    code AFTER yield runs at shutdown.

    On startup:
      Base.metadata.create_all() inspects every class that inherits from Base
      (Trainee and OutcomeLog) and issues CREATE TABLE IF NOT EXISTS to MySQL.
      It never drops or alters existing tables — safe to call on every boot.
    """
    print("🚀 EMPulse API starting up …")
    print("📦 Creating database tables (if they don't exist) …")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables are ready.")
    yield   # ← the server is live and processing requests here
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
    lifespan=lifespan,  # wire up our startup/shutdown logic
)


# ════════════════════════════════════════════════════════════════════════════
# CORS Middleware
# ════════════════════════════════════════════════════════════════════════════
# CORS (Cross-Origin Resource Sharing) is a browser security mechanism that
# blocks a web page from making requests to a different domain than the one
# that served the page.
#
# Example: React dev server runs on  http://localhost:5173
#          FastAPI runs on           http://localhost:8000
# Without CORS headers, the browser will refuse the API call.
#
# ⚠️  allow_origins=["*"] is fine for development/hackathons.
#     In production, restrict to: allow_origins=["https://empulse.vercel.app"]
# ════════════════════════════════════════════════════════════════════════════

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # accept requests from any origin
    allow_credentials=True,   # allow cookies and Authorization headers
    allow_methods=["*"],      # accept GET, POST, PUT, DELETE, OPTIONS, etc.
    allow_headers=["*"],      # accept any custom request headers
)


# ════════════════════════════════════════════════════════════════════════════
# ROUTE 1 — Health Check
# GET /
# ════════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def health_check():
    """
    Ping endpoint to confirm the API server is alive.
    Useful for uptime monitors and quick sanity checks during demos.
    """
    return {"status": "EMPulse API is running ✅"}


# ════════════════════════════════════════════════════════════════════════════
# ROUTE 2 — Register a New Trainee
# POST /api/trainees
# ════════════════════════════════════════════════════════════════════════════

@app.post(
    "/api/trainees",
    response_model=schemas.TraineeResponse,  # what the API returns after creation
    status_code=201,                          # HTTP 201 Created (not 200)
    tags=["Trainees"],
    summary="Register a new trainee",
    description=(
        "Creates a new trainee record in the database. "
        "Returns the newly created trainee including the auto-generated `id`."
    ),
)
def create_trainee(
    trainee_data: schemas.TraineeCreate,  # Pydantic auto-validates the incoming JSON
    db: Session = Depends(get_db),        # FastAPI injects an open DB session
):
    """
    Accepts a JSON body matching  schemas.TraineeCreate, writes it to MySQL,
    and returns the persisted row as  schemas.TraineeResponse.

    Step-by-step:
      1. Pydantic validates the request body (before this function even runs).
      2. We unpack the validated data into a  models.Trainee  ORM object.
      3. db.add()     → stages the INSERT (not yet sent to MySQL).
      4. db.commit()  → sends the INSERT and commits the transaction.
      5. db.refresh() → re-reads the row from MySQL to get the auto-generated  id.
      6. Return the ORM object — FastAPI + Pydantic serialise it automatically.

    Args:
        trainee_data (schemas.TraineeCreate): Validated incoming JSON body.
        db (Session): SQLAlchemy DB session (injected by Depends).

    Returns:
        schemas.TraineeResponse: The newly created trainee, including  id.

    Raises:
        HTTPException 400: If a trainee with the same phone already exists.
        HTTPException 500: For any unexpected database error.
    """
    try:
        # Build the ORM object from the validated Pydantic data.
        # model_dump() converts the Pydantic model → plain Python dict.
        # The ** unpacks the dict as keyword arguments to models.Trainee().
        new_trainee = models.Trainee(**trainee_data.model_dump())

        db.add(new_trainee)      # stage the INSERT
        db.commit()              # commit the transaction to MySQL
        db.refresh(new_trainee)  # populate new_trainee.id from the DB auto-increment

        return new_trainee       # Pydantic + schemas.TraineeResponse serialise this

    except Exception as exc:
        db.rollback()  # undo any partial writes if something went wrong
        error_str = str(exc).lower()

        # Detect duplicate phone (MySQL UNIQUE constraint violation)
        if "duplicate entry" in error_str or "unique constraint" in error_str:
            raise HTTPException(
                status_code=400,
                detail="A trainee with this phone number already exists.",
            )

        print(f"❌ Database error in POST /api/trainees: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create trainee. Please try again.",
        )


# ════════════════════════════════════════════════════════════════════════════
# ROUTE 3 — List All Trainees
# GET /api/trainees
# ════════════════════════════════════════════════════════════════════════════

@app.get(
    "/api/trainees",
    response_model=List[schemas.TraineeResponse],  # a list of validated trainees
    tags=["Trainees"],
    summary="List all trainees",
    description="Returns every trainee registered in the EMPulse system.",
)
def get_all_trainees(db: Session = Depends(get_db)):
    """
    Fetches all rows from the  trainees  table and returns them.

    How Depends(get_db) works:
      FastAPI calls get_db() automatically, which opens a DB session via
      SessionLocal(), yields it here as  db, then closes it when we return.

    Args:
        db (Session): SQLAlchemy DB session injected by FastAPI.

    Returns:
        List[schemas.TraineeResponse]: All trainees in the system.

    Raises:
        HTTPException 500: If the database query fails.
    """
    try:
        # SELECT * FROM trainees  →  list of Trainee ORM objects
        trainees = db.query(models.Trainee).all()
        return trainees

    except Exception as exc:
        print(f"❌ Database error in GET /api/trainees: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch trainees from the database.",
        )


# ════════════════════════════════════════════════════════════════════════════
# ROUTE 4 — Log a Check-in Outcome (ATOMIC DUAL-WRITE)
# POST /api/outcomes
# ════════════════════════════════════════════════════════════════════════════

@app.post(
    "/api/outcomes",
    response_model=schemas.OutcomeLogResponse,  # returns the new OutcomeLog row
    status_code=201,
    tags=["Outcomes"],
    summary="Log a check-in outcome and update trainee status",
    description=(
        "Records a longitudinal check-in event for a trainee (3, 6, or 12 months). "
        "In a SINGLE database transaction, this endpoint: "
        "(1) creates a new OutcomeLog entry, AND "
        "(2) updates the trainee's current_status. "
        "If either operation fails, both are rolled back — no partial state."
    ),
)
def log_outcome(
    outcome_data: schemas.OutcomeLogCreate,  # Pydantic validates the incoming JSON
    db: Session = Depends(get_db),
):
    """
    This is the most important endpoint in EMPulse — it handles the check-in
    event that is the core of the SIH26135 longitudinal tracking requirement.

    WHY ONE TRANSACTION FOR TWO WRITES?
      The business rule is: if we record a check-in, the trainee's status
      must be updated in the same moment. We never want a situation where
      the log exists but the trainee's status is stale (or vice versa).
      Wrapping both in one transaction with a single db.commit() guarantees
      atomicity — either BOTH writes succeed, or NEITHER does.

    Step-by-step:
      1. Pydantic validates the body (trainee_id, checkin_month, verification_source, new_status).
      2. Look up the Trainee row — 404 if not found.
      3. Create an OutcomeLog ORM object (WITHOUT new_status — it's not a DB column).
      4. Update trainee.current_status with new_status.
      5. db.add(new_log)  → stage the OutcomeLog INSERT.
      6. db.commit()      → commit BOTH the INSERT and the UPDATE together.
      7. db.refresh()     → reload the log to get the auto-generated id + logged_at.
      8. Return the OutcomeLog row.

    Args:
        outcome_data (schemas.OutcomeLogCreate): Validated incoming JSON body.
        db (Session): SQLAlchemy DB session injected by FastAPI.

    Returns:
        schemas.OutcomeLogResponse: The newly created outcome log entry.

    Raises:
        HTTPException 404: If no trainee with the given  trainee_id  exists.
        HTTPException 500: For any unexpected database error.
    """
    # ── Step 1: Verify the trainee exists ────────────────────────────────────
    # SELECT * FROM trainees WHERE id = :trainee_id LIMIT 1
    trainee = db.query(models.Trainee).filter(
        models.Trainee.id == outcome_data.trainee_id
    ).first()

    if trainee is None:
        # Return a clear 404 so the frontend can show a helpful error message.
        raise HTTPException(
            status_code=404,
            detail=f"Trainee with id={outcome_data.trainee_id} not found.",
        )

    try:
        # ── Step 2: Build the OutcomeLog ORM object ───────────────────────────
        # We must NOT pass  new_status  here — it's a Pydantic-only field used
        # to drive the status update below; it does NOT exist in the DB table.
        new_log = models.OutcomeLog(
            trainee_id=outcome_data.trainee_id,
            checkin_month=outcome_data.checkin_month,
            verification_source=outcome_data.verification_source,
            # logged_at is auto-filled by the DB column default (datetime.utcnow)
        )

        # ── Step 3: Update the trainee's current status ───────────────────────
        # SQLAlchemy tracks changes to objects loaded in this session.
        # Changing an attribute here will generate an UPDATE statement on commit.
        # We cast to the enum so MySQL's ENUM column type accepts it cleanly.
        trainee.current_status = models.TraineeStatus(outcome_data.new_status)

        # ── Step 4: Stage + commit BOTH writes in a single transaction ─────────
        db.add(new_log)   # stage: INSERT INTO outcome_logs (…) VALUES (…)
                          # trainee.current_status change is already tracked by SQLAlchemy

        db.commit()       # ATOMIC COMMIT: INSERT + UPDATE happen together
                          # If MySQL throws an error, neither write is persisted.

        # ── Step 5: Reload to get auto-generated values (id, logged_at) ───────
        db.refresh(new_log)

        return new_log    # Pydantic + schemas.OutcomeLogResponse serialise this

    except HTTPException:
        raise  # re-raise 404s without wrapping them in a 500

    except Exception as exc:
        db.rollback()  # undo BOTH the INSERT and the UPDATE
        print(f"❌ Database error in POST /api/outcomes: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to log outcome. Please try again.",
        )
