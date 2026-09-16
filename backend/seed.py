import os
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models

def generate_aadhaar_last_four():
    return str(random.randint(1000, 9999))

def generate_phone():
    return f"9{random.randint(100000000, 999999999)}"

def generate_unique_emp_id(district, i):
    return f"EMP-{district[:3].upper()}-{2026}-{i:04d}"

districts = ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Thane", "Amravati"]
institutes = {
    "Pune": ["Government ITI Pune", "Modern Skill Center Pune", "TechHub Academy Pune"],
    "Mumbai": ["Government ITI Mumbai", "Dharavi Skill Institute", "Mumbai Tech Training"],
    "Nagpur": ["Government ITI Nagpur", "Vidarbha Skill Center"],
    "Nashik": ["Government ITI Nashik"],
}
courses = ["CNC Machine Operation", "Advanced Welding", "EV Battery Maintenance", "Data Entry Operator", "Plumbing & Sanitization"]

employment_types = ["Salaried", "Self-Employed", "Apprentice", "Unemployed", "Drop-out"]
attrition_reasons = ["Low Local Wages", "Relocation Constraints", "Family Obligations", "Health Issues", "Found Better Job"]
skill_gaps = ["Advanced CNC Programming", "English Communication", "Digital Literacy", "Workplace Ethics", "EV Diagnostics"]

def seed_db():
    print("Starting database seed...")
    models.Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if we already have trainees
        count = db.query(models.Trainee).count()
        if count > 50:
            print(f"Database already contains {count} trainees. Skipping seed.")
            return

        for i in range(1, 101):
            district = random.choice(districts)
            institute = random.choice(institutes.get(district, [f"Government ITI {district}"]))
            course = random.choice(courses)
            
            # Phase 7 analytics data
            emp_type = random.choices(employment_types, weights=[50, 20, 10, 15, 5])[0]
            
            if emp_type in ["Salaried", "Self-Employed", "Apprentice"]:
                wage_init = random.randint(10000, 15000)
                wage_curr = wage_init + random.randint(0, 5000)
                retention = random.choice([3, 6, 12, 18, 24])
                relevance = random.randint(60, 100)
                status = models.TraineeStatus.EMPLOYED if emp_type == "Salaried" else models.TraineeStatus.SELF_EMPLOYED
                attrition = None
                skill_gap = None
            else:
                wage_init = None
                wage_curr = None
                retention = None
                relevance = random.randint(20, 60)
                status = models.TraineeStatus.UNEMPLOYED
                attrition = random.choice(attrition_reasons) if emp_type == "Unemployed" else "Program too difficult"
                skill_gap = random.choice(skill_gaps)
            
            # Special logic for Nashik attrition as mentioned in actions
            if district == "Nashik" and random.random() < 0.4:
                emp_type = "Unemployed"
                status = models.TraineeStatus.UNEMPLOYED
                attrition = "Low Local Wages"
            
            # Special logic for CNC wage growth
            if course == "CNC Machine Operation" and emp_type == "Salaried":
                wage_curr = wage_init + random.randint(0, 500) # Low wage growth
                
            # Special logic for Pune skill gap
            if district == "Pune" and random.random() < 0.3:
                skill_gap = "English Communication"
            
            trainee = models.Trainee(
                name=f"Trainee_{i} Demo",
                aadhaar_last_four=generate_aadhaar_last_four(),
                phone=generate_phone(),
                district=district,
                institute_name=institute,
                course_name=course,
                graduation_date=datetime.now(timezone.utc) - timedelta(days=random.randint(100, 400)),
                current_status=status,
                unique_emp_id=generate_unique_emp_id(district, i),
                employment_type=emp_type,
                wage_initial=wage_init,
                wage_current=wage_curr,
                retention_months=retention,
                training_relevance_score=relevance,
                attrition_reason=attrition,
                skill_gap_identified=skill_gap
            )
            db.add(trainee)
        
        db.commit()
        print("Successfully seeded 100 trainee records for Maharashtra.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
