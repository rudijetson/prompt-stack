# Naming Conventions

Consistent naming helps developers and AI assistants generate compatible code. This guide covers all naming patterns used in the Prompt-Stack codebase.

## File Naming

| Context | Pattern | Examples |
|---------|---------|----------|
| **Backend Python Files** | `snake_case.py` | `auth_service.py`, `rate_limiter.py`, `llm_service.py` |
| **Frontend TypeScript** | `camelCase.ts` or `PascalCase.tsx` | `useAuth.ts`, `LoginForm.tsx`, `api.ts` |
| **Frontend Pages** | `page.tsx` in kebab-case folders | `auth/login/page.tsx`, `test-ai/page.tsx` |
| **API Endpoints** | `snake_case.py` | `payments_demo.py`, `vectordb.py` |
| **Components** | `PascalCase.tsx` | `AnimatedTerminal.tsx`, `ThemeSwitcher.tsx` |
| **Hooks** | `useCamelCase.ts` | `useTheme.ts`, `useCapabilities.ts` |
| **Services** | `camelCase.ts` (frontend) / `snake_case.py` (backend) | `authService.ts`, `llm_service.py` |
| **Config Files** | `lowercase` or `snake_case` | `config.py`, `tailwind.config.js` |
| **SQL Files** | `###_snake_case.sql` | `001_initial_schema.sql`, `002_add_user_roles.sql` |
| **Test Files** | `test_*.py` or `*.test.tsx` | `test_auth.py`, `LoginForm.test.tsx` |

## Variable & Function Naming

### Python (Backend)

```python
# Variables: snake_case
user_id = "123"
is_demo_mode = True
max_retry_attempts = 3

# Functions: snake_case
def get_current_user():
    pass

async def generate_text():
    pass

def calculate_token_cost():
    pass

# Classes: PascalCase
class LLMService:
    pass

class StandardResponse:
    pass

class AuthenticationError(Exception):
    pass

# Constants: UPPER_SNAKE_CASE
DEMO_MODE = "auto"
MAX_TOKENS = 500
DEFAULT_TEMPERATURE = 0.7

# Private methods: _snake_case
def _validate_input():
    pass

# Module-level private: _snake_case
_internal_cache = {}
```

### TypeScript (Frontend)

```typescript
// Variables: camelCase
const userId = "123"
const isDemoMode = true
const maxRetryAttempts = 3

// Functions: camelCase
function getCurrentUser() {}
async function generateText() {}
const calculateTokenCost = () => {}

// React Components: PascalCase
function LoginForm() {}
export function NavigationBar() {}
const UserProfile: FC = () => {}

// Interfaces/Types: PascalCase
interface ApiResponse {}
type UserRole = 'admin' | 'user'
interface PaymentProvider {}

// Enums: PascalCase with PascalCase values
enum AuthState {
  Loading = 'loading',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated'
}

// Constants: UPPER_SNAKE_CASE or camelCase
const API_URL = 'http://localhost:8000'
const maxRetries = 3
export const DEFAULT_TIMEOUT = 5000

// Private functions: camelCase (no underscore in TS)
function validateInput() {}
```

## Environment Variables

Always use `UPPER_SNAKE_CASE`:

```bash
# Backend
SUPABASE_URL=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
DEMO_MODE=auto
MAX_UPLOAD_SIZE=10485760

# Frontend (must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## API Endpoints

Use kebab-case for URLs, descriptive resource names:

```
GET    /api/users                 # List resources
GET    /api/users/{id}           # Get single resource
POST   /api/users                # Create resource
PUT    /api/users/{id}           # Update resource
DELETE /api/users/{id}           # Delete resource

POST   /api/auth/sign-in         # Kebab-case for actions
POST   /api/llm/generate-text    # Descriptive action names
GET    /api/payments-demo/status # Hyphenated compound words
```

## Database Naming

### Tables
- Use `snake_case` plural: `users`, `documents`, `payment_methods`
- Junction tables: `{table1}_{table2}` (alphabetical): `user_roles`, `document_tags`

### Columns
- Use `snake_case`: `user_id`, `created_at`, `is_active`
- Boolean columns: prefix with `is_`, `has_`, `can_`: `is_verified`, `has_premium`
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Foreign keys: `{table}_id`: `user_id`, `document_id`

### Indexes
- Pattern: `idx_{table}_{column(s)}`: `idx_users_email`, `idx_documents_user_id_created_at`

### RLS Policies
- Use descriptive sentences: `"Users can view own profile"`, `"Admins can update any user"`

## Git Conventions

### Branch Names
```
feature/add-payment-processing
fix/auth-redirect-issue
chore/update-dependencies
docs/api-documentation
```

### Commit Messages
Follow Conventional Commits:
```
feat: add Stripe payment integration
fix: resolve JWT token expiration issue
docs: update API endpoint documentation
chore: upgrade to Next.js 15
refactor: simplify auth flow logic
test: add user service unit tests
```

## Common Acronyms & Abbreviations

Keep these consistent across the codebase:

| Acronym | Usage |
|---------|--------|
| API | `API` (all caps) |
| URL | `URL` (all caps) |
| ID | `ID` in types, `id` in variables |
| JWT | `JWT` (all caps) |
| UUID | `UUID` in types, `uuid` in variables |
| DB | `DB` (all caps) |
| UI/UX | `UI`/`UX` (all caps) |

## Special Patterns

### Error Codes
Use `UPPER_SNAKE_CASE` with descriptive names:
```python
class ErrorCodes:
    AUTH_REQUIRED = "AUTH_REQUIRED"
    INVALID_TOKEN = "INVALID_TOKEN"
    RATE_LIMITED = "RATE_LIMITED"
    INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS"
```

### Event Names
Use `snake_case` for backend, `camelCase` for frontend:
```python
# Backend
emit_event("user_signed_up", data)
emit_event("payment_completed", data)

// Frontend
emitEvent('userSignedUp', data)
emitEvent('paymentCompleted', data)
```

### Feature Flags
Use `UPPER_SNAKE_CASE`:
```python
ENABLE_NEW_DASHBOARD = True
SHOW_BETA_FEATURES = False
USE_EXPERIMENTAL_AI = False
```

## Naming Checklist for AI

When generating code, verify:
- [ ] File name matches the pattern for its type
- [ ] Variables use the correct case for the language
- [ ] Functions follow language conventions
- [ ] API endpoints use kebab-case
- [ ] Database objects use snake_case
- [ ] Environment variables are UPPER_SNAKE_CASE
- [ ] Imports are organized (stdlib → third-party → local)