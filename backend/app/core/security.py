from datetime import datetime
from typing import Optional
from jose import jwt, JWTError
from app.core.config import settings

def verify_supabase_token(token: str) -> Optional[dict]:
    """
    Verifies a Supabase JWT token using the Supabase JWT Secret.
    Returns the decoded payload if valid, None otherwise.
    """
    try:
        # Supabase uses HS256 algorithm by default
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False} # Default audience is 'authenticated'
        )
        return payload
    except JWTError:
        return None
