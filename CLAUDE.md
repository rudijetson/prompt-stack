# CLAUDE.md

This file helps AI assistants understand and work with this codebase effectively.

## 🚨 CRITICAL: Where to Build User Features

**When a user asks to build ANYTHING (dashboard, forms, pages, etc.):**
1. **BUILD IN**: `frontend/app/` (NOT in `frontend/app/prompt-stack/`)
2. **USE**: The existing `(authenticated)` wrapper for protected pages
3. **ASSUME**: Demo mode is fine - don't interrupt to ask for API keys

### Examples:
- User: "Create a dashboard" → Build at: `frontend/app/dashboard/page.tsx`
- User: "Add user profile" → Build at: `frontend/app/(authenticated)/profile/page.tsx`
- User: "Make a landing page" → Build at: `frontend/app/page.tsx`

### NEVER:
- Don't build in `/prompt-stack/` - that's just demos
- Don't ask for setup/credentials unless they specifically ask
- Don't suggest running setup scripts unless there's an error

## 🎯 Quick Reference for Common Requests

**"I want to build..." → Start building immediately in `app/`**
**"How do I authenticate?" → Use existing auth from `components/providers/auth-provider`**
**"Add AI chat" → Use existing LLM service from `backend/app/services/llm/`**
**"Setup payments" → Point to existing payment endpoints**

## Project Overview

Prompt-Stack is a full-stack template designed for rapid development with AI assistance. It includes authentication, payments, AI integration, and vector search out of the box.

## 📁 Build Locations Guide

```
frontend/app/
├── page.tsx                    # Homepage (build landing pages here)
├── about/                      # Static pages
├── (authenticated)/            # Protected pages (use this wrapper!)
│   ├── dashboard/             # Build user dashboards here
│   ├── settings/              # Build user settings here
│   └── [anything]/            # Build any protected feature here
└── prompt-stack/              # ⚠️ DEMO ONLY - DON'T BUILD HERE
```

## Setup Commands (Intuitive Flow)

```bash
# Initial setup (creates demo mode, starts Docker)
./setup.sh

# Add real features when ready:
./setup.sh supabase    # Add auth/database (auto-restarts Docker)
./setup.sh ai          # Add AI providers (auto-restarts Docker)
./setup.sh configure   # Configure everything at once
./setup.sh status      # Check what's working
```

**The setup script handles Docker restarts automatically!**

## Most Used Commands

```bash
# Development
make dev                 # Start both frontend and backend
make dev-frontend        # Frontend only
make dev-backend         # Backend only
make logs               # View all logs
make logs-backend       # Backend logs only
make logs-frontend      # Frontend logs only

# Testing & Diagnostics
./scripts/test-api-simple.sh        # Quick API test
./scripts/diagnose.sh               # 🔍 NEW! Diagnose common issues
curl http://localhost:8000/docs     # API documentation
curl http://localhost:8000/health/detailed | jq  # System status
curl http://localhost:8000/health/features | jq  # Feature configuration

# Maintenance
make stop               # Stop all services
make clean              # Clean up containers and volumes

# ⚠️ IMPORTANT: Full restart after env changes
docker-compose down && docker-compose up -d
```

## Key Features

### 1. Demo Mode (Default)
The app works without any configuration:
- Mock authentication via `/api/auth/demo/*`
- Demo AI responses via `/api/llm/generate-demo`
- Test payment flows
- In-memory vector search

### 2. Production Mode
With proper API keys:
- Real authentication via Supabase
- Multiple AI providers (OpenAI, Anthropic, Gemini, DeepSeek)
- Stripe & Lemon Squeezy payments
- PostgreSQL with pgvector

## Architecture

### Backend (FastAPI) - Port 8000
- `app/api/endpoints/` - API routes
- `app/services/` - Business logic (LLM, auth, payments)
- `app/models/` - Pydantic models
- `app/core/config.py` - Settings class (IMPORTANT: env vars must match!)

