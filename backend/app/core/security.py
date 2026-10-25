from typing import Optional
import time
import requests
from jose import jwt, JWTError
from app.core.config import settings

_jwks_cache = None
_jwks_cache_time = 0
JWKS_CACHE_TTL = 3600  # 1 hour

def get_insforge_jwks() -> Optional[dict]:
    global _jwks_cache, _jwks_cache_time
    now = time.time()
    if _jwks_cache and (now - _jwks_cache_time) < JWKS_CACHE_TTL:
        return _jwks_cache
    
    try:
        url = f"{settings.INSFORGE_URL}/.well-known/jwks.json"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            _jwks_cache = res.json()
            _jwks_cache_time = now
            return _jwks_cache
    except Exception as e:
        print(f"Error fetching InsForge JWKS: {e}")
    return _jwks_cache

def verify_insforge_token(token: str) -> Optional[dict]:
    """
    Verifies an InsForge JWT token using RS256 public keys from /.well-known/jwks.json.
    Returns the decoded payload if valid, None otherwise.
    """
    try:
        jwks = get_insforge_jwks()
        if not jwks:
            return None
        
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False, "verify_exp": True}
        )
        return {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
            "email_verified": payload.get("email_verified", True),
        }
    except JWTError as e:
        print(f"InsForge Token verification error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected token error: {e}")
        return None

# Backwards compatibility alias
verify_supabase_token = verify_insforge_token
