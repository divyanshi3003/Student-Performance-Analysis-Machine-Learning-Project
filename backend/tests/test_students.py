import pytest

from app.models import User
from app.api.deps import get_current_student
from app.main import app

def test_update_and_get_student_profile(client, db_session):
    # Mock user
    mock_user = User(id="user-123", email="student@edu.com", role="student")
    db_session.add(mock_user)
    db_session.commit()

    def override_get_current_student():
        return mock_user
    
    app.dependency_overrides[get_current_student] = override_get_current_student

    # Update Profile
    update_data = {
        "profile": {
            "student_identifier": "STU1001", "first_name": "Test",
            "last_name": "Student",
            "department": "CS",
            "semester": 4,
            "gender": "Female",
            "hostel_or_dayscholar": "Hostel",
            "study_time_preference": "Night",
            "learning_style": "Visual",
            "sleep_quality": "Good",
            "stress_level": "Low",
            "internet_access_quality": "High",
            "part_time_job": "No",
            "mentor_support": "Yes",
            "placement_status": "Not Placed"
        },
        "academics": {
            "attendance_percentage": 90.0,
            "previous_year_score": 85.0,
            "previous_semester_gpa": 8.8,
            "backlogs_count": 0,
            "internal_marks": 45
        },
        "activities": {
            "study_time_daily": {"hours": 2, "minutes": 30},
            "material_prep_weekly": {"hours": 5, "minutes": 0},
            "extracurricular_weekly": {"hours": 2, "minutes": 0},
            "skill_dev_weekly": {"hours": 4, "minutes": 0},
            "projects_completed": 2,
            "hackathons_participated": 1,
            "internships_completed": 0,
            "certifications_count": 1,
            "coding_problems_solved": 50,
            "coding_platform_rating": 1200
        }
    }

    res_put = client.put(
        "/api/v1/students/me",
        json=update_data
    )
    assert res_put.status_code == 200

    # Get Profile
    res_get = client.get("/api/v1/students/me")
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["profile"]["department"] == "CS"
    assert data["academics"]["attendance_percentage"] == 90.0

    app.dependency_overrides.clear()

def test_exceeding_24_hour_limit(client, db_session):
    mock_user = User(id="user-456", email="student2@edu.com", role="student")
    db_session.add(mock_user)
    db_session.commit()

    def override_get_current_student():
        return mock_user
    
    app.dependency_overrides[get_current_student] = override_get_current_student

    # Invalid Payload (Exceeds 14 daily hours rule)
    invalid_payload = {
        "profile": {
            "student_identifier": "STU1002",
            "department": "CSE", "semester": 6, "gender": "Male", "hostel_or_dayscholar": "Hostel",
            "study_time_preference": "Night", "learning_style": "Visual", "sleep_quality": "Average",
            "stress_level": "Medium", "internet_access_quality": "Good", "part_time_job": "No",
            "mentor_support": "Yes", "placement_status": "Not Started"
        },
        "academics": {
            "attendance_percentage": 85.5, "previous_year_score": 75.0, "previous_semester_gpa": 7.8,
            "backlogs_count": 0, "internal_marks": 40
        },
        "activities": {
            "study_time_daily": {"hours": 15, "minutes": 0}, # 15 hours alone breaks the 14-hour limit rule
            "material_prep_weekly": {"hours": 0, "minutes": 0},
            "extracurricular_weekly": {"hours": 0, "minutes": 0},
            "skill_dev_weekly": {"hours": 0, "minutes": 0},
            "projects_completed": 2, "hackathons_participated": 1, "internships_completed": 0,
            "certifications_count": 1, "coding_problems_solved": 50, "coding_platform_rating": 1200
        }
    }
    
    res = client.put("/api/v1/students/me", json=invalid_payload, )
    assert res.status_code == 422 # Unprocessable Entity due to pydantic validator
