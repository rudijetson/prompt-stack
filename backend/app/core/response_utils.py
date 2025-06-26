"""
Response utilities for consistent API responses.
"""

from typing import Any, Dict, Optional, Union
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response format."""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None
    code: Optional[str] = None


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200
) -> JSONResponse:
    """Create a successful response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "data": data,
            "message": message,
            "error": None,
            "code": None
        }
    )


def error_response(
    error: str,
    status_code: int = 400,
    code: Optional[str] = None,
    data: Any = None
) -> JSONResponse:
    """Create an error response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "data": data,
            "message": None,
            "error": error,
            "code": code
        }
    )


def paginated_response(
    items: list,
    total: int,
    page: int = 1,
    per_page: int = 20,
    message: str = "Success"
) -> JSONResponse:
    """Create a paginated response."""
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "items": items,
                "pagination": {
                    "total": total,
                    "page": page,
                    "per_page": per_page,
                    "pages": (total + per_page - 1) // per_page
                }
            },
            "message": message,
            "error": None,
            "code": None
        }
    )


def created_response(
    data: Any,
    message: str = "Resource created successfully"
) -> JSONResponse:
    """Create a 201 Created response."""
    return success_response(data=data, message=message, status_code=201)


def no_content_response() -> JSONResponse:
    """Create a 204 No Content response."""
    return JSONResponse(status_code=204, content=None)


def accepted_response(
    data: Any = None,
    message: str = "Request accepted for processing"
) -> JSONResponse:
    """Create a 202 Accepted response."""
    return success_response(data=data, message=message, status_code=202)


def server_error(
    error: str = "Internal server error",
    code: Optional[str] = None
) -> JSONResponse:
    """Create a 500 Internal Server Error response."""
    return error_response(error=error, status_code=500, code=code)


def forbidden(
    error: str = "Forbidden",
    code: Optional[str] = None
) -> JSONResponse:
    """Create a 403 Forbidden response."""
    return error_response(error=error, status_code=403, code=code)


def bad_request(
    error: str = "Bad request",
    code: Optional[str] = None
) -> JSONResponse:
    """Create a 400 Bad Request response."""
    return error_response(error=error, status_code=400, code=code)