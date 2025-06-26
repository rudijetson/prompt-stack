# Development Guide

This guide covers essential development practices for the Prompt-Stack codebase.

## Code Style & Naming Conventions

### File Naming
| Type | Pattern | Example |
|------|---------|---------|
| **Python** | `snake_case.py` | `auth_service.py`, `rate_limiter.py` |
| **TypeScript Components** | `PascalCase.tsx` | `LoginForm.tsx`, `UserProfile.tsx` |
| **TypeScript Utilities** | `camelCase.ts` | `useAuth.ts`, `apiClient.ts` |
| **API Endpoints** | `snake_case.py` | `payments_demo.py`, `vectordb.py` |
| **Test Files** | `test_*.py` or `*.test.tsx` | `test_auth.py`, `LoginForm.test.tsx` |

### Variable & Function Naming

**Python:**
```python
# Variables: snake_case
user_id = "123"
is_demo_mode = True

# Functions: snake_case
def get_current_user():
    pass

# Classes: PascalCase
class LLMService:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_TOKENS = 500
DEMO_MODE = "auto"
```

**TypeScript:**
```typescript
// Variables: camelCase
const userId = "123"
const isDemoMode = true

// Functions: camelCase
function getCurrentUser() {}

// Components: PascalCase
function LoginForm() {}

// Types/Interfaces: PascalCase
interface ApiResponse {}
type UserRole = 'admin' | 'user'

// Constants: UPPER_SNAKE_CASE or camelCase
const API_URL = 'http://localhost:8000'
const maxRetries = 3
```

### API Endpoints
Use kebab-case for URLs:
```
POST   /api/auth/sign-in
POST   /api/llm/generate-text
GET    /api/payments-demo/status
```

## Testing

### Test Structure
```
backend/tests/
├── conftest.py          # Shared fixtures
├── unit/               # Unit tests
├── integration/        # API tests
└── e2e/               # End-to-end tests

frontend/__tests__/
├── setup.ts           # Test setup
├── components/        # Component tests
└── hooks/            # Hook tests
```

### Writing Tests

**Backend (pytest):**
```python
# Pattern: test_{what}_{condition}_{expected_result}
def test_login_valid_credentials_returns_token():
    pass

def test_login_invalid_password_raises_401():
    pass

# Use fixtures for common setup
@pytest.fixture
async def test_user(db_session):
    user = User(email="test@example.com")
    db_session.add(user)
    await db_session.commit()
    return user

# Parametrize for multiple cases
@pytest.mark.parametrize("prompt,expected_error", [
    ("", "Prompt cannot be empty"),
    (None, "Prompt cannot be None"),
])
def test_generate_text_invalid_input(prompt, expected_error):
    with pytest.raises(ValueError, match=expected_error):
        service.generate_text(prompt)
```

**Frontend (Vitest):**
```typescript
describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('calls signIn on submit', async () => {
    const mockSignIn = vi.fn()
    render(<LoginForm onSignIn={mockSignIn} />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })
  })
})
```

### Running Tests
```bash
# Backend
pytest                          # Run all tests
pytest --cov=app               # With coverage
pytest -k "test_login"         # Pattern matching
pytest tests/unit/             # Specific directory

# Frontend
npm test                       # Run all tests
npm test -- --watch           # Watch mode
npm test -- --coverage        # With coverage
npm test LoginForm.test.tsx   # Specific file
```

## Logging

### Log Levels
- **DEBUG**: Detailed debugging info
- **INFO**: Normal operations
- **WARNING**: Concerning but handled
- **ERROR**: Errors needing attention
- **CRITICAL**: System failures

### Backend Logging
```python
import logging
logger = logging.getLogger(__name__)

# Good: Structured with context
logger.info(
    "User login successful",
    extra={
        "user_id": user.id,
        "login_method": "email",
        "ip_address": request.client.host,
    }
)

# Good: Error with context
logger.error(
    "Payment processing failed",
    extra={
        "user_id": user.id,
        "amount": order.total,
        "error_code": e.code,
    },
    exc_info=True
)

# Bad: No context
logger.info(f"User {user.email} logged in")  # Don't log PII
logger.error("Payment failed")  # Missing context
```

### Frontend Logging
```typescript
import { logger } from '@/lib/logger'

// Log with context
logger.info('Payment form submitted', {
  component: 'PaymentForm',
  action: 'submit',
})

// Log errors properly
try {
  const result = await processPayment(data)
  logger.info('Payment successful', { paymentId: result.id })
} catch (error) {
  logger.error('Payment failed', error as Error, {
    component: 'PaymentForm',
    // Don't log sensitive data like card numbers
  })
}
```

### Best Practices
- Never log passwords, tokens, or PII
- Include request/user context
- Use structured logging (JSON)
- Log both success and failure
- Include timing information

## Linting & Formatting

### Configuration Files
- **Python**: `pyproject.toml` (Ruff), `setup.cfg` (mypy)
- **TypeScript**: `.eslintrc.js`, `.prettierrc.js`
- **General**: `.editorconfig`

### Pre-commit Setup
```bash
# Install pre-commit hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Manual Commands
```bash
# Python
ruff check backend/      # Lint
ruff format backend/     # Format
mypy backend/           # Type check

# TypeScript
npm run lint            # ESLint
npm run format          # Prettier
npm run type-check      # TypeScript

# Run all checks
npm run check-all
```

### Common Fixes

**Import Order (Python):**
```python
# Correct order: stdlib → third-party → local
import json
import logging
from typing import Optional

import fastapi
from sqlalchemy import select

from app.models import User
from app.services import auth
```

**Import Order (TypeScript):**
```typescript
// Correct order with newlines between groups
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui'
import { apiClient } from '@/lib/api'

import type { User } from '@/types'
```

**Type Annotations:**
```python
# Always use type hints
def get_user(user_id: str) -> Optional[User]:
    pass

# For complex types
from typing import Dict, List, Optional
def process_data(items: List[Dict[str, Any]]) -> None:
    pass
```

### Disabling Rules
Only when necessary, with explanation:
```python
# Python
result = eval(expr)  # noqa: S307 - Safe: expr is validated

# TypeScript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = external.getData() // External API returns unknown shape
```

## Quick Reference

### Make Commands
```bash
make dev        # Start development
make test       # Run tests
make lint       # Run linters
make format     # Format code
make logs       # View logs
make clean      # Clean up
```

### Environment Variables
```bash
# Backend (.env)
DEMO_MODE=auto
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://...
```

### Git Workflow
```bash
# Branch naming
feature/add-payment-webhook
fix/auth-token-expiry
chore/update-dependencies

# Commit messages (conventional commits)
feat(auth): add OAuth2 support
fix(api): handle rate limit errors
docs: update API documentation
test: add payment service tests
```

## IDE Setup

### VS Code Extensions
- Python: Ruff, Pylance
- TypeScript: ESLint, Prettier
- General: EditorConfig

### VS Code Settings
Already configured in `.vscode/settings.json`:
- Format on save
- Organize imports
- Lint on save