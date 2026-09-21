import pytest

def test_teacher_can_get_all_students(client):
    # 1. Signup a Teacher
    client.post(
        "/api/v1/auth/signup",
        json={"email": "teacher1@edu.com", "password": "pass", "role": "teacher"}
    )
    # Login Teacher
    t_login = client.post("/api/v1/auth/login", data={"username": "teacher1@edu.com", "password": "pass"})
    t_token = t_login.json()["access_token"]
    t_headers = {"Authorization": f"Bearer {t_token}"}
    
    # 2. Signup a Student and save profile
    client.post(
        "/api/v1/auth/signup",
        json={"email": "student_t1@edu.com", "password": "pass", "role": "student"}
    )
    s_login = client.post("/api/v1/auth/login", data={"username": "student_t1@edu.com", "password": "pass"})
    s_token = s_login.json()["access_token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}
    
    payload = {
        "profile": {
            "student_identifier": "STU_T1", "department": "CSE", "semester": 6, "gender": "Male",
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
    client.put("/api/v1/students/me", json=payload, headers=s_headers)
    
    # 3. Teacher fetches /all
    res = client.get("/api/v1/students/all", headers=t_headers)
    assert res.status_code == 200
    data = res.json()
    
    assert isinstance(data, list)
    # Ensure our student is in the list
    assert any(s["student_identifier"] == "STU_T1" for s in data)

def test_student_cannot_access_teacher_route(client):
    # Login as student (using the one created above, or creating a new one)
    client.post(
        "/api/v1/auth/signup",
        json={"email": "student_t2@edu.com", "password": "pass", "role": "student"}
    )
    s_login = client.post("/api/v1/auth/login", data={"username": "student_t2@edu.com", "password": "pass"})
    s_token = s_login.json()["access_token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}
    
    res = client.get("/api/v1/students/all", headers=s_headers)
    # Should be forbidden due to RBAC
    assert res.status_code == 403
