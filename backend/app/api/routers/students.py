from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_student, get_current_teacher
from app.models import User, Student, AcademicRecord, StudyLog, Prediction
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

@router.get('/all')
def get_all_students(db: Session = Depends(get_db), current_user: User = Depends(get_current_teacher)):
    students = db.query(Student).all()
    results = []
    for s in students:
        latest_pred = db.query(Prediction).filter(Prediction.student_id == s.id).order_by(Prediction.predicted_at.desc()).first()
        results.append({
            'id': s.id,
            'student_identifier': s.student_identifier,
            'department': s.department,
            'semester': s.semester,
            'latest_score': latest_pred.predicted_score if latest_pred else None,
            'latest_category': latest_pred.predicted_category if latest_pred else 'N/A'
        })
    return results

@router.get('/mentees')
def get_teacher_mentees(db: Session = Depends(get_db), current_user: User = Depends(get_current_teacher)):
    """Get all students assigned to the logged-in teacher"""
    students = db.query(Student).filter(Student.mentor_id == current_user.id).all()
    results = []
    for s in students:
        # Also join with user to get email/name
        user_info = db.query(User).filter(User.id == s.user_id).first()
        latest_pred = db.query(Prediction).filter(Prediction.student_id == s.id).order_by(Prediction.predicted_at.desc()).first()
        
        results.append({
            'student_id': s.id,
            'user_id': s.user_id,
            'email': user_info.email if user_info else 'Unknown',
            'first_name': user_info.profile.first_name if (user_info and user_info.profile) else '',
            'last_name': user_info.profile.last_name if (user_info and user_info.profile) else '',
            'student_identifier': s.student_identifier,
            'department': s.department,
            'semester': s.semester,
            'latest_score': latest_pred.predicted_score if latest_pred else None,
            'latest_category': latest_pred.predicted_category if latest_pred else 'N/A'
        })
    return results

@router.get('/mentees/{student_id}')
def get_mentee_details(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_teacher)):
    student = db.query(Student).filter(Student.id == student_id, Student.mentor_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
        
    return {
        "profile": {c.name: getattr(student, c.name) for c in student.__table__.columns if c.name not in ["id", "user_id", "mentor_id"]},
        "academics": {c.name: getattr(student.academic_record, c.name) for c in student.academic_record.__table__.columns if c.name not in ["id", "student_id", "updated_at"]},
        "activities": {c.name: getattr(student.study_log, c.name) for c in student.study_log.__table__.columns if c.name not in ["id", "student_id", "logged_at"]}
    }

@router.get('/mentees/{student_id}/predictions')
def get_mentee_predictions(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_teacher)):
    student = db.query(Student).filter(Student.id == student_id, Student.mentor_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
        
    preds = db.query(Prediction).filter(Prediction.student_id == student.id).order_by(Prediction.predicted_at.desc()).all()
    
    if not preds:
        return {"history": [], "summary": {}}
        
    history = [
        {
            "id": p.id,
            "predicted_score": p.predicted_score,
            "predicted_category": p.predicted_category,
            "predicted_at": p.predicted_at
        } for p in preds[:10]
    ]
    
    scores = [p.predicted_score for p in preds]
    latest_pred = preds[0]
    
    # We need to compute feature drivers for the latest prediction
    drivers = []
    if latest_pred.input_features:
        try:
            from app.services.ml_service import ml_service
            result = ml_service.predict_single(latest_pred.input_features)
            drivers = result.get("feature_drivers", [])
        except Exception:
            pass
            
    summary = {
        "total_assessments": len(scores),
        "average_score": sum(scores) / len(scores),
        "highest_score": max(scores),
        "latest_score": latest_pred.predicted_score,
        "latest_feature_drivers": drivers
    }
    
    return {"history": history, "summary": summary}

