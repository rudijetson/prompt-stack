"""
API ROUTER

Central routing configuration for all API endpoints.
Add new endpoint modules here to include them in the API.

ENDPOINT GROUPS:
- /auth - Authentication and user management
- /llm - AI text generation and embeddings
- /vectordb - Vector database operations
- /dev - Development helper endpoints (dev mode only)

TO ADD NEW ENDPOINTS:
1. Create new file in app/api/endpoints/
2. Import it here
3. Add router.include_router() line
"""

from fastapi import APIRouter
from app.core.config import settings
from app.api.endpoints import auth, llm, vectordb, dev, upload, health, payments_demo, system, admin

api_router = APIRouter()

# Health check endpoints - no prefix for easy access
api_router.include_router(health.router, prefix="/health", tags=["Health Check"])

# System capability endpoints
api_router.include_router(system.router, prefix="/system", tags=["System"])

# Include sub-routers for different API endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(llm.router, prefix="/llm", tags=["LLM Services"])
api_router.include_router(vectordb.router, prefix="/vectordb", tags=["Vector Database"])
api_router.include_router(upload.router, prefix="/upload", tags=["File Upload"])
# Payment demo endpoints (work without configuration)
api_router.include_router(payments_demo.router, prefix="/payments-demo", tags=["Payment Demo"])

# Full payment endpoints (require configuration)
# api_router.include_router(payments.router, prefix="/payments", tags=["Payments - Stripe"])
# api_router.include_router(payments_ls.router, prefix="/payments", tags=["Payments - Lemon Squeezy"])
# api_router.include_router(payment_comparison.router, prefix="/payments", tags=["Payment Comparison"])

# Development endpoints - only in dev mode
if settings.ENVIRONMENT == "development":
    api_router.include_router(dev.router, prefix="/dev", tags=["Development"])
