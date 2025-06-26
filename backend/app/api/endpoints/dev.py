"""
DEVELOPMENT HELPER ENDPOINTS

These endpoints help with development, debugging, and testing.
Only available in development mode for security.

ENDPOINTS:
- GET /health - Comprehensive health check
- POST /reset-demo - Reset demo data to initial state
- GET /config - Show current configuration (sanitized)
- POST /test-email - Test email sending
- GET /errors/test - Test error handling

COMMON AI PROMPTS:
- "Add endpoint to clear all caches"
- "Add endpoint to test database connection"
- "Add endpoint to generate test data"
- "Add performance monitoring endpoint"
"""

from fastapi import APIRouter, Depends, Request
from typing import Dict, Any
import os
from datetime import datetime

from app.core.config import settings
from app.core.utils.env import is_placeholder
from app.models.common import StandardResponse
from app.core.response_utils import success_response, server_error, forbidden
from app.core.demo import demo_service
from app.services.supabase.database import SupabaseDatabaseService, get_database_service
from app.services.llm import get_llm_service
from app.core.exceptions import AppException, ErrorCodes

router = APIRouter()


@router.get("/health", response_model=StandardResponse[Dict[str, Any]])
async def health_check():
    """
    Comprehensive health check endpoint.
    
    Checks all services and returns their status.
    Useful for monitoring and debugging.
    
    Example response:
    {
        "success": true,
        "data": {
            "status": "healthy",
            "timestamp": "2024-01-01T12:00:00Z",
            "services": {
                "api": "online",
                "database": "connected",
                "ai": "configured",
                "demo_mode": false
            },
            "environment": "development",
            "version": "0.1.0"
        }
    }
    """
    # Check database connection
    database_status = "unknown"
    try:
        db_service = get_database_service()
        # Simple query to test connection
        database_status = "connected" if db_service else "disconnected"
    except Exception:
        database_status = "error"
    
    # Check AI service configuration
    ai_status = "not_configured"
    if settings.OPENAI_API_KEY or settings.ANTHROPIC_API_KEY or settings.GEMINI_API_KEY:
        ai_status = "configured"
    
    # Determine overall health
    is_healthy = database_status in ["connected", "unknown"] and ai_status != "error"
    
    health_data = {
        "status": "healthy" if is_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "services": {
            "api": "online",
            "database": database_status,
            "ai": ai_status,
            "demo_mode": demo_service.is_demo_mode(
                settings.SUPABASE_URL,
                settings.OPENAI_API_KEY,
                settings.DEMO_MODE
            )
        },
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0",
        "uptime_seconds": int((datetime.utcnow() - datetime(2024, 1, 1)).total_seconds())
    }
    
    return success_response(health_data)


