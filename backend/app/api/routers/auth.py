from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models import User
from app.schemas.user import UserResponse
from app.api.deps import get_current_user

router = APIRouter()

class UserUpdateRequest(BaseModel):
    role: Optional[str] = None

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently authenticated user's details.
    Requires a valid InsForge JWT in the Authorization header.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_users_me(
    data_in: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the authenticated user's role (student, teacher, admin).
    """
    if data_in.role and data_in.role in ["student", "teacher", "admin"]:
        current_user.role = data_in.role
        db.commit()
        db.refresh(current_user)
    return current_user
