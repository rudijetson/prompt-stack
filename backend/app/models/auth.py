from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserProfile(BaseModel):
    """User profile information."""

    id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None  # ISO format datetime string


class TokenResponse(BaseModel):
    """OAuth token response."""

    access_token: str
    token_type: str
