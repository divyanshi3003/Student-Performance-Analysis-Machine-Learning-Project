from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_student
from app.models import User, Student, AcademicRecord, StudyLog
from app.schemas.student import StudentDataUpdate, StudentDataResponse

router = APIRouter()

@router.get("/me", response_model=StudentDataResponse)
def get_student_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_student)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found. Please create one.")
        
    return {
        "profile": {c.name: getattr(student, c.name) for c in student.__table__.columns if c.name not in ["id", "user_id"]},
        "academics": {c.name: getattr(student.academic_record, c.name) for c in student.academic_record.__table__.columns if c.name not in ["id", "student_id", "updated_at"]},
        "activities": {c.name: getattr(student.study_log, c.name) for c in student.study_log.__table__.columns if c.name not in ["id", "student_id", "logged_at"]}
    }

@router.put("/me")
def update_student_profile(
    data_in: StudentDataUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_student)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    # Extract profiles
    prof_data = data_in.profile.model_dump()
    acad_data = data_in.academics.model_dump()
    
    # Calculate minutes from TimeInput
    activities_data = data_in.activities.model_dump(exclude={"study_time_daily", "material_prep_weekly", "extracurricular_weekly", "skill_dev_weekly"})
    activities_data["study_minutes_per_day"] = data_in.activities.study_time_daily.total_minutes()
    activities_data["material_prep_minutes_per_week"] = data_in.activities.material_prep_weekly.total_minutes()
    activities_data["extracurricular_minutes_per_week"] = data_in.activities.extracurricular_weekly.total_minutes()
    activities_data["skill_dev_minutes_per_week"] = data_in.activities.skill_dev_weekly.total_minutes()

    if not student:
        # Create
        student = Student(user_id=current_user.id, **prof_data)
        db.add(student)
        db.flush() # get student.id
        
        academics = AcademicRecord(student_id=student.id, **acad_data)
        activities = StudyLog(student_id=student.id, **activities_data)
        
        db.add(academics)
        db.add(activities)
    else:
        # Update
        for k, v in prof_data.items():
            setattr(student, k, v)
        for k, v in acad_data.items():
            setattr(student.academic_record, k, v)
        for k, v in activities_data.items():
            setattr(student.study_log, k, v)
            
    db.commit()
    return {"message": "Student profile updated successfully."}
