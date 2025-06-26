# Frontend Structure

This document explains the organization of the frontend codebase.

## Directory Structure

```
frontend/
├── app/                       # Next.js App Router
│   ├── (authenticated)/       # Protected routes (require login)
│   │   ├── layout.tsx         # Auth check wrapper
│   │   └── dashboard/         # Example protected page
│   ├── (public)/              # Public routes (optional grouping)
│   ├── api/                   # API routes (if needed)
│   ├── auth/                  # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/          # OAuth callbacks
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── forms/                 # Reusable form components
│   ├── layout/                # Layout components
│   │   └── Navigation.tsx     # Main navigation
│   ├── providers/             # Context providers
│   │   └── auth-provider.tsx  # Authentication context
│   └── ui/                    # UI components
├── lib/                       # Utilities and helpers
│   ├── api.ts                 # API client
│   ├── demo-auth.ts           # Demo authentication
│   └── supabase.ts            # Supabase client
├── public/                    # Static assets
└── services/                  # API service layers
    └── llm.ts                 # LLM service integration
```

## Key Concepts

### Route Groups

- `(authenticated)` - Routes that require user authentication
- `(public)` - Public routes (optional, for organization)
- Folders in parentheses don't create URL segments

### Protected Routes

All routes under `(authenticated)` automatically require login:

```typescript
// app/(authenticated)/layout.tsx
export default function AuthenticatedLayout({ children }) {
  // This layout ensures authentication
  // Redirects to login if not authenticated
}
```

### Authentication Flow

1. User attempts to access protected route
2. `AuthProvider` checks authentication status
3. If not authenticated, redirect to `/auth/login`
4. After login, redirect back to requested page

### Demo Mode

When `NEXT_PUBLIC_DEMO_MODE=true`:
- Uses local storage for auth persistence
- Any email/password combination works
- No external API calls for auth

### API Integration

The `lib/api.ts` client handles:
- Authentication headers
- Error handling
- Response parsing
- Rate limiting

### Component Organization

- `components/ui/` - Generic, reusable UI components
- `components/forms/` - Form-specific components
- `components/layout/` - Layout and navigation components
- `components/providers/` - React context providers

## Adding New Features

### Adding a Protected Page

```bash
# Create new page under (authenticated)
mkdir -p app/(authenticated)/my-feature
touch app/(authenticated)/my-feature/page.tsx
```

### Adding a Public Page

```bash
# Create directly under app/
mkdir -p app/my-page
touch app/my-page/page.tsx
```

### Adding an API Service

```typescript
// services/my-service.ts
import { apiClient } from '@/lib/api';

export const myService = {
  async getData() {
    return apiClient.get('/api/my-endpoint');
  }
};
```

## Best Practices

1. **Use Route Groups** - Organize routes by access level
2. **Centralize API Calls** - Use the API client for consistency
3. **Handle Loading States** - Show skeletons or spinners
4. **Error Boundaries** - Catch and display errors gracefully
5. **TypeScript** - Define types for all data structures