### Frontend (Next.js 15) - Port 3000
- `app/` - App directory routes
- `app/(authenticated)/` - Protected pages (dashboard, test-ai, test-api)
- `app/dev-guide/` - Developer documentation
- `components/` - Reusable React components
- `services/` - API client functions

## Common Tasks

### Add New API Endpoint
1. Create file in `backend/app/api/endpoints/your_endpoint.py`
2. Add router to `backend/app/api/router.py`:
   ```python
   from app.api.endpoints import your_endpoint
   api_router.include_router(your_endpoint.router, prefix="/your-endpoint", tags=["your-endpoint"])
   ```
3. Test at http://localhost:8000/docs

### Add New Page
1. Create directory in `frontend/app/your-page/`
2. Add `page.tsx` file
3. Page automatically available at `/your-page`

### Test Your Setup
- API Configuration: `/test-api`
- AI Models: `/test-ai` (requires auth)
- Developer Guide: `/dev-guide`

### Add Protected Page
1. Create your page in `frontend/app/(authenticated)/your-page/`
2. Page will require login automatically
3. Auth layout already set up

⚠️ **IMPORTANT**: Build in `/app/`, NOT in `/app/prompt-stack/`

## Environment Variables

⚠️ **CRITICAL**: After ANY .env file changes, you MUST fully restart:
```bash
docker-compose down && docker-compose up -d
```

### Backend (`backend/.env`)
IMPORTANT: Field names must match `Settings` class in `backend/app/core/config.py`

```bash
# Core settings
ENVIRONMENT=development
DEMO_MODE=auto
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
FRONTEND_URL=http://localhost:3000

# Optional services (leave empty for demo mode)
DEEPSEEK_API_KEY=        # Recommended: $0.14/M tokens!
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
STRIPE_SECRET_KEY=       # Note: Not STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET=
LEMONSQUEEZY_API_KEY=    # Note: Not LEMON_SQUEEZY_API_KEY
RESEND_API_KEY=
```

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Testing Endpoints

```bash
# Health check
curl http://localhost:8000/

# Demo authentication
curl -X POST http://localhost:8000/api/auth/demo/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"any-password"}'

# Demo AI generation
curl -X POST http://localhost:8000/api/llm/generate-demo \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello!","model":"demo"}'

# Check service status
curl http://localhost:8000/api/llm/providers
curl http://localhost:8000/api/payments-demo/stripe/status
```

## Code Style

- **Backend**: FastAPI with Pydantic models, async/await
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS
- **Components**: Use existing UI components from `frontend/components/ui/`
- **API Responses**: Always use standardized format via `create_response()`

## Important Notes

- Demo mode is enabled by default when no API keys are configured
- All endpoints return standardized responses: `{success, data, error, code}`
- Rate limiting: 10 req/min (demo), 30 req/min (authenticated)
- Navigation header is sticky (stays visible when scrolling)
- All demo content is in `/app/prompt-stack/` folder - delete it to start fresh

## Debugging

### Quick Diagnosis
Run the diagnostic tool for instant status:
```bash
./scripts/diagnose.sh
```

### Manual Debugging
1. Backend not starting? Check `docker logs prompt-stack-skeleton-backend-1`
   - Usually env var mismatch with Settings class
2. Frontend errors? Check browser console
3. API errors? Check http://localhost:8000/docs
4. Can't login? Demo auth available at `/api/auth/demo/signin`
5. Path with spaces warning? Works fine, just a warning
6. Environment changes not working? Did you do a FULL restart? (`docker-compose down && up`)

## Common Issues & Fixes

1. **Pydantic validation errors**: Environment variable names must match Settings class exactly
2. **404 on API calls**: Check endpoint paths - use `/api/llm/generate-demo` not `/api/llm/demo`
3. **Auth errors on protected pages**: Make sure AuthProvider wraps the page
4. **CORS errors**: Backend CORS_ORIGINS must include frontend URL