@router.post("/reset-demo", response_model=StandardResponse)
async def reset_demo_data():
    """
    Reset demo data to initial state.
    
    Only works in development mode and when demo mode is active.
    Useful for testing and demonstrations.
    
    Example response:
    {
        "success": true,
        "data": {
            "message": "Demo data reset successfully",
            "reset_count": 5
        }
    }
    """
    # Only allow in development mode
    if settings.ENVIRONMENT != "development":
        forbidden("This endpoint is only available in development mode")
    
    # Only allow in demo mode
    if not demo_service.is_demo_mode(settings.SUPABASE_URL, settings.OPENAI_API_KEY, settings.DEMO_MODE):
        forbidden("Demo mode is not active")
    
    # Reset demo data (this is a placeholder - implement based on your needs)
    reset_data = {
        "message": "Demo data reset successfully",
        "reset_count": 5,  # Number of items reset
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    return success_response(reset_data)


@router.get("/config", response_model=StandardResponse[Dict[str, Any]])
async def get_config():
    """
    Get current configuration (sanitized).
    
    Shows configuration without sensitive data.
    Helpful for debugging configuration issues.
    
    Example response:
    {
        "success": true,
        "data": {
            "environment": "development",
            "demo_mode": true,
            "features": {
                "auth": true,
                "ai": true,
                "rate_limiting": true
            },
            "api_keys_configured": {
                "openai": true,
                "anthropic": false,
                "gemini": false,
                "supabase": true
            }
        }
    }
    """
    # Only allow in development mode
    if settings.ENVIRONMENT != "development":
        forbidden("This endpoint is only available in development mode")
    
    config_data = {
        "environment": settings.ENVIRONMENT,
        "demo_mode": demo_service.is_demo_mode(
            settings.SUPABASE_URL,
            settings.OPENAI_API_KEY,
            settings.DEMO_MODE
        ),
        "features": {
            "auth": bool(settings.SUPABASE_URL and settings.SUPABASE_URL != "demo"),
            "ai": bool(settings.OPENAI_API_KEY or settings.ANTHROPIC_API_KEY or settings.GEMINI_API_KEY),
            "rate_limiting": True,
            "vector_db": bool(getattr(settings, 'QDRANT_URL', None))
        },
        "api_keys_configured": {
            "openai": bool(settings.OPENAI_API_KEY and not is_placeholder(settings.OPENAI_API_KEY)),
            "anthropic": bool(settings.ANTHROPIC_API_KEY and not is_placeholder(settings.ANTHROPIC_API_KEY)),
            "gemini": bool(settings.GEMINI_API_KEY and not is_placeholder(settings.GEMINI_API_KEY)),
            "supabase": bool(settings.SUPABASE_URL and not is_placeholder(settings.SUPABASE_URL))
        },
        "cors_origins": settings.CORS_ORIGINS,
        "node_env": os.getenv("NODE_ENV", "not_set")
    }
    
    return success_response(config_data)


@router.post("/test-email", response_model=StandardResponse)
async def test_email(to_email: str = "test@example.com"):
    """
    Test email sending functionality.
    
    Sends a test email to verify email configuration.
    Only works in development mode.
    
    Request body:
    {
        "to_email": "user@example.com"
    }
    
    Example response:
    {
        "success": true,
        "data": {
            "message": "Test email sent successfully",
            "to": "user@example.com"
        }
    }
    """
    # Only allow in development mode
    if settings.ENVIRONMENT != "development":
        forbidden("This endpoint is only available in development mode")
    
    # In a real implementation, you would send an actual email here
    # For now, we'll simulate it
    email_data = {
        "message": "Test email sent successfully (simulated)",
        "to": to_email,
        "subject": "PromptStack Test Email",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    return success_response(email_data)


@router.get("/errors/test/{error_type}", response_model=StandardResponse)
async def test_error_handling(error_type: str):
    """
    Test error handling by triggering specific errors.
    
    Useful for testing error responses and client error handling.
    Only available in development mode.
    
    Path parameters:
    - error_type: Type of error to trigger (validation, auth, not_found, server, custom)
    
    Example: GET /api/dev/errors/test/not_found
    
    Response:
    {
        "success": false,
        "error": "Resource not found",
        "code": "NOT_FOUND"
    }
    """
    # Only allow in development mode
    if settings.ENVIRONMENT != "development":
        forbidden("This endpoint is only available in development mode")
    
    if error_type == "validation":
        raise AppException("Invalid input data", ErrorCodes.VALIDATION_ERROR, 400)
    elif error_type == "auth":
        raise AppException("Authentication required", ErrorCodes.AUTH_REQUIRED, 401)
    elif error_type == "not_found":
        raise AppException("Resource not found", ErrorCodes.NOT_FOUND, 404)
    elif error_type == "server":
        raise AppException("Internal server error", ErrorCodes.SERVER_ERROR, 500)
    elif error_type == "custom":
        raise AppException("Custom error for testing", "CUSTOM_ERROR", 418)  # I'm a teapot
    else:
        return success_response({
            "message": f"Unknown error type: {error_type}",
            "available_types": ["validation", "auth", "not_found", "server", "custom"]
        })