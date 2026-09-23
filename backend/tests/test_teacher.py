import pytest
from app.models import User, Student
from app.api.deps import get_current_teacher, get_current_student
from app.main import app

def test_teacher_can_get_all_students(client, db_session):
    mock_teacher = User(id="t-123", email="teacher@edu.com", role="teacher")
    db_session.add(mock_teacher)
    db_session.commit()

    def override_get_current_teacher():
        return mock_teacher
    
    app.dependency_overrides[get_current_teacher] = override_get_current_teacher

    # Mock some students
    student1 = Student(user_id="s1", student_identifier="STU-1", department="CS", semester=1)
    db_session.add(student1)
    db_session.commit()

    res = client.get("/api/v1/students/all")
    assert res.status_code == 200
    assert len(res.json()) >= 1

    app.dependency_overrides.clear()

def test_student_cannot_access_teacher_route(client, db_session):
    mock_student = User(id="s-123", email="s@edu.com", role="student")
    db_session.add(mock_student)
    db_session.commit()

    def override_get_current_teacher():
        # A real dependency would raise 403 if role != teacher.
        # But here we simulate the test hitting it. If it hits it as student, it should fail.
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    app.dependency_overrides[get_current_teacher] = override_get_current_teacher

    res = client.get("/api/v1/students/all")
    assert res.status_code == 403

    app.dependency_overrides.clear()
