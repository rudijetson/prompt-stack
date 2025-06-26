# Testing Conventions

This guide defines testing patterns for both backend (Python) and frontend (TypeScript) to ensure consistent, maintainable tests.

## Test Structure

### Backend (Python + pytest)

```
backend/
├── tests/
│   ├── conftest.py              # Shared fixtures
│   ├── unit/
│   │   ├── test_auth.py        # Unit tests
│   │   ├── test_llm_service.py
│   │   └── test_models.py
│   ├── integration/
│   │   ├── test_api_auth.py    # API integration tests
│   │   ├── test_api_llm.py
│   │   └── test_database.py
│   └── e2e/
│       └── test_user_flow.py   # End-to-end tests
```

### Frontend (TypeScript + Vitest)

```
frontend/
├── __tests__/
│   ├── setup.ts                 # Test setup
│   ├── unit/
│   │   ├── hooks/
│   │   │   └── useAuth.test.ts
│   │   └── utils/
│   │       └── api.test.ts
│   ├── components/
│   │   ├── LoginForm.test.tsx
│   │   └── Navigation.test.tsx
│   └── e2e/
│       └── auth-flow.test.ts
```

## Backend Testing (pytest)

### Test File Naming
- Always prefix with `test_`: `test_auth.py`, `test_payment_service.py`
- Match the module being tested: `auth.py` → `test_auth.py`

### Test Function Naming
```python
# Pattern: test_{what}_{condition}_{expected_result}
def test_login_valid_credentials_returns_token():
    pass

def test_login_invalid_password_raises_401():
    pass

def test_generate_text_demo_mode_returns_mock_response():
    pass
```

### Test Class Organization
```python
class TestUserService:
    """Test user service functionality."""
    
    class TestAuthentication:
        """Group authentication tests."""
        
        def test_login_success(self):
            pass
            
        def test_login_failure(self):
            pass
    
    class TestAuthorization:
        """Group authorization tests."""
        
        def test_admin_access_allowed(self):
            pass
            
        def test_user_access_denied(self):
            pass
```

### Backend Test Examples

#### Unit Test Example
```python
# tests/unit/test_llm_service.py
import pytest
from unittest.mock import Mock, patch
from app.services.llm import LLMService, LLMProvider

class TestLLMService:
    """Test LLM service functionality."""
    
    @pytest.fixture
    def mock_openai_client(self):
        """Mock OpenAI client."""
        return Mock()
    
    @pytest.fixture
    def llm_service(self, mock_openai_client):
        """Create LLM service with mocked client."""
        with patch('app.services.llm.openai.Client', return_value=mock_openai_client):
            return LLMService(provider=LLMProvider.OPENAI)
    
    def test_generate_text_success(self, llm_service, mock_openai_client):
        """Test successful text generation."""
        # Arrange
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="Generated text"))]
        mock_openai_client.chat.completions.create.return_value = mock_response
        
        # Act
        result = llm_service.generate_text("Test prompt")
        
        # Assert
        assert result.text == "Generated text"
        assert result.tokens > 0
        mock_openai_client.chat.completions.create.assert_called_once()
    
    def test_generate_text_rate_limit_retries(self, llm_service):
        """Test retry logic on rate limit."""
        # Test implementation
        pass
    
    @pytest.mark.parametrize("prompt,expected_error", [
        ("", "Prompt cannot be empty"),
        (" " * 10000, "Prompt exceeds maximum length"),
        (None, "Prompt cannot be None"),
    ])
    def test_generate_text_invalid_input(self, llm_service, prompt, expected_error):
        """Test input validation."""
        with pytest.raises(ValueError, match=expected_error):
            llm_service.generate_text(prompt)
```

#### Integration Test Example
```python
# tests/integration/test_api_auth.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
class TestAuthAPI:
    """Test authentication API endpoints."""
    
    @pytest.fixture
    async def client(self):
        """Create async test client."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client
    
    async def test_signup_creates_user(self, client: AsyncClient):
        """Test user signup flow."""
        # Arrange
        user_data = {
            "email": "test@example.com",
            "password": "SecurePass123!"
        }
        
        # Act
        response = await client.post("/api/auth/signup", json=user_data)
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["user"]["email"] == user_data["email"]
        assert "token" in data["data"]
    
    async def test_signin_with_invalid_credentials(self, client: AsyncClient):
        """Test signin with wrong password."""
        # Arrange
        user_data = {
            "email": "test@example.com",
            "password": "WrongPassword"
        }
        
        # Act
        response = await client.post("/api/auth/signin", json=user_data)
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["code"] == "INVALID_CREDENTIALS"
```

### Fixtures (conftest.py)
```python
# tests/conftest.py
import pytest
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide test database session."""
    # Setup test database
    async with get_test_db() as session:
        yield session
        # Cleanup after test
        await session.rollback()

@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create test user."""
    user = User(
        email="test@example.com",
        role="user"
    )
    db_session.add(user)
    await db_session.commit()
    return user

@pytest.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """Create admin user."""
    user = User(
        email="admin@example.com",
        role="admin"
    )
    db_session.add(user)
    await db_session.commit()
    return user

@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Generate auth headers for test user."""
    token = generate_test_token(test_user)
    return {"Authorization": f"Bearer {token}"}
```

## Frontend Testing (Vitest + React Testing Library)

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Hook tests: `useHookName.test.ts`
- Utility tests: `utilityName.test.ts`

