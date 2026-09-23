import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_current_user, get_current_student
from app.models import User, Student
from app.core.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test DB
engine = create_engine("sqlite:///./test_pytest.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

mock_user = User(id="user-pytest", email="pytest@test.com", role="student")
def override_get_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_user
app.dependency_overrides[get_current_student] = override_get_user

client = TestClient(app)

def test_assessment_prediction_pipeline():
    # 1. Update Student Profile
    put_payload = {
      "profile": {
        "student_identifier": "PYTEST01",
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
    
    res_put = client.put("/api/v1/students/me", json=put_payload)
    assert res_put.status_code == 200

    # 2. Get Profile
    res_get = client.get("/api/v1/students/me")
    assert res_get.status_code == 200
    student_data = res_get.json()

    # 3. Post Predict
    features = {
        **student_data["profile"],
        **student_data["academics"],
        **student_data["activities"]
    }
    
    res_pred = client.post("/api/v1/predict/single", json={"features": features})
    assert res_pred.status_code == 200
    pred_data = res_pred.json()
    
    assert "prediction_id" in pred_data
    assert "predicted_score" in pred_data
    assert "predicted_category" in pred_data
    assert type(pred_data["prediction_id"]) == int
    
    # 4. Post Predict (save=False)
    res_pred_nosave = client.post("/api/v1/predict/single?save=false", json={"features": features})
    assert res_pred_nosave.status_code == 200
    pred_data_nosave = res_pred_nosave.json()
    assert pred_data_nosave["prediction_id"] == -1

    # 5. Get Predictions
    res_history = client.get("/api/v1/predict/predictions")
    assert res_history.status_code == 200
    history_data = res_history.json()
    assert type(history_data) == list
    assert len(history_data) > 0

    # 6. Get Summary
    res_summary = client.get("/api/v1/predict/summary")
    assert res_summary.status_code == 200
    summary_data = res_summary.json()
    assert summary_data["total_assessments"] > 0
    assert "latest_feature_drivers" in summary_data
