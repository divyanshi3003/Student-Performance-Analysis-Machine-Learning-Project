from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_current_user, get_current_student
from app.models import User, Student
from app.core.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("sqlite:///./test2.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

mock_user = User(id="user-456", email="test2@test.com", role="student")
def override_get_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_user
app.dependency_overrides[get_current_student] = override_get_user

client = TestClient(app)

# 1. PUT /students/me
put_payload = {
  "profile": {
    "student_identifier": "TEST01",
    "department": "CSE",
    "semester": 1,
    "gender": "Male",
    "hostel_or_dayscholar": "Dayscholar",
    "study_time_preference": "Morning",
    "learning_style": "Visual",
    "sleep_quality": "Average",
    "stress_level": "Medium",
    "internet_access_quality": "Good",
    "part_time_job": "No",
    "mentor_support": "Yes",
    "placement_status": "Not Started"
  },
  "academics": {
    "attendance_percentage": 85,
    "previous_year_score": 80,
    "previous_semester_gpa": 8.0,
    "backlogs_count": 0,
    "internal_marks": 40
  },
  "activities": {
    "study_time_daily": { "hours": 2, "minutes": 0 },
    "material_prep_weekly": { "hours": 1, "minutes": 0 },
    "extracurricular_weekly": { "hours": 0, "minutes": 30 },
    "skill_dev_weekly": { "hours": 1, "minutes": 0 },
    "projects_completed": 1,
    "hackathons_participated": 0,
    "internships_completed": 0,
    "certifications_count": 1,
    "coding_problems_solved": 50,
    "coding_platform_rating": 1200
  }
}

print("--- PUT /students/me ---")
res_put = client.put("/api/v1/students/me", json=put_payload)
print(res_put.status_code, res_put.json())

# 2. GET /students/me
print("--- GET /students/me ---")
res_get = client.get("/api/v1/students/me")
print(res_get.status_code)
student_data = res_get.json()

# 3. Flatten features for predict
features = {
    **student_data["profile"],
    **student_data["academics"],
    **student_data["activities"]
}

# 4. POST /predict/single
print("--- POST /predict/single ---")
res_pred = client.post("/api/v1/predict/single", json={"features": features})
print(res_pred.status_code, res_pred.text)
