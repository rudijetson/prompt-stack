"""
Custom exceptions for the application.
Provides consistent error handling across the API.
"""

from fastapi import HTTPException, status


class BaseAPIException(HTTPException):
    """Base exception for all API exceptions."""
    pass


class AuthenticationError(BaseAPIException):
    """Raised when authentication fails."""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthorizationError(BaseAPIException):
    """Raised when user lacks permission."""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class NotFoundError(BaseAPIException):
    """Raised when a resource is not found."""
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found",
        )


class ValidationError(BaseAPIException):
    """Raised when validation fails."""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )


class RateLimitError(BaseAPIException):
    """Raised when rate limit is exceeded."""
    def __init__(self, detail: str = "Rate limit exceeded. Please try again later."):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
        )


class ExternalServiceError(BaseAPIException):
    """Raised when an external service fails."""
    def __init__(self, service: str, detail: str = None):
        message = f"{service} service error"
        if detail:
            message += f": {detail}"
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=message,
        )


class MissingAPIKeyError(BaseAPIException):
    """Raised when required API key is missing."""
    def __init__(self, provider: str):
        detail = (
            f"{provider} API key not found. "
            f"Add {provider.upper()}_API_KEY to your .env file "
            f"or use 'make dev-demo' for demo mode."
        )
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
        )


class DemoModeError(BaseAPIException):
    """Raised when trying to use real features in demo mode."""
    def __init__(self, feature: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{feature} is not available in demo mode. Configure API keys to use this feature.",
        )


# Alias for backward compatibility
AppException = BaseAPIException


class ErrorCodes:
    """Standard error codes for the application."""
    AUTHENTICATION_FAILED = "AUTH_FAILED"
    AUTHORIZATION_FAILED = "AUTH_FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_ERROR"
    MISSING_API_KEY = "MISSING_API_KEY"
    DEMO_MODE_ERROR = "DEMO_MODE_ERROR"


from fastapi import Request
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions with consistent response format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "message": None,
            "error": exc.detail,
            "code": getattr(exc, "code", None)
        }
    )


from fastapi.exceptions import RequestValidationError


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation exceptions with consistent response format."""
    errors = []
    for error in exc.errors():
        errors.append({
            "loc": error["loc"],
            "msg": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "data": None,
            "message": None,
            "error": "Validation error",
            "code": "VALIDATION_ERROR",
            "details": errors
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle general exceptions with consistent response format."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "data": None,
            "message": None,
            "error": "Internal server error",
            "code": "INTERNAL_ERROR"
        }
    )


async def app_exception_handler(request: Request, exc: BaseAPIException) -> JSONResponse:
    """Handle custom app exceptions with consistent response format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "message": None,
            "error": exc.detail,
            "code": getattr(exc, "code", None)
        }
    )