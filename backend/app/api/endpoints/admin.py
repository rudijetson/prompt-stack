"""
Admin API endpoints.

Provides administrative functionality for managing users, viewing stats,
and system configuration. All endpoints require admin role.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr

from app.core.auth import AuthUser, require_admin, require_super_admin
from app.services.supabase import get_client as get_supabase_client
from app.services.auth.role_service import role_service
from app.models.common import StandardResponse, create_success_response
from app.core.config import settings

router = APIRouter()


class PromoteUserRequest(BaseModel):
    email: EmailStr
    role: str = "admin"
    reason: Optional[str] = None


class UserStats(BaseModel):
    total_users: int
    active_today: int
    new_this_week: int
    admins: int


@router.get("/stats", response_model=StandardResponse[Dict[str, Any]])
async def get_admin_stats(
    current_user: AuthUser = Depends(require_admin)
):
    """
    Get admin dashboard statistics.
    
    Returns user counts, activity metrics, and system health.
    Requires admin role.
    """
    supabase = get_supabase_client()
    
    if current_user.is_demo:
        # Return demo stats
        return create_success_response({
            "totalUsers": 42,
            "activeToday": 15,
            "totalRequests": 1337,
            "systemHealth": "healthy",
            "newThisWeek": 8,
            "admins": 3
        })
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Get total users
        total_users = supabase.table("profiles").select("id", count="exact").execute()
        
        # Get users active in last 24 hours
        yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
        active_today = supabase.table("profiles")\
            .select("id", count="exact")\
            .gte("updated_at", yesterday)\
            .execute()
        
        # Get new users this week
        week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        new_this_week = supabase.table("profiles")\
            .select("id", count="exact")\
            .gte("created_at", week_ago)\
            .execute()
        
        # Get admin count
        admins = supabase.table("profiles")\
            .select("id", count="exact")\
            .in_("role", ["admin", "super_admin"])\
            .execute()
        
        return create_success_response({
            "totalUsers": total_users.count or 0,
            "activeToday": active_today.count or 0,
            "totalRequests": 0,  # Would need request tracking
            "systemHealth": "healthy",
            "newThisWeek": new_this_week.count or 0,
            "admins": admins.count or 0
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.get("/users", response_model=StandardResponse[List[Dict[str, Any]]])
async def list_users(
    current_user: AuthUser = Depends(require_admin),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    role: Optional[str] = Query(None)
):
    """
    List all users with pagination.
    
    Requires admin role.
    """
    supabase = get_supabase_client()
    
    if current_user.is_demo:
        # Return demo users
        return create_success_response([
            {"id": "demo1", "email": "user1@example.com", "role": "user", "created_at": datetime.utcnow().isoformat()},
            {"id": "demo2", "email": "admin@example.com", "role": "admin", "created_at": datetime.utcnow().isoformat()},
            {"id": "demo3", "email": "user2@example.com", "role": "user", "created_at": datetime.utcnow().isoformat()},
        ])
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        query = supabase.table("profiles").select("*")
        
        if role:
            query = query.eq("role", role)
        
        result = query.range(offset, offset + limit - 1).execute()
        
        return create_success_response(result.data or [])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


@router.post("/users/{user_id}/promote", response_model=StandardResponse[Dict[str, str]])
async def promote_user(
    user_id: str,
    request: PromoteUserRequest,
    current_user: AuthUser = Depends(require_admin)
):
    """
    Promote a user to admin role.
    
    Requires admin role.
    """
    if current_user.is_demo:
        return create_success_response({
            "message": "User promoted successfully (demo mode)",
            "user_id": user_id,
            "new_role": request.role
        })
    
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Use the database function for safe promotion
        result = supabase.rpc(
            "promote_to_admin",
            {
                "user_email": request.email,
                "reason": request.reason or f"Promoted by {current_user.email}"
            }
        ).execute()
        
        if result.data:
            return create_success_response({
                "message": "User promoted successfully",
                "email": request.email,
                "new_role": request.role
            })
        else:
            raise HTTPException(status_code=404, detail="User not found or already admin")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to promote user: {str(e)}")


@router.get("/audit/roles", response_model=StandardResponse[List[Dict[str, Any]]])
async def get_role_audit_log(
    current_user: AuthUser = Depends(require_admin),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[str] = Query(None)
):
    """
    Get role change audit log.
    
    Requires admin role.
    """
    if current_user.is_demo:
        return create_success_response([
            {
                "id": "audit1",
                "user_id": "user1",
                "changed_by": "admin1",
                "old_role": "user",
                "new_role": "admin",
                "reason": "Initial admin setup",
                "created_at": datetime.utcnow().isoformat()
            }
        ])
    
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        query = supabase.table("role_audit").select("*")
        
        if user_id:
            query = query.eq("user_id", user_id)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return create_success_response(result.data or [])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch audit log: {str(e)}")


@router.delete("/users/{user_id}", response_model=StandardResponse[Dict[str, str]])
async def delete_user(
    user_id: str,
    current_user: AuthUser = Depends(require_super_admin)
):
    """
    Delete a user account.
    
    Requires super_admin role.
    Cannot delete your own account.
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    if current_user.is_demo:
        return create_success_response({
            "message": "User deleted successfully (demo mode)",
            "user_id": user_id
        })
    
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Check if user exists and is not the last admin
        user_result = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
        
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # If deleting an admin, ensure there's at least one other
        if user_result.data.get("role") in ["admin", "super_admin"]:
            admin_count = supabase.table("profiles")\
                .select("id", count="exact")\
                .in_("role", ["admin", "super_admin"])\
                .neq("id", user_id)\
                .execute()
            
            if admin_count.count == 0:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot delete the last admin"
                )
        
        # Delete the user (cascade will handle profile)
        delete_result = supabase.auth.admin.delete_user(user_id)
        
        return create_success_response({
            "message": "User deleted successfully",
            "user_id": user_id
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


@router.get("/config", response_model=StandardResponse[Dict[str, Any]])
async def get_system_config(
    current_user: AuthUser = Depends(require_admin)
):
    """
    Get system configuration (safe values only).
    
    Requires admin role.
    """
    return create_success_response({
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "features": {
            "auth": bool(settings.SUPABASE_URL),
            "ai": bool(settings.OPENAI_API_KEY or settings.ANTHROPIC_API_KEY),
            "payments": bool(settings.STRIPE_SECRET_KEY or settings.LEMONSQUEEZY_API_KEY),
            "email": bool(settings.RESEND_API_KEY)
        },
        "admin_emails_count": len(settings.ADMIN_EMAILS) if isinstance(settings.ADMIN_EMAILS, list) else 0,
        "cors_origins": settings.CORS_ORIGINS
    })