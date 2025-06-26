"""
Authentication utilities and dependencies.

Provides JWT validation and user authentication for API endpoints.
"""

from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime

from app.core.config import settings
from app.services.supabase import get_client as get_supabase_client
from app.services.auth.role_service import role_service
from app.core.demo import demo_service

# Security scheme for JWT Bearer tokens
security = HTTPBearer()


class AuthUser:
    """Authenticated user with role information."""
    
    def __init__(self, id: str, email: str, role: str, is_demo: bool = False):
        self.id = id
        self.email = email
        self.role = role
        self.is_demo = is_demo
    
    @property
    def is_admin(self) -> bool:
        """Check if user has admin privileges."""
        return self.role in ["admin", "super_admin"]
    
    @property
    def is_super_admin(self) -> bool:
        """Check if user is super admin."""
        return self.role == "super_admin"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AuthUser:
    """
    Validate JWT token and return current user.
    
    This properly validates tokens from both Supabase and demo mode.
    """
    token = credentials.credentials
    
    # Check if we're in demo mode
    if demo_service.is_demo_mode(settings.SUPABASE_URL):
        try:
            # Validate demo token
            payload = jwt.decode(
                token,
                "demo-secret-key-not-for-production",
                algorithms=["HS256"]
            )
            
            # Check if token is expired
            if payload.get("exp") and datetime.utcnow().timestamp() > payload["exp"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Demo token expired"
                )
            
            return AuthUser(
                id=payload.get("sub", ""),
                email=payload.get("email", ""),
                role="admin",  # Everyone is admin in demo mode
                is_demo=True
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid demo token"
            )
    
    # Production mode - validate with Supabase
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service not configured"
        )
    
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        user = user_response.user
        
        # Fetch user's role from profiles table
        profile_response = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
        
        if not profile_response.data:
            # User exists in auth but not in profiles - this shouldn't happen
            # but we'll handle it gracefully
            role = "user"
        else:
            role = profile_response.data.get("role", "user")
        
        return AuthUser(
            id=user.id,
            email=user.email or "",
            role=role,
            is_demo=False
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthUser]:
    """
    Optional authentication - returns user if authenticated, None otherwise.
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_role(required_role: str):
    """
    Dependency to require a specific role.
    
    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(
            user: AuthUser = Depends(require_role("admin"))
        ):
            return {"message": "Admin access granted"}
    """
    async def role_checker(
        current_user: AuthUser = Depends(get_current_user)
    ) -> AuthUser:
        if required_role == "admin" and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        elif required_role == "super_admin" and not current_user.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super admin access required"
            )
        elif required_role == "user":
            # All authenticated users have at least user role
            pass
        
        return current_user
    
    return role_checker


# Convenience dependencies
require_admin = require_role("admin")
require_super_admin = require_role("super_admin")