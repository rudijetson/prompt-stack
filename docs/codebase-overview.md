# Codebase Overview

Welcome to the Prompt-Stack codebase documentation. This guide helps developers and AI assistants understand the architecture and navigate the codebase effectively.

## 📚 Documentation Structure

Our documentation is organized into focused topics:

| Document | Purpose |
|----------|---------|
| [backend-patterns.md](./backend-patterns.md) | Python/FastAPI patterns and practices |
| [frontend-patterns.md](./frontend-patterns.md) | TypeScript/React patterns and practices |
| [security.md](./security.md) | Authentication, authorization, and security practices |
| [error-handling.md](./error-handling.md) | Standardized error handling across the stack |

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js 15    │────▶│   FastAPI       │────▶│   Supabase      │
│   Frontend      │     │   Backend       │     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                         │
        │                       │                         │
    TypeScript              Python 3.11              PostgreSQL
    React 18                Pydantic v2               pgvector
    Tailwind CSS            SQLAlchemy               Row-Level Security
```

## 🚀 Key Design Principles

1. **Demo-First Development**: Everything works without configuration
2. **Progressive Enhancement**: Add real services when ready
3. **Type Safety**: Full typing in both frontend and backend
4. **Standardized Responses**: Consistent API response format
5. **Security by Default**: Auth-first approach with RLS

## 📁 Repository Structure

```
prompt-stack-skeleton/
├── frontend/               # Next.js application
├── backend/               # FastAPI application
├── supabase/             # Database migrations
├── scripts/              # Utility scripts
├── docs/                 # This documentation
├── docker-compose.yml    # Local development
└── Makefile             # Common commands
```

## 🔧 Technology Stack

### Backend
- **Framework**: FastAPI 0.115
- **Language**: Python 3.11+
- **Auth**: Supabase Auth / JWT
- **Database**: PostgreSQL with pgvector
- **AI**: OpenAI, Anthropic, Gemini, DeepSeek
- **Payments**: Stripe, Lemon Squeezy

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Components**: Shadcn/ui
- **State**: React Context + SWR
- **Auth**: Supabase Auth

## 🎯 Quick Start for Contributors

1. **Clone and Setup**:
   ```bash
   git clone <repo>
   cd prompt-stack-skeleton
   ./setup.sh
   ```

2. **Understand the Code**:
   - Check patterns for your language ([backend](./backend-patterns.md) or [frontend](./frontend-patterns.md))
   - Review [security.md](./security.md) before adding auth features

3. **Make Changes**:
   - Follow existing patterns
   - Add tests following project conventions
   - Check linting passes
   - Update relevant docs

## 🤖 For AI Assistants

When generating code for this project:

1. **Use standard patterns** from backend/frontend pattern docs
2. **Follow error handling** patterns in [error-handling.md](./error-handling.md)
3. **Include proper logging** following project conventions
4. **Add tests** following project conventions

## 📊 Metrics

- **Files**: ~150 source files
- **Languages**: Python (45%), TypeScript (52%), SQL (3%)
- **Test Coverage Target**: 80%
- **Bundle Size Target**: <200KB gzipped

## 🔗 External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)