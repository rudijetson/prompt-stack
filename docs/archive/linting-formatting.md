# Linting & Formatting Rules

This guide defines code style, linting, and formatting rules for the Prompt-Stack codebase.

## Overview

We use automated tools to enforce consistent code style:
- **Python**: Ruff (linting & formatting), mypy (type checking)
- **TypeScript/JavaScript**: ESLint (linting), Prettier (formatting)
- **CSS**: Stylelint
- **Markdown**: markdownlint
- **Commit messages**: commitlint

## Python Style Guide

### Ruff Configuration

```toml
# pyproject.toml
[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "N",      # pep8-naming
    "UP",     # pyupgrade
    "S",      # flake8-bandit (security)
    "T20",    # flake8-print
    "SIM",    # flake8-simplify
    "RUF",    # Ruff-specific rules
]
ignore = [
    "E501",   # line too long (handled by formatter)
    "B008",   # do not perform function calls in argument defaults
    "S101",   # use of assert (needed for tests)
]

[tool.ruff.lint.per-file-ignores]
"tests/*" = ["S101", "S106"]  # Allow asserts and hardcoded passwords in tests
"migrations/*" = ["E501"]      # Allow long lines in migrations

[tool.ruff.lint.isort]
known-first-party = ["app"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

### Type Checking with mypy

```ini
# setup.cfg
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_incomplete_defs = True
check_untyped_defs = True
disallow_untyped_decorators = False
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
warn_no_return = True
warn_unreachable = True
strict_equality = True

[mypy-tests.*]
disallow_untyped_defs = False

[mypy-migrations.*]
ignore_errors = True
```

### Python Code Style Examples

```python
# Good: Clear imports, type hints, docstrings
from typing import Optional, List, Dict
from datetime import datetime
from app.models.user import User
from app.exceptions import NotFoundError


class UserService:
    """Service for user-related operations."""
    
    def __init__(self, db_session: AsyncSession) -> None:
        self.db = db_session
    
    async def get_user(self, user_id: str) -> User:
        """Get user by ID.
        
        Args:
            user_id: The user's unique identifier
            
        Returns:
            User object
            
        Raises:
            NotFoundError: If user not found
        """
        user = await self.db.get(User, user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        return user
    
    async def list_users(
        self,
        *,  # Force keyword-only arguments
        limit: int = 100,
        offset: int = 0,
        role: Optional[str] = None,
    ) -> List[User]:
        """List users with optional filtering."""
        query = select(User)
        
        if role:
            query = query.where(User.role == role)
            
        query = query.offset(offset).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()


# Bad: No types, poor naming, no docs
class user_service:
    def __init__(self, db):
        self.db = db
    
    def get_user(self, id):
        u = self.db.get(User, id)
        if not u:
            raise Exception("not found")
        return u
```

## TypeScript/JavaScript Style Guide

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'jsx-a11y',
    'import',
    'unicorn',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
    }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-boolean-value': ['error', 'never'],
    'react/self-closing-comp': 'error',
    
    // Import
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
    }],
    'import/no-duplicates': 'error',
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-nested-ternary': 'error',
    'unicorn/filename-case': ['error', {
      cases: {
        camelCase: true,
        pascalCase: true,
        kebabCase: true,
      },
    }],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
}
```

### Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
      },
    },
  ],
}
```

### TypeScript Code Style Examples

```typescript
// Good: Clear types, consistent formatting, proper imports
import { useState, useEffect, useCallback } from 'react'

import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { User, UserUpdate } from '@/types/user'

interface UserProfileProps {
  userId: string
  onUpdate?: (user: User) => void
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.get<User>(`/users/${userId}`)
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [userId])
  
  useEffect(() => {
    void loadUser()
  }, [loadUser])
  
  const handleUpdate = async (updates: UserUpdate) => {
    if (!user) return
    
    try {
      const updated = await apiClient.patch<User>(
        `/users/${user.id}`,
        updates
      )
      setUser(updated)
      onUpdate?.(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>User not found</div>
  
  return (
    <div className="user-profile">
      {/* Component content */}
    </div>
  )
}

// Bad: Any types, inconsistent style, no error handling
export function UserProfile({ userId, onUpdate }: any) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch('/api/users/' + userId)
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])
  
  return <div>{user?.name}</div>
}
```

## CSS Style Guide

### Stylelint Configuration

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss',
  ],
  rules: {
    'selector-class-pattern': '^[a-z][a-zA-Z0-9]+$',
    'custom-property-pattern': '^[a-z][a-zA-Z0-9]+$',
    'declaration-block-no-redundant-longhand-properties': true,
    'shorthand-property-no-redundant-values': true,
    'color-hex-length': 'short',
    'color-named': 'never',
    'selector-no-qualifying-type': true,
    'max-nesting-depth': 3,
    'selector-max-compound-selectors': 3,
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['tailwind', 'apply', 'layer', 'config'],
    }],
  },
}
```

