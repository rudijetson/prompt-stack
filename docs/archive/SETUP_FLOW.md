# Optimal Setup Flow

## Quick Decision Tree

```
Start Here
    ↓
Do you want to test with real APIs?
    ├─ No → Use Demo Mode (skip to step 5)
    └─ Yes → Continue
         ↓
Do you have a Supabase account?
    ├─ No → Create one first (free tier works)
    └─ Yes → Continue
         ↓
Setup Order:
1. Supabase (required for auth)
2. At least one LLM provider
3. Payments (optional)
4. Email (optional)
```

## Why This Order?

1. **Supabase First**
   - Required for authentication
   - Enables testing all other features
   - Free tier is sufficient

2. **LLM Provider Second**
   - Can now test with real auth
   - Start with DeepSeek ($0.14/M tokens!)
   - Add others as needed

3. **Payments Last**
   - Optional feature
   - Requires webhook setup
   - Can be added anytime

## Setup Commands

### Option A: Stay in Demo Mode
```bash
# Just start - everything works!
make dev
```

### Option B: Real Services (Recommended Order)

```bash
# 1. Create Supabase project (https://supabase.com)
# 2. Run setup wizard
./setup.sh

# When prompted, add in this order:
# - Supabase URL & Keys (required)
# - DeepSeek API key (cheapest LLM)
# - Skip others for now

# 3. Setup database
make db-setup

# 4. Restart services
make clean && make dev

# 5. Test it works
./scripts/diagnose.sh
```

## Common Mistakes to Avoid

❌ Adding LLM keys without Supabase
❌ Forgetting the `_API_KEY` suffix
❌ Not doing full restart after .env changes
❌ Testing `/api/llm/generate` without auth

✅ Set up Supabase first
✅ Use exact variable names from .env.example
✅ Always `docker-compose down && up`
✅ Use `/api/llm/generate-demo` for quick tests