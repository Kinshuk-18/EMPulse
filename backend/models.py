"""
models.py — EMPulse Backend
=============================
Defines the two core database tables for the schema:

  ┌──────────────┐        ┌─────────────────┐
  │   Trainee    │ 1────* │   OutcomeLog    │
  │──────────────│        │─────────────────│
  │ id (PK)      │        │ id (PK)         │
  │ name         │        │ trainee_id (FK) │
  │ phone        │        │ checkin_month   │
  │ aadhaar_last │        │ verification... │
  │ institute    │        │ logged_at       │
  │ course_name  │        └─────────────────┘
  │ graduation   │
  │ current_status│
  │ district     │
  └──────────────┘

One Trainee can have many OutcomeLogs (e.g., checked in at 3, 6, and 12 months).
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,        # SQLAlchemy Enum maps to MySQL's ENUM column type
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from database import Base   # the declarative Base we created in database.py

# Python Enum — defines the allowed values for Trainee.current_status
# Using Python's enum.Enum keeps the allowed values in one place and gives
# us IDE auto-complete and runtime validation for free.

class TraineeStatus(str, enum.Enum):
    """
    Employment status of a trainee at the time of a check-in.
    Using `str` as a mixin makes the enum JSON-serialisable automatically
    (important when Pydantic or FastAPI needs to serialise it).
    """
    EMPLOYED       = "Employed"
    SELF_EMPLOYED  = "Self-Employed"
    SEARCHING      = "Searching"
    UNEMPLOYED     = "Unemployed"


# ════════════════════════════════════════════════════════════════════════════
# Model 1: Trainee
# Maps to the MySQL table  `trainees`
# ════════════════════════════════════════════════════════════════════════════
class Trainee(Base):
    """
    Represents a vocational/skill-training graduate being tracked
    on the EMPulse platform.

    Each row = one real person who completed a course.
    """

    __tablename__ = "trainees"   # exact name of the table in MySQL

    # ── Primary Key ──────────────────────────────────────────────────────────
    id = Column(
        Integer,
        primary_key=True,
        index=True,              # creates an index for fast lookups by id
        autoincrement=True,      # MySQL auto-increments this on every INSERT
        comment="Unique internal identifier for the trainee",
    )

    # ── Human-Readable Public Trainee ID ─────────────────────────────────────────
    # Format: EMP-MH-2026-XXXX (state code + cohort year + zero-padded sequence)
    # Nullable so existing rows on the Aiven DB don't break on server restart.
    # The seed script and create_trainee() API generate this after INSERT.
    unique_emp_id = Column(
        String(20),
        nullable=True,           # nullable because legacy rows pre-date this column
        unique=True,
        index=True,
        comment="Human-readable public ID e.g. EMP-MH-2026-0001 — used for search & display",
    )

    # ── Personal Information ──────────────────────────────────────────────────
    name = Column(
        String(150),
        nullable=False,
        comment="Full name of the trainee",
    )

    phone = Column(
        String(15),
        nullable=False,
        unique=True,             # one phone = one trainee; prevents duplicates
        index=True,
        comment="10-digit mobile number (stored as string to preserve leading zero)",
    )

    aadhaar_last_four = Column(
        String(4),
        nullable=False,
        comment="Last 4 digits of the trainee's Aadhaar card (NOT the full number)",
    )

    # ── Educational/Training Details ─────────────────────────────────────────
    institute_name = Column(
        String(200),
        nullable=False,
        comment="Name of the training institute or ITI",
    )

    course_name = Column(
        String(200),
        nullable=False,
        comment="Name of the skill/vocational course completed",
    )

    graduation_date = Column(
        DateTime,
        nullable=False,
        comment="Date on which the trainee completed / graduated from the course",
    )

    # ── Current Employment Status ─────────────────────────────────────────────
    current_status = Column(
        Enum(TraineeStatus),     # MySQL will create an ENUM('Employed','Self-Employed',...)
        nullable=False,
        default=TraineeStatus.SEARCHING,
        comment="Current employment status — updated after each outcome check-in",
    )

    # ── Location ──────────────────────────────────────────────────────────────
    district = Column(
        String(100),
        nullable=False,
        comment="District where the trainee resides (for geographic reporting)",
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    # 'outcome_logs' is a VIRTUAL attribute (not a real DB column).
    # When you access  trainee.outcome_logs  SQLAlchemy will automatically
    # run  SELECT * FROM outcome_logs WHERE trainee_id = <this id>
    #
    # back_populates="trainee"  creates the REVERSE link:
    #   an OutcomeLog object can do  log.trainee  to get the parent Trainee.
    outcome_logs = relationship(
        "OutcomeLog",
        back_populates="trainee",
        cascade="all, delete-orphan",  # deleting a Trainee also deletes their logs
    )

    def __repr__(self) -> str:
        return (
            f"<Trainee id={self.id} emp_id='{self.unique_emp_id}' name='{self.name}' "
            f"status='{self.current_status}' district='{self.district}'>"
        )


# ════════════════════════════════════════════════════════════════════════════
# Model 2: OutcomeLog
# Maps to the MySQL table  `outcome_logs`
# ════════════════════════════════════════════════════════════════════════════
class OutcomeLog(Base):
    """
    Records a single longitudinal check-in event for a trainee.

    The national scheme mandates three check-ins per trainee:
      • 3-month  check-in
      • 6-month  check-in
      • 12-month check-in

    Each check-in captures HOW the outcome was verified
    (WhatsApp reply, magic link click, or EPFO lookup mock).
    """

    __tablename__ = "outcome_logs"

    # ── Primary Key ──────────────────────────────────────────────────────────
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for this outcome check-in event",
    )

    # ── Foreign Key — links this log to a Trainee ────────────────────────────
    trainee_id = Column(
        Integer,
        ForeignKey("trainees.id"),   # MUST match __tablename__ + column name exactly
        nullable=False,
        index=True,
        comment="ID of the trainee this log belongs to",
    )

    # ── Check-in Month ────────────────────────────────────────────────────────
    # Stored as a plain Integer.  Allowed values: 3, 6, 12.
    # We deliberately keep this as Integer (not Enum) so the API can
    # validate it in the Pydantic schema without coupling to the DB layer.
    checkin_month = Column(
        Integer,
        nullable=False,
        comment="Which scheduled check-in this is: 3, 6, or 12 (months after graduation)",
    )

    # ── Verification Source ───────────────────────────────────────────────────
    # How was the employment status confirmed?
    verification_source = Column(
        String(50),
        nullable=False,
        comment=(
            "Channel used to verify outcome: "
            "'whatsapp' | 'magic_link' | 'epfo_mock'"
        ),
    )

    # ── Timestamp ─────────────────────────────────────────────────────────────
    # datetime.utcnow is called at insert time to capture WHEN this log was created.
    logged_at = Column(
        DateTime,
        default=datetime.utcnow,     # auto-fill on INSERT; not updated on UPDATE
        nullable=False,
        comment="UTC timestamp of when this outcome log was recorded",
    )

    # ── Relationship (reverse side) ───────────────────────────────────────────
    # back_populates="outcome_logs" must match the attribute name on Trainee.
    trainee = relationship(
        "Trainee",
        back_populates="outcome_logs",
    )

    def __repr__(self) -> str:
        return (
            f"<OutcomeLog id={self.id} trainee_id={self.trainee_id} "
            f"month={self.checkin_month} via='{self.verification_source}'>"
        )
