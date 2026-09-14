"""
schemas.py — EMPulse Backend
==============================
Pydantic v2 data validation schemas for the EMPulse API.

WHY SCHEMAS EXIST (separate from models.py):
  - models.py  = how data is STORED in MySQL (SQLAlchemy ORM layer)
  - schemas.py = how data is VALIDATED at the API boundary (Pydantic layer)

The two layers are intentionally separate so we can:
  • Accept only the fields we need (no extra/missing fields)
  • Return only the fields we want to expose (no leaking internal DB columns)
  • Enforce types, lengths, and business rules before touching the DB

INHERITANCE PATTERN USED HERE:
  TraineeBase          ← shared fields (name, phone, …)
      └── TraineeCreate    ← what the frontend SENDS  (POST body)
      └── TraineeResponse  ← what the API RETURNS     (GET response)

This avoids repeating field definitions and keeps schemas DRY.

Python version : 3.10+
Pydantic version: v2 (uses  model_config  dict, NOT the inner  class Config)
"""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


# ════════════════════════════════════════════════════════════════════════════
# ① TRAINEE SCHEMAS
# ════════════════════════════════════════════════════════════════════════════

class TraineeBase(BaseModel):
    """
    Shared fields that appear in BOTH the create (input) and response (output)
    schemas for a Trainee.

    Any field defined here is automatically available in TraineeCreate and
    TraineeResponse through Python class inheritance — no repetition needed.

    Field() lets us attach metadata like description and example values,
    which automatically appear in the /docs Swagger UI at runtime.
    """

    name: str = Field(
        ...,                            # '...' means this field is REQUIRED
        min_length=2,
        max_length=150,
        description="Full name of the trainee.",
        examples=["Priya Sharma"],
    )

    phone: str = Field(
        ...,
        min_length=10,
        max_length=15,
        description="10-digit mobile number (stored as string to preserve leading zero).",
        examples=["9876543210"],
    )

    aadhaar_last_four: str = Field(
        ...,
        min_length=4,
        max_length=4,
        description="Last 4 digits of the trainee's Aadhaar card (NOT the full number).",
        examples=["5678"],
    )

    institute_name: str = Field(
        ...,
        max_length=200,
        description="Name of the training institute or ITI.",
        examples=["Government ITI Bhopal"],
    )

    course_name: str = Field(
        ...,
        max_length=200,
        description="Skill/vocational course the trainee completed.",
        examples=["Electrician (NSQF Level 4)"],
    )

    current_status: str = Field(
        ...,
        description=(
            "Current employment status. "
            "Allowed values: 'Employed', 'Self-Employed', 'Searching', 'Unemployed'."
        ),
        examples=["Searching"],
    )

    district: str = Field(
        ...,
        max_length=100,
        description="District where the trainee resides.",
        examples=["Bhopal"],
    )

    # ── Field Validators (run automatically before the model is created) ──────

    @field_validator("aadhaar_last_four")
    @classmethod
    def must_be_digits(cls, value: str) -> str:
        """
        Ensure the Aadhaar fragment is exactly 4 numeric characters.
        Raises a ValueError if the client sends e.g. 'AB12' or '12'.
        """
        if not value.isdigit():
            raise ValueError("aadhaar_last_four must contain only digits (0-9).")
        return value

    @field_validator("phone")
    @classmethod
    def must_be_numeric_phone(cls, value: str) -> str:
        """
        Strip any spaces or dashes the client might send, then verify that
        the result is all digits (standard Indian mobile number format).
        """
        cleaned = value.replace(" ", "").replace("-", "")
        if not cleaned.isdigit():
            raise ValueError("phone must contain only digits (may include spaces/dashes).")
        return cleaned

    @field_validator("current_status")
    @classmethod
    def validate_status_value(cls, value: str) -> str:
        """
        Keep the allowed status values in sync with models.TraineeStatus enum.
        This Pydantic-layer check catches bad values before they hit the DB.
        """
        allowed = {"Employed", "Self-Employed", "Searching", "Unemployed"}
        if value not in allowed:
            raise ValueError(
                f"current_status must be one of: {', '.join(sorted(allowed))}."
            )
        return value


# ────────────────────────────────────────────────────────────────────────────
# TraineeCreate — the shape of the JSON body the frontend POSTs to /api/trainees
# ────────────────────────────────────────────────────────────────────────────
class TraineeCreate(TraineeBase):
    """
    Schema for CREATING a new trainee.

    Inherits all fields from TraineeBase.
    Adds  graduation_date  because the frontend must supply it when
    registering a new trainee, but we don't want to expose it in the base
    (it's only relevant at creation time and in the full response).

    Example JSON body the React frontend would POST:
    {
        "name": "Priya Sharma",
        "phone": "9876543210",
        "aadhaar_last_four": "5678",
        "institute_name": "Government ITI Bhopal",
        "course_name": "Electrician (NSQF Level 4)",
        "current_status": "Searching",
        "district": "Bhopal",
        "graduation_date": "2025-06-15T00:00:00"
    }
    """

    graduation_date: datetime = Field(
        ...,
        description="Date on which the trainee completed the course (ISO 8601 datetime).",
        examples=["2025-06-15T00:00:00"],
    )


