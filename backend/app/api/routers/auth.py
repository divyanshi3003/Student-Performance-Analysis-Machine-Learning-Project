from fastapi import APIRouter, Depends
from app.models import User
from app.schemas.user import UserResponse
from app.api.deps import get_current_user

router = APIRouter()

# Note: /signup and /login are removed because authentication
# is now handled directly by Supabase Auth on the frontend.
# The frontend will receive a Supabase JWT and pass it to this backend
# via the Authorization: Bearer header.

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently authenticated user's details.
    Requires a valid Supabase JWT in the Authorization header.
    """
    return current_user
