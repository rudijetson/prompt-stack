# Error Handling Patterns

Consistent error handling improves debugging and user experience. This guide defines patterns for both backend and frontend error handling.

## Error Response Format

All API errors follow the standard response format:

```json
{
  "success": false,
  "data": null,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {  // Optional
    "field": "email",
    "reason": "Invalid format"
  }
}
```

## Backend Error Handling

### Error Codes

Define all error codes in a central location:

```python
# app/core/errors.py
from enum import Enum

class ErrorCode(str, Enum):
    # Authentication & Authorization
    AUTH_REQUIRED = "AUTH_REQUIRED"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    
    # Validation
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    
    # Resource Errors
    NOT_FOUND = "NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    CONFLICT = "CONFLICT"
    
    # Rate Limiting
    RATE_LIMITED = "RATE_LIMITED"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
    
    # Payment Errors
    PAYMENT_REQUIRED = "PAYMENT_REQUIRED"
    INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    
    # External Service Errors
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    OPENAI_ERROR = "OPENAI_ERROR"
    STRIPE_ERROR = "STRIPE_ERROR"
    
    # Server Errors
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
```

### Custom Exception Classes

```python
# app/core/exceptions.py
from typing import Optional, Dict, Any
from fastapi import HTTPException

class AppException(HTTPException):
    """Base application exception with standard error format."""
    
    def __init__(
        self,
        message: str,
        code: ErrorCode,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.details = details
        super().__init__(status_code=status_code, detail=message)

class AuthenticationError(AppException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            code=ErrorCode.AUTH_REQUIRED,
            status_code=401
        )

class AuthorizationError(AppException):
    """Raised when user lacks permissions."""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            message=message,
            code=ErrorCode.INSUFFICIENT_PERMISSIONS,
            status_code=403
        )

class ValidationError(AppException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, field: Optional[str] = None):
        details = {"field": field} if field else None
        super().__init__(
            message=message,
            code=ErrorCode.VALIDATION_ERROR,
            status_code=400,
            details=details
        )

class NotFoundError(AppException):
    """Raised when resource is not found."""
    
    def __init__(self, resource: str):
        super().__init__(
            message=f"{resource} not found",
            code=ErrorCode.NOT_FOUND,
            status_code=404
        )

class RateLimitError(AppException):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, retry_after: int):
        super().__init__(
            message="Rate limit exceeded",
            code=ErrorCode.RATE_LIMITED,
            status_code=429,
            details={"retry_after": retry_after}
        )
```

### Exception Handlers

Register global exception handlers:

```python
# app/core/exceptions.py
from fastapi import Request
from fastapi.responses import JSONResponse
from app.models.common import create_error_response

async def app_exception_handler(request: Request, exc: AppException):
    """Handle application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(
            error=exc.message,
            code=exc.code,
            details=exc.details
        ).dict()
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content=create_error_response(
            error="Validation error",
            code=ErrorCode.VALIDATION_ERROR,
            details={"errors": errors}
        ).dict()
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    # Log the full exception for debugging
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Return generic error to client
    return JSONResponse(
        status_code=500,
        content=create_error_response(
            error="Internal server error",
            code=ErrorCode.INTERNAL_ERROR
        ).dict()
    )

# Register in main.py
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)
```

### Service Layer Error Handling

```python
# app/services/llm/llm_service.py
class LLMService:
    async def generate_text(self, prompt: str) -> LLMResponse:
        """Generate text with proper error handling."""
        try:
            # Validate input
            if not prompt:
                raise ValidationError("Prompt cannot be empty", field="prompt")
            
            if len(prompt) > MAX_PROMPT_LENGTH:
                raise ValidationError(
                    f"Prompt exceeds maximum length of {MAX_PROMPT_LENGTH}",
                    field="prompt"
                )
            
            # Check rate limits
            if not await self.check_rate_limit(user_id):
                raise RateLimitError(retry_after=60)
            
            # Make API call
            response = await self._call_api(prompt)
            
            # Handle API-specific errors
            if response.status_code == 429:
                raise AppException(
                    message="OpenAI rate limit exceeded",
                    code=ErrorCode.OPENAI_ERROR,
                    status_code=429,
                    details={"retry_after": response.headers.get("retry-after")}
                )
            
            return self._parse_response(response)
            
        except httpx.TimeoutException:
            raise AppException(
                message="Request timed out",
                code=ErrorCode.EXTERNAL_SERVICE_ERROR,
                status_code=504
            )
        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling OpenAI: {e}")
            raise AppException(
                message="Failed to connect to AI service",
                code=ErrorCode.EXTERNAL_SERVICE_ERROR,
                status_code=503
            )
```

### Database Error Handling