### CSS Style Examples

```css
/* Good: BEM naming, CSS variables, mobile-first */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --spacing-unit: 0.25rem;
  --border-radius: 0.375rem;
}

.userCard {
  padding: calc(var(--spacing-unit) * 4);
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.userCard__header {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 3);
  margin-bottom: calc(var(--spacing-unit) * 4);
}

.userCard__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

@media (min-width: 768px) {
  .userCard {
    padding: calc(var(--spacing-unit) * 6);
  }
  
  .userCard__avatar {
    width: 4rem;
    height: 4rem;
  }
}

/* Bad: Inconsistent naming, magic numbers, deep nesting */
.user-card {
  padding: 16px;
}

.user-card .header .avatar img {
  width: 48px;
  height: 48px;
  border-radius: 24px;
}

.user-card .header .info .name {
  color: blue;
  font-size: 18px;
}
```

## Commit Message Convention

### Commitlint Configuration

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // New feature
      'fix',      // Bug fix
      'docs',     // Documentation
      'style',    // Formatting, missing semi colons, etc
      'refactor', // Code change that neither fixes a bug nor adds a feature
      'perf',     // Performance improvements
      'test',     // Adding missing tests
      'chore',    // Maintain
      'revert',   // Revert commits
      'build',    // Build system
      'ci',       // CI configuration
    ]],
    'scope-enum': [2, 'always', [
      'auth',
      'api',
      'ui',
      'db',
      'llm',
      'payments',
      'deps',
      'config',
      'docker',
    ]],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
}
```

### Commit Message Examples

```bash
# Good examples
feat(auth): add OAuth2 login support

Implement Google and GitHub OAuth providers with proper
error handling and token refresh logic.

Closes #123

fix(api): handle rate limit errors gracefully

- Add exponential backoff for retries
- Return proper 429 status codes
- Include Retry-After header

Breaking Change: API error response format changed

chore(deps): update dependencies

- fastapi 0.104.0 → 0.105.0
- pytest 7.4.0 → 7.4.3
- Security fixes included

# Bad examples
Fixed stuff
update
WIP
auth changes
```

## Editor Configuration

### EditorConfig

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.py]
indent_size = 4

[*.{yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

### VS Code Settings

```json
// .vscode/settings.json
{
  // Format on save
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  
  // Python
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "python.formatting.provider": "ruff",
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff"
  },
  
  // TypeScript/JavaScript
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // CSS
  "css.validate": false,
  "stylelint.enable": true,
  
  // Files
  "files.exclude": {
    "**/__pycache__": true,
    "**/.pytest_cache": true,
    "**/node_modules": true,
    "**/.next": true
  }
}
```

## Running Linters

### Pre-commit

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files

# Run specific hook
pre-commit run ruff --all-files
```

### Manual Commands

```bash
# Python
ruff check backend/            # Lint
ruff format backend/           # Format
mypy backend/                  # Type check

# TypeScript/JavaScript
npm run lint                   # ESLint
npm run format                 # Prettier
npm run type-check            # TypeScript

# CSS
npm run lint:css              # Stylelint

# All checks
npm run check-all             # Run everything
```

### GitHub Actions Integration

```yaml
- name: Lint Python
  run: |
    cd backend
    ruff check .
    ruff format --check .
    mypy .

- name: Lint TypeScript
  run: |
    cd frontend
    npm run lint
    npm run type-check
```

## Common Issues & Solutions

### Issue: Import Order
```typescript
// Wrong
import React from 'react'
import { apiClient } from '@/lib/api'
import { useState } from 'react'

// Right
import { useState } from 'react'

import { apiClient } from '@/lib/api'
```

### Issue: Unused Variables
```python
# Wrong
def process_user(user, extra_data):
    return user.name  # extra_data unused

# Right
def process_user(user, _extra_data):  # Prefix with underscore
    return user.name
```

### Issue: Type Assertions
```typescript
// Wrong
const user = data as any

// Right
const user = data as User
// or better
const user = validateUser(data)
```

## Exceptions & Overrides

Sometimes you need to disable rules:

```python
# Disable for a line
result = eval(user_input)  # noqa: S307

# Disable for a block
# fmt: off
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
# fmt: on
```

```typescript
// Disable for a line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = await response.json()

// Disable for a file
/* eslint-disable no-console */
```

Always document why you're disabling a rule!