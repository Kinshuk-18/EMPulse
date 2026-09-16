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

def seed_db():
    print("Starting database seed...")
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Create Institutes
        institutes_data = [
            models.Institute(name="Government ITI Aundh (Pune)", district="Pune", principal_name="Dr. Anil Shrivastava", phone="9425112233", email="govt.iti.aundh@empulse", dise_code="ITI-PUN-01"),
            models.Institute(name="VJTI Skill Center", district="Mumbai Suburban", principal_name="Prof. Meena Joshi", phone="9826445566", email="vjti.skill@empulse", dise_code="ITI-MUM-01"),
            models.Institute(name="Government ITI Nagpur", district="Nagpur", principal_name="Shri Rajesh Tiwari", phone="9111778899", email="govt.iti.nagpur@empulse", dise_code="ITI-NAG-01"),
            models.Institute(name="Nashik Vocational Academy", district="Nashik", principal_name="Mr. Sanjay Patil", phone="9876543210", email="nashik.vocational@empulse", dise_code="ITI-NSK-01"),
            models.Institute(name="Chhatrapati Sambhajinagar Hub", district="Chhatrapati Sambhajinagar", principal_name="Ms. Neeta Rao", phone="9988776655", email="cs.hub@empulse", dise_code="ITI-CS-01")
        ]
        db.add_all(institutes_data)
        db.commit()

        # Seed 8 explicit trainees for Government ITI Aundh (Pune)
        explicit_trainees = [
            models.Trainee(
                name="Aarav Sharma", aadhaar_last_four="1111", phone="9100000001", district="Pune",
                institute_name="Government ITI Aundh (Pune)", course_name="CNC Machine Operation",
                graduation_date=datetime.now(timezone.utc) - timedelta(days=365),
                current_status=models.TraineeStatus.EMPLOYED, unique_emp_id="EMP-PUN-2026-0001",
                employment_type="Salaried", wage_initial=12000, wage_current=15000, retention_months=12,
                training_relevance_score=85, attrition_reason=None, skill_gap_identified=None
            ),
            models.Trainee(
                name="Vihaan Patel", aadhaar_last_four="2222", phone="9100000002", district="Pune",
                institute_name="Government ITI Aundh (Pune)", course_name="Advanced Welding",
                graduation_date=datetime.now(timezone.utc) - timedelta(days=200),
                current_status=models.TraineeStatus.EMPLOYED, unique_emp_id="EMP-PUN-2026-0002",
                employment_type="Salaried", wage_initial=14000, wage_current=14500, retention_months=6,
                training_relevance_score=90, attrition_reason=None, skill_gap_identified=None
            ),
            models.Trainee(
                name="Vivaan Desai", aadhaar_last_four="3333", phone="9100000003", district="Pune",
                institute_name="Government ITI Aundh (Pune)", course_name="EV Battery Maintenance",
                graduation_date=datetime.now(timezone.utc) - timedelta(days=150),
                current_status=models.TraineeStatus.SELF_EMPLOYED, unique_emp_id="EMP-PUN-2026-0003",
                employment_type="Self-Employed", wage_initial=10000, wage_current=18000, retention_months=3,
                training_relevance_score=95, attrition_reason=None, skill_gap_identified=None
            ),
            models.Trainee(
                name="Ananya Joshi", aadhaar_last_four="4444", phone="9100000004", district="Pune",
                institute_name="Government ITI Aundh (Pune)", course_name="Data Entry Operator",
                graduation_date=datetime.now(timezone.utc) - timedelta(days=400),
                current_status=models.TraineeStatus.UNEMPLOYED, unique_emp_id="EMP-PUN-2026-0004",
                employment_type="Unemployed", wage_initial=None, wage_current=None, retention_months=None,
                training_relevance_score=40, attrition_reason="Low Local Wages", skill_gap_identified="English Communication"
            ),
            models.Trainee(
                name="Aditya Kadam", aadhaar_last_four="5555", phone="9100000005", district="Pune",
                institute_name="Government ITI Aundh (Pune)", course_name="Plumbing & Sanitization",
                graduation_date=datetime.now(timezone.utc) - timedelta(days=300),
                current_status=models.TraineeStatus.EMPLOYED, unique_emp_id="EMP-PUN-2026-0005",
                employment_type="Apprentice", wage_initial=8000, wage_current=8000, retention_months=6,
                training_relevance_score=75, attrition_reason=None, skill_gap_identified="Digital Literacy"
            ),
            models.Trainee(
                name="Riya Patil", aadhaar_last_four="6666", phone="9100000006", district="Pune",
                institute_name="Government ITI Aundh (Pune)", course_name="CNC Machine Operation",
                graduation_date=datetime.now(timezone.utc) - timedelta(days=500),
                current_status=models.TraineeStatus.UNEMPLOYED, unique_emp_id="EMP-PUN-2026-0006",
                employment_type="Drop-out", wage_initial=None, wage_current=None, retention_months=None,
                training_relevance_score=30, attrition_reason="Family Obligations", skill_gap_identified="Advanced CNC Programming"
            ),
            models.Trainee(
                name="Ishan More", aadhaar_last_four="7777", phone="9100000007", district="Pune",
                institute_name="Government ITI Aundh (Pune)", course_name="EV Battery Maintenance",
                graduation_date=datetime.now(timezone.utc) - timedelta(days=250),
                current_status=models.TraineeStatus.EMPLOYED, unique_emp_id="EMP-PUN-2026-0007",
                employment_type="Salaried", wage_initial=15000, wage_current=16000, retention_months=6,
                training_relevance_score=80, attrition_reason=None, skill_gap_identified=None
            ),
            models.Trainee(
                name="Diya Kulkarni", aadhaar_last_four="8888", phone="9100000008", district="Pune",
                institute_name="Government ITI Aundh (Pune)", course_name="Data Entry Operator",
                graduation_date=datetime.now(timezone.utc) - timedelta(days=380),
                current_status=models.TraineeStatus.UNEMPLOYED, unique_emp_id="EMP-PUN-2026-0008",
                employment_type="Unemployed", wage_initial=None, wage_current=None, retention_months=None,
                training_relevance_score=45, attrition_reason="Relocation Constraints", skill_gap_identified="English Communication"
            )
        ]
        db.add_all(explicit_trainees)
        db.commit()

        # Generate remaining random records
        districts = ["Pune", "Mumbai Suburban", "Nagpur", "Nashik", "Chhatrapati Sambhajinagar"]
        institutes = {
            "Pune": ["Government ITI Aundh (Pune)"],
            "Mumbai Suburban": ["VJTI Skill Center"],
            "Nagpur": ["Government ITI Nagpur"],
            "Nashik": ["Nashik Vocational Academy"],
            "Chhatrapati Sambhajinagar": ["Chhatrapati Sambhajinagar Hub"]
        }
        courses = ["CNC Machine Operation", "Advanced Welding", "EV Battery Maintenance", "Data Entry Operator", "Plumbing & Sanitization"]
        employment_types = ["Salaried", "Self-Employed", "Apprentice", "Unemployed", "Drop-out"]
        attrition_reasons = ["Low Local Wages", "Relocation Constraints", "Family Obligations", "Health Issues", "Found Better Job"]
        skill_gaps = ["Advanced CNC Programming", "English Communication", "Digital Literacy", "Workplace Ethics", "EV Diagnostics"]

        for i in range(9, 101):
            district = random.choice(districts)
            institute = random.choice(institutes[district])
            course = random.choice(courses)
            
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
            
            if district == "Nashik" and random.random() < 0.4:
                emp_type = "Unemployed"
                status = models.TraineeStatus.UNEMPLOYED
                attrition = "Low Local Wages"
            
            if course == "CNC Machine Operation" and emp_type == "Salaried":
                wage_curr = wage_init + random.randint(0, 500)
                
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
        print("Successfully seeded DB for Maharashtra institutes.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
