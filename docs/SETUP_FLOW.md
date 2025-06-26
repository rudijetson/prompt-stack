# Prompt-Stack Setup Flow

## 🚀 Quick Start (Demo Mode)

```bash
git clone https://github.com/yourusername/prompt-stack.git
cd prompt-stack
./setup.sh
```

This gives you:
- ✅ Working website at http://localhost:3000
- ✅ Demo authentication
- ✅ Mock AI responses
- ✅ In-memory database

## 🔧 Production Setup Flow

### Step 1: Initial Setup
```bash
./setup.sh
# Creates demo environment and starts services
```

### Step 2: Add API Keys
```bash
./setup.sh --configure
# Interactive prompt for:
# - Supabase credentials
# - AI provider keys (OpenAI, Anthropic, etc.)
```

**Important**: After adding API keys, Docker automatically restarts to load the new environment.

### Step 3: Run Database Migrations
If you configured Supabase:
```bash
./setup.sh --migrate
# Shows instructions to run migrations in Supabase dashboard
```

### Step 4: Verify Setup
```bash
./setup.sh --verify
# Shows status of all services
```

## 📋 Complete Setup Checklist

1. **Clone repository** → `git clone ...`
2. **Run setup** → `./setup.sh`
3. **Visit site** → http://localhost:3000 (works immediately in demo mode)
4. **Add Supabase** → `./setup.sh --configure` → Choose option 1
5. **Docker restarts automatically** → Waits for services to be ready
6. **Run migrations** → Copy SQL to Supabase dashboard
7. **Add AI keys** → `./setup.sh --configure` → Choose option 2
8. **Docker restarts again** → Loads AI providers
9. **Verify** → `./setup.sh --verify`

## 🔄 Key Points

1. **Environment Changes = Docker Restart**
   - Any .env changes require full Docker restart
   - The smart setup handles this automatically

2. **Migration Order**
   - Add Supabase keys first
   - Restart Docker (automatic)
   - Then run migrations
   - Otherwise auth won't work

3. **Progressive Enhancement**
   - Start with demo mode (instant)
   - Add Supabase for real auth
   - Add AI keys for real responses
   - Each step builds on the previous

## 🛠️ Troubleshooting

### Docker cache issues
```bash
make clean
make build-fresh
```

### Environment not loading
```bash
docker-compose down
docker-compose up
```

### Check current status
```bash
./setup.sh --verify
```

## 🎯 End Result

After complete setup:
- Real authentication via Supabase
- Real AI responses from your chosen providers
- Persistent PostgreSQL database with pgvector
- Production-ready configuration