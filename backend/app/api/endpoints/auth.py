from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime, timedelta
import jwt

from app.services.supabase import get_client as get_supabase_client
from app.services.supabase.auth import SupabaseAuthService
from app.core.config import settings
from app.services.auth.role_service import role_service
from app.core.auth import get_current_user, AuthUser


router = APIRouter()

# Initialize supabase client
supabase_client = get_supabase_client()


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
async def sign_up(request: SignUpRequest):
    """Create a new user account"""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase is not configured")
    
    try:
        # Check if this will be the first user
        is_first_user = await role_service.check_is_first_user()
        
        # Determine role for this user
        user_role = role_service.get_user_role_for_signup(
            email=request.email,
            is_first_user=is_first_user
        )
        
        # Sign up with role in metadata
        response = supabase_client.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "role": user_role
                }
            }
        })
        
        if response.user:
            # Also update role after signup (in case trigger doesn't have access to ADMIN_EMAILS)
            await role_service.update_user_role_after_signup(request.email)
            
            return {
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "role": user_role
                },
                "session": response.session
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create user")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin")
async def sign_in(request: SignInRequest):
    """Sign in with email and password"""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase is not configured")
    
    try:
        response = supabase_client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if response.user:
            # Fetch user role from profiles table
            profile_response = supabase_client.from_('profiles').select('role').eq('id', response.user.id).single().execute()
            user_role = 'user'  # Default role
            
            if profile_response.data:
                user_role = profile_response.data.get('role', 'user')
            
            return {
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "role": user_role
                },
                "session": response.session
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/signout")
async def sign_out(current_user: AuthUser = Depends(get_current_user)):
    """Sign out the current user"""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase is not configured")
    
    try:
        supabase_client.auth.sign_out()
        return {"message": "Successfully signed out"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_user(current_user: AuthUser = Depends(get_current_user)):
    """Get current user information"""
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role,
            "is_demo": current_user.is_demo
        }
    }


# Demo Auth Endpoints (work without Supabase)
@router.post("/demo/signin")
async def demo_sign_in(request: SignInRequest):
    """Demo sign in - works without Supabase configuration"""
    # Generate a mock user
    user_id = str(uuid.uuid4())
    
    # Create a simple JWT token for demo purposes
    token_data = {
        "sub": user_id,
        "email": request.email,
        "demo": True,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    
    # Use a static secret for demo mode
    demo_secret = "demo-secret-key-not-for-production"
    token = jwt.encode(token_data, demo_secret, algorithm="HS256")
    
    return {
        "user": {
            "id": user_id,
            "email": request.email,
            "demo": True,
            "role": "admin"  # Everyone is admin in demo mode
        },
        "session": {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 604800  # 7 days
        }
    }


@router.post("/demo/signup")
async def demo_sign_up(request: SignUpRequest):
    """Demo sign up - works without Supabase configuration"""
    # For demo, just sign them in directly
    return await demo_sign_in(SignInRequest(email=request.email, password=request.password))


@router.get("/demo/check")
async def demo_check_auth():
    """Check if demo auth is available"""
    return {
        "available": True,
        "message": "Demo authentication is available. Use /api/auth/demo/signin or /api/auth/demo/signup"
    }