```python
# app/services/database.py
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

async def create_user(user_data: UserCreate) -> User:
    """Create user with database error handling."""
    try:
        user = User(**user_data.dict())
        db.add(user)
        await db.commit()
        return user
        
    except IntegrityError as e:
        await db.rollback()
        if "unique constraint" in str(e).lower():
            raise AppException(
                message="User with this email already exists",
                code=ErrorCode.ALREADY_EXISTS,
                status_code=409
            )
        raise AppException(
            message="Database constraint violation",
            code=ErrorCode.DATABASE_ERROR,
            status_code=400
        )
    
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error(f"Database error: {e}")
        raise AppException(
            message="Database operation failed",
            code=ErrorCode.DATABASE_ERROR,
            status_code=500
        )
```

## Frontend Error Handling

### Error Types

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field })
  }
}

export class AuthError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401)
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message)
    this.name = 'NetworkError'
  }
}
```

### API Client Error Handling

```typescript
// lib/api.ts
import { ApiError, NetworkError } from './errors'

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    const data = await response.json()
    
    // Handle error responses
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error || 'Request failed',
        data.code || 'UNKNOWN_ERROR',
        response.status,
        data.details
      )
    }
    
    return data.data
    
  } catch (error) {
    // Network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new NetworkError('Unable to connect to server')
    }
    
    // Re-throw API errors
    if (error instanceof ApiError) {
      throw error
    }
    
    // Unexpected errors
    console.error('Unexpected error:', error)
    throw new Error('An unexpected error occurred')
  }
}
```

### React Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error tracking service
    // trackError(error, errorInfo)
  }
  
  reset = () => {
    this.setState({ hasError: false, error: null })
  }
  
  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return <Fallback error={this.state.error!} reset={this.reset} />
    }
    
    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

### Hook Error Handling

```typescript
// hooks/useApiCall.ts
import { useState, useCallback } from 'react'
import { ApiError } from '@/lib/errors'

interface UseApiCallResult<T> {
  data: T | null
  error: Error | null
  loading: boolean
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiCallResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)
  
  const execute = useCallback(async (...args: any[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      
      // Handle specific error types
      if (error instanceof ApiError) {
        if (error.code === 'AUTH_REQUIRED') {
          // Redirect to login
          window.location.href = '/auth/login'
        } else if (error.code === 'RATE_LIMITED') {
          // Show rate limit message
          toast.error('Too many requests. Please try again later.')
        }
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFunction])
  
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])
  
  return { data, error, loading, execute, reset }
}
```

### Form Error Handling

```typescript
// components/forms/LoginForm.tsx
export function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { signIn } = useAuth()
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      // Client-side validation
      const validationErrors: Record<string, string> = {}
      
      if (!email) {
        validationErrors.email = 'Email is required'
      } else if (!isValidEmail(email)) {
        validationErrors.email = 'Invalid email format'
      }
      
      if (!password) {
        validationErrors.password = 'Password is required'
      } else if (password.length < 8) {
        validationErrors.password = 'Password must be at least 8 characters'
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
      
      // API call
      await signIn(email, password)
      
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'VALIDATION_ERROR' && error.details?.field) {
          // Field-specific error
          setErrors({ [error.details.field]: error.message })
        } else {
          // General error
          setErrors({ general: error.message })
        }
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {errors.general}
        </div>
      )}
      
      <div className="mb-4">
        <input
          name="email"
          type="email"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      {/* Rest of form */}
    </form>
  )
}
```

## Error Monitoring

### Backend Logging

```python
# app/core/logging.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging."""
    
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        if hasattr(record, 'user_id'):
            log_obj['user_id'] = record.user_id
            
        if hasattr(record, 'request_id'):
            log_obj['request_id'] = record.request_id
            
        if record.exc_info:
            log_obj['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

# Configure logging
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

### Frontend Error Tracking

```typescript
// lib/monitoring.ts
interface ErrorContext {
  user?: { id: string; email: string }
  route?: string
  action?: string
  extra?: Record<string, any>
}

export function trackError(error: Error, context?: ErrorContext) {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error tracked:', error, context)
    return
  }
  
  // In production, send to error tracking service
  // Example: Sentry, LogRocket, etc.
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        app: context
      }
    })
  }
}
```

## Best Practices

1. **Never expose internal details** in production error messages
2. **Log errors with context** (user ID, request ID, etc.)
3. **Use appropriate HTTP status codes**
4. **Provide actionable error messages** to users
5. **Handle errors at the appropriate level** (don't catch too early)
6. **Fail fast** for programming errors
7. **Retry transient failures** with exponential backoff
8. **Monitor error rates** and set up alerts
9. **Test error paths** as thoroughly as success paths
10. **Document expected errors** in API documentation