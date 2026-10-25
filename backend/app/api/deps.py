from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_insforge_token
from app.models import User

# Use HTTPBearer for Authorization: Bearer <token>
security = HTTPBearer()

def get_current_user(db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_insforge_token(token)
    
    if payload is None:
        raise credentials_exception
        
    if payload.get("email_verified") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address not verified. Please verify your email before accessing the system.",
        )
        
    user_id: str = payload.get("sub")
    email: str = payload.get("email", "unknown@example.com")
    if user_id is None:
        raise credentials_exception
        
    # Supabase uses UUID string for auth.users.id
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        # Fallback: Create user in public.users automatically
        # Since we just verified the token with Supabase, we know this user is authenticated.
        user = User(id=user_id, email=email, role="student")
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to sync user to public database",
            )
    return user

def get_current_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["student", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

def get_current_teacher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
