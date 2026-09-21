import pytest

def test_update_and_get_student_profile(client):
    # Setup: Create user and login
    client.post(
        "/api/v1/auth/signup",
        json={"email": "student1@edu.com", "password": "pass", "role": "student"}
    )
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "student1@edu.com", "password": "pass"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Valid Payload
    payload = {
        "profile": {
            "student_identifier": "STU1001",
            "department": "CSE",
            "semester": 6,
            "gender": "Male",
            "hostel_or_dayscholar": "Hostel",
            "study_time_preference": "Night",
            "learning_style": "Visual",
            "sleep_quality": "Average",
            "stress_level": "Medium",
            "internet_access_quality": "Good",
            "part_time_job": "No",
            "mentor_support": "Yes",
            "placement_status": "Not Started"
        },
        "academics": {
            "attendance_percentage": 85.5,
            "previous_year_score": 75.0,
            "previous_semester_gpa": 7.8,
            "backlogs_count": 0,
            "internal_marks": 40
        },
        "activities": {
            "study_time_daily": {"hours": 3, "minutes": 30},
            "material_prep_weekly": {"hours": 7, "minutes": 0},
            "extracurricular_weekly": {"hours": 2, "minutes": 0},
            "skill_dev_weekly": {"hours": 5, "minutes": 0},
            "projects_completed": 2,
            "hackathons_participated": 1,
            "internships_completed": 0,
            "certifications_count": 1,
            "coding_problems_solved": 50,
            "coding_platform_rating": 1200
        }
    }
    
    # PUT profile
    put_res = client.put("/api/v1/students/me", json=payload, headers=headers)
    assert put_res.status_code == 200
    assert put_res.json()["message"] == "Student profile updated successfully."
    
    # GET profile
    get_res = client.get("/api/v1/students/me", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["profile"]["student_identifier"] == "STU1001"
    
    # Time checking: 3h 30m = 210 mins
    assert data["activities"]["study_minutes_per_day"] == 210

def test_exceeding_24_hour_limit(client):
    client.post(
        "/api/v1/auth/signup",
        json={"email": "student2@edu.com", "password": "pass", "role": "student"}
    )
    login_res = client.post("/api/v1/auth/login", data={"username": "student2@edu.com", "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
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
    
    res = client.put("/api/v1/students/me", json=invalid_payload, headers=headers)
    assert res.status_code == 422 # Unprocessable Entity due to pydantic validator
