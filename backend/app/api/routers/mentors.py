from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_student
from app.models import User, Student
from pydantic import BaseModel
from typing import List

router = APIRouter()

class MentorResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str

class MentorSelectRequest(BaseModel):
    mentor_id: str

@router.get("", response_model=List[MentorResponse])
def get_mentors(db: Session = Depends(get_db)):
    mentors = db.query(User).filter(User.role == "teacher").all()
    
    # Left join profiles
    return [
        {
            "id": mentor.id,
            "email": mentor.email,
            "first_name": mentor.profile.first_name if mentor.profile else "",
            "last_name": mentor.profile.last_name if mentor.profile else ""
        }
        for mentor in mentors
    ]

@router.put("/me")
def update_mentor(
    request: MentorSelectRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_student)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    mentor = db.query(User).filter(User.id == request.mentor_id, User.role == "teacher").first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Selected mentor not found or is not a teacher")
        
    student.mentor_id = mentor.id
    db.commit()
    
    return {"message": "Mentor assigned successfully", "mentor_id": mentor.id}
