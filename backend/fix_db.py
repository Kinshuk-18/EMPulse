from database import engine
from sqlalchemy import text

print("Connecting to Aiven MySQL database...")
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE trainees ADD COLUMN unique_emp_id VARCHAR(50) DEFAULT NULL;"))
        print("SUCCESS: Added 'unique_emp_id' column to trainees table!")
except Exception as e:
    print("Note (column might already exist or error):", e)