### Frontend Test Examples

#### Component Test Example
```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { LoginForm } from '@/components/auth/LoginForm'
import { AuthProvider } from '@/components/providers/auth-provider'

// Mock the auth hook
vi.mock('@/components/providers/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    signIn: vi.fn(),
    loading: false,
    error: null
  }))
}))

describe('LoginForm', () => {
  const mockSignIn = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: null
    })
  })
  
  it('renders login form with email and password fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
  
  it('calls signIn with form data on submit', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
  
  it('displays error message on failed login', () => {
    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: 'Invalid credentials'
    })
    
    render(<LoginForm />)
    
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })
  
  it('disables form during loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      loading: true,
      error: null
    })
    
    render(<LoginForm />)
    
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})
```

#### Hook Test Example
```typescript
// __tests__/unit/hooks/useCapabilities.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useCapabilities } from '@/lib/hooks/useCapabilities'

// Mock fetch
global.fetch = vi.fn()

describe('useCapabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('fetches capabilities on mount', async () => {
    const mockCapabilities = {
      auth: 'production',
      llm: 'demo',
      payments: 'disabled'
    }
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockCapabilities })
    })
    
    const { result } = renderHook(() => useCapabilities())
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toEqual(mockCapabilities)
    expect(fetch).toHaveBeenCalledWith('/api/system/capabilities')
  })
  
  it('handles fetch error gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
    
    const { result } = renderHook(() => useCapabilities())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe('Network error')
    expect(result.current.data).toBeNull()
  })
})
```

### Test Setup (Vitest)
```typescript
// __tests__/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => '/'
}))

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
```

## Test Categories

### Happy Path Tests
Test the expected successful scenarios:
```python
def test_create_user_with_valid_data_succeeds():
    # Test normal successful operation
```

### Edge Case Tests
Test boundary conditions:
```python
def test_upload_file_at_size_limit_succeeds():
    # Test 10MB file (at limit)

def test_upload_file_over_size_limit_fails():
    # Test 10MB + 1 byte file
```

### Sad Path Tests
Test error scenarios:
```python
def test_payment_with_insufficient_funds_fails():
    # Test payment failure handling

def test_api_call_with_network_timeout_retries():
    # Test timeout and retry logic
```

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern
```python
def test_example():
    # Arrange - Set up test data and mocks
    user = create_test_user()
    mock_service = Mock()
    
    # Act - Execute the code being tested
    result = process_user(user, mock_service)
    
    # Assert - Verify the results
    assert result.success is True
    mock_service.notify.assert_called_once()
```

### 2. One Assertion Per Test (When Possible)
```python
# Good - Focused tests
def test_user_creation_sets_correct_email():
    user = User(email="test@example.com")
    assert user.email == "test@example.com"

def test_user_creation_sets_default_role():
    user = User(email="test@example.com")
    assert user.role == "user"

# Avoid - Multiple unrelated assertions
def test_user_creation():
    user = User(email="test@example.com")
    assert user.email == "test@example.com"
    assert user.role == "user"
    assert user.is_active is True
    assert user.created_at is not None
```

### 3. Descriptive Test Names
```python
# Good - Clear what's being tested
def test_auth_token_expires_after_24_hours():
    pass

# Bad - Vague
def test_token():
    pass
```

### 4. Use Fixtures for Common Setup
```python
@pytest.fixture
def api_client_with_auth():
    """API client with authentication headers."""
    token = generate_test_token()
    return APIClient(headers={"Authorization": f"Bearer {token}"})
```

### 5. Mock External Dependencies
```python
@patch('app.services.email.send_email')
def test_user_signup_sends_welcome_email(mock_send_email):
    # Test without actually sending emails
    create_user("test@example.com")
    mock_send_email.assert_called_once()
```

## Running Tests

### Backend
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_auth.py

# Run tests matching pattern
pytest -k "test_login"

# Run with verbose output
pytest -v

# Run only marked tests
pytest -m "slow"
```

### Frontend
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test LoginForm.test.tsx

# Update snapshots
npm test -- -u
```

## Test Markers (pytest)

```python
# Mark slow tests
@pytest.mark.slow
def test_complex_calculation():
    pass

# Mark tests requiring database
@pytest.mark.database
def test_user_persistence():
    pass

# Mark integration tests
@pytest.mark.integration
def test_api_workflow():
    pass

# Skip test conditionally
@pytest.mark.skipif(not has_gpu(), reason="Requires GPU")
def test_ml_model():
    pass
```

## Coverage Requirements

- **Target**: 80% overall coverage
- **Unit tests**: 90% coverage for business logic
- **Integration tests**: Cover all API endpoints
- **E2E tests**: Cover critical user flows

## Common Testing Utilities

### Backend Test Helpers
```python
# tests/utils/factories.py
def create_test_user(**kwargs):
    """Create user with default test values."""
    defaults = {
        "email": "test@example.com",
        "password": "TestPass123!",
        "role": "user"
    }
    return User(**{**defaults, **kwargs})

def create_test_token(user: User) -> str:
    """Generate JWT token for testing."""
    return jwt.encode({"sub": user.id}, "test-secret")
```

### Frontend Test Helpers
```typescript
// __tests__/utils/test-utils.tsx
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </AuthProvider>
  )
}

export function createMockUser(overrides = {}) {
  return {
    id: '123',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  }
}
```