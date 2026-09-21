import pytest

def test_predict_single_and_history(client):
    # Setup user
    client.post(
        "/api/v1/auth/signup",
        json={"email": "mlstudent@edu.com", "password": "pass", "role": "student"}
    )
    login_res = client.post("/api/v1/auth/login", data={"username": "mlstudent@edu.com", "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create profile first to link prediction to student
    payload = {
        "profile": {
            "student_identifier": "STU999", "department": "CSE", "semester": 6, "gender": "Male",
            "hostel_or_dayscholar": "Hostel", "study_time_preference": "Night", "learning_style": "Visual",
            "sleep_quality": "Average", "stress_level": "Medium", "internet_access_quality": "Good",
            "part_time_job": "No", "mentor_support": "Yes", "placement_status": "Not Started"
        },
        "academics": {
            "attendance_percentage": 85.5, "previous_year_score": 75.0, "previous_semester_gpa": 7.8,
            "backlogs_count": 0, "internal_marks": 40
        },
        "activities": {
            "study_time_daily": {"hours": 3, "minutes": 30}, "material_prep_weekly": {"hours": 7, "minutes": 0},
            "extracurricular_weekly": {"hours": 2, "minutes": 0}, "skill_dev_weekly": {"hours": 5, "minutes": 0},
            "projects_completed": 2, "hackathons_participated": 1, "internships_completed": 0,
            "certifications_count": 1, "coding_problems_solved": 50, "coding_platform_rating": 1200
        }
    }
    client.put("/api/v1/students/me", json=payload, headers=headers)
    
    # Run Prediction
    features = {
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
        "placement_status": "Not Started",
        "attendance_percentage": 85.5,
        "previous_year_score": 75.0,
        "previous_semester_gpa": 7.8,
        "backlogs_count": 0,
        "internal_marks": 40,
        "study_minutes_per_day": 210,
        "material_prep_minutes_per_week": 420,
        "extracurricular_minutes_per_week": 120,
        "skill_dev_minutes_per_week": 300,
        "projects_completed": 2,
        "hackathons_participated": 1,
        "internships_completed": 0,
        "certifications_count": 1,
        "coding_problems_solved": 50,
        "coding_platform_rating": 1200
    }
    
    pred_res = client.post("/api/v1/predict/single", json={"features": features}, headers=headers)
    assert pred_res.status_code == 200
    data = pred_res.json()
    assert "predicted_score" in data
    assert "predicted_category" in data
    assert "prediction_id" in data
    
    # Test history
    hist_res = client.get("/api/v1/predict/history", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) == 1
    assert hist_res.json()[0]["id"] == data["prediction_id"]
