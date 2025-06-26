"""
System endpoints for capability detection and status reporting.

Provides a single source of truth for frontend and other services
to understand what capabilities are available.
"""

from fastapi import APIRouter
from typing import Dict, Any

from app.models.common import StandardResponse
from app.core.response_utils import success_response
from app.core.capabilities import CAPABILITIES


router = APIRouter()


@router.get("/capabilities", response_model=StandardResponse[Dict[str, Any]])
async def get_capabilities():
    """
    Get current system capabilities and configuration status.
    
    This endpoint provides the single source of truth for what services
    are available and in what mode they're running. Frontend should use
    this to determine feature availability.
    
    Returns:
        System capabilities including:
        - Overall mode (demo/mixed/production)
        - Individual service statuses
        - Available features
        
    Example response:
    {
        "success": true,
        "data": {
            "mode": "mixed",
            "is_demo": false,
            "capabilities": {
                "auth": "production",
                "database": "production",
                "openai": "production",
                "anthropic": "demo",
                "payments": "demo"
            },
            "features": {
                "authentication": {
                    "enabled": true,
                    "provider": "supabase"
                },
                "ai_providers": {
                    "enabled": true,
                    "available": ["demo", "openai"]
                }
            }
        }
    }
    """
    return success_response(CAPABILITIES.get_status_summary())


@router.get("/status", response_model=StandardResponse[Dict[str, Any]])
async def get_system_status():
    """
    Get simplified system status.
    
    Provides a quick check for overall system health and mode.
    
    Returns:
        Simplified status information
    """
    status = {
        "healthy": True,
        "demo_mode": CAPABILITIES.is_demo_mode,
        "has_auth": CAPABILITIES.has_real_auth,
        "has_ai": CAPABILITIES.has_real_ai_providers,
        "mode": CAPABILITIES.get_status_summary()["mode"]
    }
    
    return success_response(status)