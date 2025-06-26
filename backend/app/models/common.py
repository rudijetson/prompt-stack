"""
COMMON RESPONSE MODELS

This file contains standardized response models used across all API endpoints.
Using these ensures consistent API responses that are easy for AI and developers to understand.

STANDARD RESPONSE FORMAT:
{
    "success": true/false,
    "data": <actual response data>,
    "error": "error message if success=false",
    "code": "ERROR_CODE if success=false"
}

HOW TO USE:
1. Import StandardResponse
2. Return StandardResponse.success(data=your_data)
3. For errors, use StandardResponse.error(error="message", code="ERROR_CODE")

COMMON ERROR CODES:
- AUTH_REQUIRED: User needs to be authenticated
- INVALID_TOKEN: Authentication token is invalid
- NOT_FOUND: Resource not found
- VALIDATION_ERROR: Input validation failed
- RATE_LIMITED: Too many requests
- SERVER_ERROR: Internal server error
"""

from typing import TypeVar, Generic, Optional, Any
from pydantic import BaseModel

# Generic type for data payload
T = TypeVar('T')

class StandardResponse(BaseModel, Generic[T]):
    """
    Standard API response format for all endpoints
    
    Examples:
        Success: {"success": true, "data": {...}}
        Error: {"success": false, "error": "Not found", "code": "NOT_FOUND"}
    """
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    code: Optional[str] = None


def create_success_response(data: Any = None) -> StandardResponse:
    """
    Create a successful response
    
    Args:
        data: The response data (can be dict, list, model, etc.)
        
    Returns:
        StandardResponse with success=True
    """
    return StandardResponse(success=True, data=data)


def create_error_response(error: str, code: str = "ERROR") -> StandardResponse:
    """
    Create an error response
    
    Args:
        error: Human-readable error message
        code: Error code for programmatic handling
        
    Returns:
        StandardResponse with success=False
    """
    return StandardResponse(success=False, error=error, code=code)


# Common error codes as constants for consistency
class ErrorCodes:
    """
    Standard error codes used across the API
    Use these for consistent error handling
    """
    # Authentication errors
    AUTH_REQUIRED = "AUTH_REQUIRED"
    INVALID_TOKEN = "INVALID_TOKEN"
    SESSION_EXPIRED = "SESSION_EXPIRED"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    
    # Resource errors
    NOT_FOUND = "NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    
    # Validation errors
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    
    # Rate limiting
    RATE_LIMITED = "RATE_LIMITED"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
    
    # Server errors
    SERVER_ERROR = "SERVER_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR"
    
    # Business logic errors
    INVALID_OPERATION = "INVALID_OPERATION"
    PRECONDITION_FAILED = "PRECONDITION_FAILED"


# Helper function for creating paginated responses
class PaginatedData(BaseModel, Generic[T]):
    """Data structure for paginated responses"""
    items: list[T]
    total: int
    page: int
    limit: int
    total_pages: int


def create_paginated_response(
    items: list,
    total: int,
    page: int = 1,
    limit: int = 20
) -> StandardResponse[PaginatedData]:
    """
    Create a standardized paginated response
    
    Args:
        items: List of items for current page
        total: Total number of items
        page: Current page number (1-indexed)
        limit: Items per page
        
    Returns:
        StandardResponse with paginated data
    """
    total_pages = (total + limit - 1) // limit  # Ceiling division
    
    paginated_data = PaginatedData(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )
    
    return create_success_response(data=paginated_data)