# ────────────────────────────────────────────────────────────────────────────
# TraineeResponse — the shape of the JSON the API returns (GET & POST responses)
# ────────────────────────────────────────────────────────────────────────────
class TraineeResponse(TraineeBase):
    """
    Schema for returning a Trainee to the frontend.

    Inherits all fields from TraineeBase and adds:
      - id              : the auto-generated primary key from MySQL.
      - graduation_date : returned so the frontend can display it.

    KEY SETTING:
      model_config = {"from_attributes": True}

      This is the Pydantic v2 equivalent of the old  class Config: orm_mode = True.
      It tells Pydantic: "don't expect a plain dict — read attributes off a
      SQLAlchemy ORM object directly."

      Without this, passing a  models.Trainee  ORM instance to this schema
      would raise a ValidationError.
    """

    # Pydantic v2: use model_config dict instead of the inner `class Config`
    model_config = {"from_attributes": True}

    id: int = Field(
        ...,
        description="Auto-generated unique identifier for this trainee.",
        examples=[1],
    )

    graduation_date: datetime = Field(
        ...,
        description="Date on which the trainee completed the course.",
        examples=["2025-06-15T00:00:00"],
    )


# ════════════════════════════════════════════════════════════════════════════
# ② OUTCOME LOG SCHEMAS
# ════════════════════════════════════════════════════════════════════════════

class OutcomeLogCreate(BaseModel):
    """
    Schema for CREATING a new outcome log entry.

    The frontend sends this JSON body to  POST /api/outcomes  after completing
    a 3-, 6-, or 12-month check-in for a specific trainee.

    The  new_status  field is intentionally NOT part of the OutcomeLog DB table.
    The API uses it to simultaneously update  Trainee.current_status.
    This keeps the 'source of truth' for a trainee's current status in one place
    (the Trainee row) while still recording the historical check-in in OutcomeLog.

    Example JSON body:
    {
        "trainee_id": 7,
        "checkin_month": 6,
        "verification_source": "whatsapp",
        "new_status": "Employed"
    }
    """

    trainee_id: int = Field(
        ...,
        gt=0,                           # gt=0 means "greater than 0" (must be positive)
        description="ID of the trainee this log belongs to.",
        examples=[7],
    )

    checkin_month: int = Field(
        ...,
        description="Which scheduled check-in this is: must be 3, 6, or 12.",
        examples=[6],
    )

    verification_source: str = Field(
        ...,
        max_length=50,
        description=(
            "Channel used to verify outcome. "
            "Allowed: 'whatsapp', 'magic_link', 'epfo_mock'."
        ),
        examples=["whatsapp"],
    )

    new_status: str = Field(
        ...,
        description=(
            "The trainee's UPDATED employment status after this check-in. "
            "Used to update Trainee.current_status in the same transaction. "
            "Allowed values: 'Employed', 'Self-Employed', 'Searching', 'Unemployed'."
        ),
        examples=["Employed"],
    )

    # ── Field Validators ──────────────────────────────────────────────────────

    @field_validator("checkin_month")
    @classmethod
    def must_be_valid_month(cls, value: int) -> int:
        """
        The SIH26135 scheme defines exactly three check-in points.
        Reject any other value before it reaches the database.
        """
        allowed_months = {3, 6, 12}
        if value not in allowed_months:
            raise ValueError(
                f"checkin_month must be 3, 6, or 12. Received: {value}."
            )
        return value

    @field_validator("verification_source")
    @classmethod
    def must_be_valid_source(cls, value: str) -> str:
        """
        Ensure only recognised verification channels are accepted.
        Case-sensitive comparison keeps it consistent with the DB stored values.
        """
        allowed_sources = {"whatsapp", "magic_link", "epfo_mock"}
        if value not in allowed_sources:
            raise ValueError(
                f"verification_source must be one of: {', '.join(sorted(allowed_sources))}."
            )
        return value

    @field_validator("new_status")
    @classmethod
    def must_be_valid_status(cls, value: str) -> str:
        """
        Mirror the same status validation used in TraineeBase so the
        Trainee row is updated with a valid enum string.
        """
        allowed = {"Employed", "Self-Employed", "Searching", "Unemployed"}
        if value not in allowed:
            raise ValueError(
                f"new_status must be one of: {', '.join(sorted(allowed))}."
            )
        return value


# ────────────────────────────────────────────────────────────────────────────
# OutcomeLogResponse — returned to the frontend after a successful log creation
# ────────────────────────────────────────────────────────────────────────────
class OutcomeLogResponse(BaseModel):
    """
    Schema for returning an OutcomeLog to the frontend.

    model_config = {"from_attributes": True}  is required here too because
    the API endpoint returns a SQLAlchemy  OutcomeLog  ORM object, not a plain dict.

    NOTE:  new_status  is NOT included here — it was only used as input.
    The response reflects what was actually persisted in  outcome_logs  table.
    """

    model_config = {"from_attributes": True}

    id: int = Field(
        ...,
        description="Auto-generated unique identifier for this outcome log entry.",
        examples=[42],
    )

    trainee_id: int = Field(
        ...,
        description="ID of the trainee this log belongs to.",
        examples=[7],
    )

    checkin_month: int = Field(
        ...,
        description="Which scheduled check-in this records: 3, 6, or 12.",
        examples=[6],
    )

    verification_source: str = Field(
        ...,
        description="Channel used to verify outcome.",
        examples=["whatsapp"],
    )

    logged_at: datetime = Field(
        ...,
        description="UTC timestamp of when this outcome log was recorded.",
        examples=["2026-09-14T07:45:00"],
    )
