# Setup Guide

This is your complete guide to setting up Prompt-Stack, from demo mode to full production.

## Quick Start Decision Tree

```
Do you want to test the app quickly?
├─ Yes → Use Demo Mode (skip to "Demo Mode Setup")
└─ No → Continue below
    │
    ├─ Do you have API keys ready?
    │   ├─ No → Create free accounts first
    │   └─ Yes → Continue to "Production Setup"
    │
    └─ Recommended setup order:
        1. Supabase (auth & database)
        2. AI provider (start with DeepSeek - $0.14/M tokens!)
        3. Payments (optional)
        4. Admin system (optional)
```

## Demo Mode Setup (5 minutes)

Everything works without configuration!

```bash
# 1. Clone and start
git clone <your-repo>
cd prompt-stack-skeleton
make dev

# 2. Open browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs

# 3. Test features
# - Mock authentication
# - Demo AI responses
# - Test payment flows
# - In-memory data
```

## Production Setup (15-30 minutes)

### Step 1: Environment Files

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration  
cp frontend/.env.example frontend/.env.local
```

### Step 2: Supabase Setup (Required)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project (free tier works)
   - Save your keys from Project Settings → API

2. **Configure Backend** (`backend/.env`)
   ```env
   # Change to false to enable real auth
   DEMO_MODE=false
   
   # Add your Supabase credentials
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```

3. **Configure Frontend** (`frontend/.env.local`)
   ```env
   # Change to false for real auth
   NEXT_PUBLIC_DEMO_MODE=false
   
   # Add matching Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run Database Migrations**
   ```bash
   cd supabase
   ./setup-database.sh
   # Choose option 2 for remote database
   # Enter your project details when prompted
   ```

### Step 3: AI Provider Setup (Choose One)

Add at least one AI provider to `backend/.env`:

```env
# Option 1: DeepSeek (Recommended - Cheapest!)
# Get key: https://platform.deepseek.com/
DEEPSEEK_API_KEY=your-key-here

# Option 2: OpenAI
# Get key: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-key-here

# Option 3: Anthropic (Claude)
# Get key: https://console.anthropic.com/
ANTHROPIC_API_KEY=your-key-here

# Option 4: Google (Gemini)
# Get key: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-key-here
```

### Step 4: Restart Services

```bash
# Full restart to load new environment
make clean
make dev

# Verify setup
./scripts/test-api-simple.sh
```

## Database Setup Details

### Minimal Schema (Default)

The skeleton includes only one table:

```sql
-- profiles table (auto-created)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Adding Your Own Tables

Create new migration files:

```sql
-- supabase/migrations/002_your_feature.sql
CREATE TABLE public.your_table (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  -- your columns
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy
CREATE POLICY "Users can manage own data" ON your_table
  FOR ALL USING (auth.uid() = user_id);
```

Apply migrations:
```bash
cd supabase
supabase db push
```

## Admin System Setup

### Automatic Admin Assignment

1. **First User** - Automatically becomes admin
2. **Predefined Emails** - Add to `backend/.env`:
   ```env
   ADMIN_EMAILS=["admin@company.com","rose@company.com"]
   ```
3. **Development Trick** - Use `+admin` in email:
   ```
   rose+admin@gmail.com → admin role
   rose@gmail.com → regular user
   ```

### Admin Security Features

- JWT validation with role claims
- Role-based access control (RBAC)
- Database-level security (RLS)
- Audit logging for role changes
- Last admin protection

### Testing Admin Access

```bash
# 1. Sign up as admin
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "testpass123"}'

# 2. Access admin endpoint
curl -X GET http://localhost:8000/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Gotchas & Solutions

### Environment Variables

❌ **Wrong**: `DEEPSEEK_KEY=xxx`  
✅ **Correct**: `DEEPSEEK_API_KEY=xxx`

❌ **Wrong**: Changing .env without restart  
✅ **Correct**: Always run `make clean && make dev`

### Authentication Issues

❌ **Problem**: "401 Unauthorized" errors  
✅ **Solution**: 
- Ensure `DEMO_MODE=false` in both backend and frontend
- Verify Supabase keys match between services
- Check JWT token is included in requests

### Database Issues

❌ **Problem**: "Supabase not configured"  
✅ **Solution**:
- Add all three Supabase keys (URL, ANON, SERVICE)
- Restart containers after adding keys
- Verify keys are from same project

### AI Provider Issues

❌ **Problem**: "No AI providers configured"  
✅ **Solution**:
- Add at least one `*_API_KEY` to backend/.env
- Use exact variable names from .env.example
- Test with `/api/llm/demo` endpoint first

## Testing Your Setup

### 1. Quick Health Check
```bash
# Should return {"status":"healthy","mode":"demo|production"}
curl http://localhost:8000/
```

### 2. Test AI (Demo Mode)
```bash
curl -X POST http://localhost:8000/api/llm/demo \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello!","model":"demo"}'
```

### 3. Test AI (Production Mode)
```bash
# First get auth token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# Then test AI
curl -X POST http://localhost:8000/api/llm/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Hello!","provider":"deepseek","model":"deepseek-chat"}'
```

### 4. Comprehensive Test
```bash
./scripts/test-api-comprehensive.sh
```

## Production Deployment Checklist

- [ ] Change `ENVIRONMENT=production` in backend/.env
- [ ] Set strong passwords for all services
- [ ] Enable SSL/HTTPS on all endpoints
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Review and tighten RLS policies
- [ ] Set up backup strategy
- [ ] Configure webhook endpoints for payments
- [ ] Test all critical paths

## Next Steps

1. **Start Building**: The skeleton is minimal by design - add only what you need
2. **Check Examples**: See `/frontend/app/examples/` for implementation patterns
3. **Read Architecture**: Review `/docs/codebase-overview.md` for structure
4. **Get Help**: Check `/docs/TROUBLESHOOTING.md` for common issues

Remember: This is a skeleton, not a demo app. It's designed to give you a solid foundation without making assumptions about what you're building!