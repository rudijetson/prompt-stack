"""
Role management service for handling user roles and permissions.

This service integrates with Supabase auth and our custom role system.
"""

from typing import Optional, List
from app.core.config import settings
from app.services.supabase import get_client
from app.core.demo import demo_service
import logging

logger = logging.getLogger(__name__)


class RoleService:
    """Service for managing user roles and permissions."""
    
    def __init__(self):
        self.supabase = get_client()
        self.admin_emails = settings.ADMIN_EMAILS if isinstance(settings.ADMIN_EMAILS, list) else []
    
    def get_user_role_for_signup(self, email: str, is_first_user: bool = False) -> str:
        """
        Determine what role a user should have during signup.
        
        Args:
            email: User's email address
            is_first_user: Whether this is the first user in the system
            
        Returns:
            Role string: 'user', 'admin', or 'super_admin'
        """
        # In demo mode, everyone is admin for testing
        if demo_service.is_demo_mode(settings.SUPABASE_URL):
            return "admin"
        
        # First user is always admin (for fresh installs)
        if is_first_user:
            logger.info(f"First user {email} assigned admin role")
            return "admin"
        
        # Check if email is in predefined admin list
        if email.lower() in [e.lower() for e in self.admin_emails]:
            logger.info(f"User {email} found in ADMIN_EMAILS, assigned admin role")
            return "admin"
        
        # In development, allow +admin email trick
        if settings.ENVIRONMENT == "development" and "+admin" in email:
            logger.info(f"User {email} using +admin trick in development, assigned admin role")
            return "admin"
        
        # Default to regular user
        return "user"
    
    async def check_is_first_user(self) -> bool:
        """Check if there are any existing users in the system."""
        try:
            if demo_service.is_demo_mode(settings.SUPABASE_URL):
                return False  # In demo mode, never first user
            
            # Check profiles table for existing users
            result = self.supabase.table("profiles").select("id", count="exact").limit(1).execute()
            return result.count == 0
        except Exception as e:
            logger.error(f"Error checking first user status: {e}")
            return False
    
    async def update_user_role_after_signup(self, email: str) -> bool:
        """
        Update user role after signup if they're in ADMIN_EMAILS.
        This handles cases where the trigger didn't have access to env vars.
        
        Args:
            email: User's email address
            
        Returns:
            True if role was updated, False otherwise
        """
        try:
            if demo_service.is_demo_mode(settings.SUPABASE_URL):
                return False
            
            # Check if email should be admin
            if email.lower() in [e.lower() for e in self.admin_emails]:
                # Call the database function to promote user
                result = self.supabase.rpc(
                    "promote_to_admin",
                    {"user_email": email}
                ).execute()
                
                if result.data:
                    logger.info(f"Promoted {email} to admin role")
                    return True
            
            return False
        except Exception as e:
            logger.error(f"Error updating user role: {e}")
            return False
    
    async def check_user_role(self, user_id: str) -> Optional[str]:
        """
        Check the role of a specific user.
        
        Args:
            user_id: User's UUID
            
        Returns:
            Role string or None if not found
        """
        try:
            if demo_service.is_demo_mode(settings.SUPABASE_URL):
                return "admin"  # Everyone is admin in demo mode
            
            result = self.supabase.table("profiles").select("role").eq("id", user_id).single().execute()
            
            if result.data:
                return result.data.get("role", "user")
            
            return None
        except Exception as e:
            logger.error(f"Error checking user role: {e}")
            return None
    
    async def is_admin(self, user_id: str) -> bool:
        """Check if user has admin or super_admin role."""
        role = await self.check_user_role(user_id)
        return role in ["admin", "super_admin"]
    
    async def has_role(self, user_id: str, required_role: str) -> bool:
        """
        Check if user has at least the required role level.
        
        Role hierarchy: super_admin > admin > user
        """
        user_role = await self.check_user_role(user_id)
        
        if not user_role:
            return False
        
        role_hierarchy = {
            "user": ["user", "admin", "super_admin"],
            "admin": ["admin", "super_admin"],
            "super_admin": ["super_admin"]
        }
        
        allowed_roles = role_hierarchy.get(required_role, [])
        return user_role in allowed_roles


# Singleton instance
role_service = RoleService()