# LLM Codebase Guide for Prompt-Stack

This guide helps LLMs understand the naming conventions, patterns, and structure of the Prompt-Stack codebase for efficient navigation and code generation.

## Table of Contents
1. [Naming Conventions](#naming-conventions)
2. [File Organization](#file-organization)
3. [API Patterns](#api-patterns)
4. [Key Entry Points](#key-entry-points)
5. [Common Patterns](#common-patterns)
6. [Type System](#type-system)
7. [Database Conventions](#database-conventions)

## Naming Conventions

### File Naming

| Context | Pattern | Examples |
|---------|---------|----------|
| **Backend Python Files** | `snake_case.py` | `auth_service.py`, `rate_limiter.py`, `llm_service.py` |
| **Frontend TypeScript** | `camelCase.ts` or `PascalCase.tsx` | `useAuth.ts`, `LoginForm.tsx`, `api.ts` |
| **Frontend Pages** | `page.tsx` in kebab-case folders | `auth/login/page.tsx`, `test-ai/page.tsx` |
| **API Endpoints** | `snake_case.py` | `payments_demo.py`, `vectordb.py` |
| **Components** | `PascalCase.tsx` | `AnimatedTerminal.tsx`, `ThemeSwitcher.tsx` |
| **Hooks** | `useCamelCase.ts` | `useTheme.ts`, `useCapabilities.ts` |
| **Services** | `camelCase.ts` or `snake_case.py` | `email-capture.ts`, `llm_service.py` |
| **Config Files** | `lowercase` or `snake_case` | `config.py`, `tailwind.config.js` |
| **SQL Files** | `###_snake_case.sql` | `001_initial_schema.sql` |

### Variable & Function Naming

**Python (Backend)**:
```python
# Variables: snake_case
user_id = "123"
is_demo_mode = True

# Functions: snake_case
def get_current_user():
    pass

async def generate_text():
    pass

# Classes: PascalCase
class LLMService:
    pass

class StandardResponse:
    pass

# Constants: UPPER_SNAKE_CASE
DEMO_MODE = "auto"
MAX_TOKENS = 500
```

**TypeScript (Frontend)**:
```typescript
// Variables: camelCase
const userId = "123"
const isDemoMode = true

// Functions: camelCase
function getCurrentUser() {}
async function generateText() {}

// React Components: PascalCase
function LoginForm() {}
export function NavigationBar() {}

// Interfaces/Types: PascalCase
interface ApiResponse {}
type UserRole = 'admin' | 'user'

// Constants: UPPER_SNAKE_CASE or camelCase
const API_URL = 'http://localhost:8000'
const maxRetries = 3
```

### Environment Variables

Always use `UPPER_SNAKE_CASE`:
- `SUPABASE_URL`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_API_URL`
- `STRIPE_SECRET_KEY`
- `DEMO_MODE`

Frontend env vars must be prefixed with `NEXT_PUBLIC_` to be accessible.

## File Organization

### Backend Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/      # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── llm.py
│   │   │   └── payments_demo.py
│   │   └── router.py       # Central route registration
│   ├── core/              # Core utilities
│   │   ├── auth.py        # Auth middleware
│   │   ├── config.py      # Settings management
│   │   └── rate_limiter.py
│   ├── models/            # Pydantic models
│   │   ├── auth.py
│   │   ├── common.py      # StandardResponse
│   │   └── llm.py
│   ├── services/          # Business logic
│   │   ├── llm/          # AI services
│   │   ├── supabase/     # Database/auth
│   │   └── vectordb/     # Vector operations
│   └── main.py           # FastAPI app entry
```

### Frontend Structure
```
frontend/
├── app/                   # Next.js 15 app directory
│   ├── (authenticated)/   # Protected routes group
│   │   ├── layout.tsx    # Auth layout wrapper
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── auth/             # Public auth pages
│   │   └── login/
│   │       └── page.tsx
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── auth/            # Auth components
│   ├── forms/           # Form controls
│   ├── layout/          # Layout components
│   └── ui/              # UI components
├── lib/                 # Utilities
│   ├── api.ts          # API client
│   ├── hooks/          # Custom React hooks
│   └── supabase.ts     # Supabase client
└── services/           # API service layers
```

## API Patterns

### Endpoint Naming
- Use kebab-case in URLs: `/api/payments-demo`
- Use descriptive resource names: `/api/llm/generate-text`
- Group related endpoints: `/api/auth/signup`, `/api/auth/signin`

### Standard Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "code": null
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": "Human readable message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `AUTH_REQUIRED`
- `INVALID_TOKEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `RATE_LIMITED`
- `SERVER_ERROR`

## Key Entry Points

### Backend
1. **Main App**: `backend/app/main.py`
   - FastAPI application setup
   - CORS configuration
   - Route mounting

2. **Router**: `backend/app/api/router.py`
   - All API routes registered here
   - Add new endpoints by importing and including

3. **Config**: `backend/app/core/config.py`
   - Environment variable management
   - Demo mode detection

### Frontend
1. **Root Layout**: `frontend/app/layout.tsx`
   - Providers setup (Auth, Theme)
   - Global styles

2. **API Client**: `frontend/lib/api.ts`
   - Centralized fetch wrapper
   - Error handling

3. **Auth Provider**: `frontend/components/providers/auth-provider.tsx`
   - Authentication state management
   - Demo mode handling

## Common Patterns

### Backend Patterns

**Dependency Injection for Auth**:
```python
@router.get("/protected")
async def protected_route(user: AuthUser = Depends(get_current_user)):
    return {"user_id": user.id}
```

**Service Pattern**:
```python
# Abstract base class
class LLMService(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str) -> LLMResponse:
        pass

# Concrete implementation
class OpenAIService(LLMService):
    async def generate_text(self, prompt: str) -> LLMResponse:
        # Implementation
```

**Demo Mode Fallback**:
```python
if settings.is_demo_mode:
    return demo_response()
else:
    return real_service_call()
```

### Frontend Patterns

**API Calls**:
```typescript
// Using the api client
const response = await apiClient<UserData>('/api/users/me', {
  headers: { Authorization: `Bearer ${token}` }
})

// Service layer pattern
export async function generateText(request: TextGenerationRequest) {
  return apiClient<TextGenerationResponse>('/api/llm/generate', {
    method: 'POST',
    body: JSON.stringify(request)
  })
}
```

**Protected Routes**:
```typescript
// Place pages in (authenticated) group
app/(authenticated)/dashboard/page.tsx

// Layout handles auth check
export default function AuthenticatedLayout({ children }) {
  const { user, loading } = useAuth()
  if (!user) redirect('/auth/login')
  return <>{children}</>
}
```

**Custom Hooks**:
```typescript
export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<SystemCapabilities>()
  
  useEffect(() => {
    fetchCapabilities().then(setCapabilities)
  }, [])
  
  return capabilities
}
```

## Type System

### Python Type Hints
```python
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    id: str
    email: EmailStr
    role: Optional[str] = "user"
    metadata: Dict[str, Any] = Field(default_factory=dict)
```

### TypeScript Types
```typescript
// Interfaces for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// Type unions for states
type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

// Discriminated unions
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

## Database Conventions

### Table Naming
- Use `snake_case` for table names: `user_profiles`, `vector_documents`
- Use plural forms: `users`, `documents`, `embeddings`

### Column Naming
- Use `snake_case`: `user_id`, `created_at`, `is_active`
- Timestamps: `created_at`, `updated_at`
- Foreign keys: `{table}_id` (e.g., `user_id`, `document_id`)

### Common Columns
```sql
id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### RLS Policies
Named with descriptive sentences:
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

## Quick Reference

### Adding a New API Endpoint
1. Create file in `backend/app/api/endpoints/`
2. Import in `backend/app/api/router.py`
3. Add router inclusion: `api_router.include_router(new_endpoint.router, prefix="/new", tags=["New"])`

### Adding a New Page
1. Create folder in `frontend/app/`
2. Add `page.tsx` file
3. For protected pages, place under `(authenticated)/`

### Adding a New Service
1. Backend: Create in `backend/app/services/`
2. Frontend: Create in `frontend/services/`
3. Follow existing patterns for that service type

### Common Imports

**Backend**:
```python
from fastapi import APIRouter, HTTPException, Depends
from app.models.common import StandardResponse, create_success_response
from app.core.auth import get_current_user, AuthUser
from app.core.config import settings
```

**Frontend**:
```typescript
import { apiClient } from '@/lib/api'
import { useAuth } from '@/components/providers/auth-provider'
import { useState, useEffect } from 'react'
```