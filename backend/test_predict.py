from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_current_user
from app.models import User, Student
from unittest.mock import MagicMock

client = TestClient(app)

# Mock get_current_user
mock_user = User(id="user-123-uuid", email="test@test.com", role="student")

app.dependency_overrides[get_current_user] = lambda: mock_user

# We also need to mock DB. But it's easier to just use SQLite test db.
# Let's override get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import get_db, Base

engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Setup fake student in test DB
db = TestingSessionLocal()
student = db.query(Student).filter(Student.user_id == mock_user.id).first()
if not student:
    student = Student(user_id=mock_user.id, student_identifier="STU-TEST", department="CSE")
    db.add(student)
    db.commit()

payload = {
    "features": {
        'student_identifier': 'STU001',
        'department': 'CSE',
        'semester': 1,
        'gender': 'Male',
        'hostel_or_dayscholar': 'Dayscholar',
        'study_time_preference': 'Morning',
        'learning_style': 'Visual',
        'sleep_quality': 'Average',
        'stress_level': 'Medium',
        'internet_access_quality': 'Good',
        'part_time_job': 'No',
        'mentor_support': 'Yes',
        'placement_status': 'Not Started',
        'attendance_percentage': 80.0,
        'previous_year_score': 85.0,
        'previous_semester_gpa': 8.5,
        'backlogs_count': 0,
        'internal_marks': 40,
        'study_minutes_per_day': 120,
        'material_prep_minutes_per_week': 60,
        'extracurricular_minutes_per_week': 30,
        'skill_dev_minutes_per_week': 60,
        'projects_completed': 1,
        'hackathons_participated': 0,
        'internships_completed': 0,
        'certifications_count': 1,
        'coding_problems_solved': 50,
        'coding_platform_rating': 1200
    }
}

response = client.post("/api/v1/predict/single", json=payload)
print("Status Code:", response.status_code)
print("Response JSON:", response.json())
