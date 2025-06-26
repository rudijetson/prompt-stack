# Prompt-Stack

AI-friendly full-stack template with authentication, payments, and vector search.

## 🚀 Quick Start

```bash
# 1. Clone and setup (instant demo mode)
git clone https://github.com/yourusername/prompt-stack.git
cd prompt-stack
./setup.sh

# 2. Visit your app (already working!)
open http://localhost:3000

# Optional: Using custom ports?
# If ports 3000 or 8000 are busy:
./scripts/check-ports.sh
# See docs/CUSTOM_PORTS.md for details
```

**That's it!** You have a working app in demo mode.

## 🔧 Add Real Features (Progressive Enhancement)

```bash
# Add authentication & database
./setup.sh supabase
# (Auto-restarts Docker, shows migration instructions)

# Add AI providers
./setup.sh ai
# (Auto-restarts Docker, AI is ready!)

# Or configure everything at once
./setup.sh configure

# Check what's configured
./setup.sh status
```

Each step builds on the previous one. Start simple, add features as needed.

📖 See the [detailed quick start guide](docs/QUICKSTART.md) for step-by-step instructions.

## ✨ Features

### Works Out of the Box (Demo Mode)
- 🔐 **Authentication** - Demo auth that works without configuration
- 🤖 **AI Chat** - Demo responses to test your UI
- 💳 **Payments** - Test payment flows with mock data
- 🔍 **Vector Search** - In-memory vector operations
- 📚 **API Docs** - Auto-generated at /docs

### Production Ready
- 🏗️ **Next.js 15** - Latest React framework
- 🐍 **FastAPI** - High-performance Python backend
- 🗄️ **Supabase** - Database, auth, storage, vectors
- 🤖 **Multi-AI** - OpenAI, Anthropic, Gemini, DeepSeek
- 💰 **Payments** - Stripe & Lemon Squeezy
- 📧 **Email** - Resend integration
- 🐳 **Docker** - Development & production ready

## 📁 Project Structure

```
├── frontend/          # Next.js app
├── backend/           # FastAPI app
├── supabase/          # Database migrations
├── scripts/           # Utility scripts
├── docs/              # Documentation
└── docker-compose.yml # Local development
```

## 🛠️ Configuration

### Option 1: Demo Mode (Default)
No configuration needed! Everything works with mock data.

### Option 2: Real Services

**⚠️ Important: Configure in this order!**
1. **Supabase first** (required for auth)
2. **Then AI providers** (at least one)
3. **Optional:** Payments, Email

**Backend** (`backend/.env`):
```bash
# 1️⃣ FIRST: Supabase (required!)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key

# 2️⃣ SECOND: Add at least one AI provider
DEEPSEEK_API_KEY=your_key  # Recommended - $0.14/million tokens!
# Or use: OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY

# 3️⃣ OPTIONAL: Admin emails (first user is admin by default)
ADMIN_EMAILS=["admin@company.com","rose@company.com"]
```

**Frontend** (`frontend/.env.local`):
```bash
# Copy from frontend/.env.example
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

> ⚠️ **IMPORTANT: Environment Variable Changes**
> 
> After changing ANY environment variables, you MUST do a **FULL RESTART**:
> ```bash
> docker-compose down && docker-compose up -d
> ```
> Simple `docker-compose restart` is NOT sufficient - environment variables are loaded at container creation time!

## 📝 Common Commands

```bash
make dev              # Start everything
make dev-frontend     # Frontend only
make dev-backend      # Backend only
make test-api         # Test API endpoints
make clean            # Stop and cleanup
./scripts/diagnose.sh # 🔍 Diagnose issues (NEW!)
```

### 🩺 Troubleshooting

```bash
# Quick health check
./scripts/diagnose.sh

# Check detailed system status
curl http://localhost:8000/health/detailed | jq

# View feature configuration
curl http://localhost:8000/health/features | jq
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend && vercel --prod
```

### Backend (Railway/Render)
```bash
railway up  # or use render.yaml
```

## 📖 Documentation

- [Environment Setup](docs/ENVIRONMENT_SETUP.md)
- [API Documentation](http://localhost:8000/docs)
- [Deployment Guide](docs/deployment/)
- [Payment Setup](docs/payment-setup/)
- [Changelog](CHANGELOG.md)

## 🧪 Testing

```bash
# Test API endpoints
./scripts/test-api-simple.sh

# Comprehensive test
./scripts/test-api-comprehensive.sh
```

## 🎯 Quick Wins

1. **Demo First**: Start with demo mode, upgrade when ready
2. **DeepSeek**: Most cost-effective AI ($0.14/M tokens)
3. **Test Keys**: Use Stripe test mode for development
4. **Local Dev**: Full stack runs on your machine
5. **Clean Start**: Delete `/app/prompt-stack` folder to remove all demos
6. **Custom Ports**: Set `FRONTEND_PORT=3001` and `BACKEND_PORT=8002` in `.env` file

## ⚠️ Important: Where to Build

- ✅ **Build your app in**: `frontend/app/`
- ❌ **NOT in**: `frontend/app/prompt-stack/` (demo pages only!)
- 🗑️ **When ready**: Delete the entire `prompt-stack` folder

## 📦 What's Included

### API Endpoints
- ✅ Authentication (JWT + Demo auth)
- ✅ User profiles with roles ([Admin Setup Guide](docs/ADMIN_SETUP.md))
- ✅ LLM chat/completion
- ✅ Vector search
- ✅ File uploads
- ✅ Payment processing
- ✅ Webhooks

### Demo Mode Endpoints
These work without any configuration:
- `POST /api/auth/demo/signin` - Demo sign in
- `POST /api/auth/demo/signup` - Demo sign up
- `GET /api/auth/demo/check` - Check demo auth availability
- `POST /api/llm/generate-demo` - Generate text with demo AI
- `POST /api/llm/embedding-demo` - Create demo embeddings
- `GET /api/llm/providers` - List available AI providers
- `GET /api/payments-demo/stripe/status` - Stripe configuration status
- `GET /api/payments-demo/lemonsqueezy/status` - Lemon Squeezy status
- `GET /api/examples/` - Example data endpoints
- `GET /api/dev/health` - Comprehensive health check (dev mode)

### Frontend Pages

**Core Pages** (keep these):
- ✅ Homepage with service status (`/`)
- ✅ Auth pages (`/auth/*`)

**Demo Pages** (in `/prompt-stack` folder - safe to delete):
- ✅ Prompt-Stack hub (`/prompt-stack`)
- ✅ Developer guide (`/prompt-stack/guide`)
- ✅ Form components showcase (`/prompt-stack/guide/forms`)
- ✅ LLM demo page (`/prompt-stack/demo`)
- ✅ API test page (`/prompt-stack/api-test`)
- ✅ Example dashboard (`/prompt-stack/dashboard`)
- ✅ Example profile (`/prompt-stack/profile`)
- ✅ Example settings (`/prompt-stack/settings`)

### Developer Tools
- ✅ Hot reload
- ✅ Type safety
- ✅ API documentation
- ✅ Error handling
- ✅ Rate limiting
- ✅ GitHub Actions CI/CD
- ✅ Database migrations
- ✅ Test framework ready

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License - use this template for anything!

---

Built for developers who want to ship fast with AI 🚀