"""
HEALTH CHECK ENDPOINTS

Simple health check endpoints for monitoring.
Useful for Docker health checks, load balancers, and uptime monitoring.

ENDPOINTS:
- GET /health - Basic health check
- GET /health/detailed - Detailed health with service status
- GET /health/features - Feature configuration status
"""

from fastapi import APIRouter, Depends
from datetime import datetime
from typing import Dict, Any
import sys

from app.core.config import settings
from app.models.common import StandardResponse, create_success_response
from app.core.features import features

router = APIRouter()


@router.get("/", response_model=StandardResponse[Dict[str, Any]])
async def health_check():
    """
    Basic health check endpoint.
    
    Returns 200 OK if the service is running.
    Used for simple uptime monitoring.
    
    Example response:
    {
        "success": true,
        "data": {
            "status": "healthy",
            "timestamp": "2025-01-21T12:00:00Z"
        }
    }
    """
    return create_success_response({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })


@router.get("/detailed", response_model=StandardResponse[Dict[str, Any]])
async def detailed_health_check():
    """
    Detailed health check with service status.
    
    Checks connectivity to external services and returns their status.
    Useful for debugging and monitoring dashboards.
    
    Example response:
    {
        "success": true,
        "data": {
            "status": "healthy",
            "timestamp": "2025-01-21T12:00:00Z",
            "environment": "development",
            "services": {
                "api": "healthy",
                "database": "connected",
                "ai_providers": ["demo", "openai"],
                "demo_mode": false
            },
            "warnings": ["No payment providers configured"]
        }
    }
    """
    # Get feature status
    feature_status = features.status_summary
    
    # Build services status
    services = {
        "api": "healthy",
        "database": "connected" if features.has_auth else "demo_mode",
        "ai_providers": features.available_providers,
        "authentication": "enabled" if features.has_auth else "demo_mode",
        "payments": "enabled" if features.has_payments else "disabled",
        "demo_mode": features.demo_mode
    }
    
    # Get Python version
    python_version = sys.version.split()[0]
    
    return create_success_response({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": settings.ENVIRONMENT,
        "services": services,
        "versions": {
            "api": "1.0.0",
            "python": python_version
        },
        "warnings": feature_status.get("warnings", []),
        "tips": _get_tips()
    })


def _get_tips():
    """Get helpful tips based on current configuration"""
    tips = []
    
    if features.demo_mode:
        tips.append("To enable real features, add API keys to backend/.env and restart with: docker-compose down && docker-compose up -d")
    
    if not features.has_auth:
        tips.append("Add Supabase credentials to enable authentication and database features")
    
    if not features.has_real_providers:
        tips.append("Add AI provider API keys (OpenAI, Anthropic, etc.) to enable AI features")
    
    if settings.ENVIRONMENT == "development":
        tips.append("API documentation available at: http://localhost:8000/docs")
    
    return tips


@router.get("/features", response_model=StandardResponse[Dict[str, Any]])
async def feature_configuration():
    """
    Get detailed feature configuration status.
    
    Shows which features are enabled based on environment configuration.
    Helpful for understanding what's available in the current setup.
    
    Example response:
    {
        "success": true,
        "data": {
            "demo_mode": false,
            "features": {
                "ai_providers": {
                    "enabled": true,
                    "available": ["demo", "openai", "anthropic"]
                },
                "authentication": {
                    "enabled": true,
                    "provider": "supabase"
                }
            }
        }
    }
    """
    return create_success_response(features.status_summary)