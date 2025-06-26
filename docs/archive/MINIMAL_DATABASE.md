# Minimal Database Philosophy

## What We Include

Just **one table** - `profiles`:
```sql
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

That's it. Nothing else.

## Why So Minimal?

1. **No Assumptions** - We don't know if you're building invoices, chat, or a game
2. **Functional Auth** - This is the minimum needed for auth to work properly
3. **Easy to Extend** - Adding tables is trivial, removing them is hard
4. **AI-Friendly** - When you say "I want to build X", the AI starts fresh

## What We DON'T Include

❌ **No example tables** - You'll create what you need
❌ **No user_api_keys** - Only if you're building something with API keys
❌ **No admin tables** - Add if you need admin functionality
❌ **No feature tables** - Your app, your tables

## How to Extend

When you're ready to add tables:

```sql
-- Create: supabase/migrations/002_your_feature.sql
CREATE TABLE public.invoices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  -- Your columns here
);

-- Don't forget RLS!
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

Then run:
```bash
supabase db push
```

## The Result

- **Clean slate** for your ideas
- **Working auth** out of the box
- **No cleanup** needed before building
- **AI prompts** like "build an invoice system" work immediately

This is a skeleton, not a demo app. Build whatever you want! 🚀