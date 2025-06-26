# Environment Setup Guide

## Quick Start

1. **Copy the example files:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

2. **Add your API keys**

3. **Run the app:**
   ```bash
   make dev
   ```

## Complete Configuration Example

### Backend (.env)
```bash
# Core Services
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# AI Provider (at least one)
DEEPSEEK_API_KEY=sk_...  # Recommended - very cheap!
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Payments (TEST keys for development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
LEMONSQUEEZY_API_KEY=test_...
LEMONSQUEEZY_STORE_ID=12345

# Email
RESEND_API_KEY=re_...

# Config
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_DEMO_MODE=false
```

## Getting Your Keys

### 1. Supabase (Required)
- Go to https://supabase.com
- Create project → Settings → API
- Copy: URL, anon key, service key

### 2. DeepSeek (Recommended AI)
- Go to https://platform.deepseek.com
- Sign up, add $10 credit
- Create API key

### 3. Stripe (Payments)
- Go to https://dashboard.stripe.com/test/apikeys
- Make sure you're in TEST mode
- Copy test keys (sk_test_ and pk_test_)

### 4. Resend (Email)
- Go to https://resend.com
- Sign up (3000 emails/month free)
- Get API key

## Production Deployment

Add keys to your deployment platform:
- **Vercel**: Settings → Environment Variables
- **Railway**: Variables tab

Use LIVE keys for production, TEST keys for development.

## Security Notes

- Never commit .env files
- Use TEST keys for development
- Keep production keys in deployment platform only
- DeepSeek key goes in backend only (it's secret)