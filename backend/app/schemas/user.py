from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    # Typically handled by frontend and Supabase now
    email: EmailStr
    password: str
    role: Optional[str] = "student"

class UserResponse(BaseModel):
    id: str  # Updated to string to support Supabase UUID
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
