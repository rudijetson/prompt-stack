# Supabase Migrations

## What's Included

Just the **bare minimum** to make authentication work:

- `001_initial_schema.sql` - Creates a `profiles` table that extends Supabase auth

That's it! No assumptions about what you're building.

## What It Does

1. **Creates profiles table** - Links to auth.users with basic info (email, name, avatar)
2. **Sets up RLS** - Everyone can view profiles, users can only edit their own
3. **Auto-creates profiles** - When someone signs up, they automatically get a profile
4. **Tracks updates** - updated_at timestamp stays current

## How to Extend

When you're ready to add your own tables:

```sql
-- Create a new file: 002_your_feature.sql
CREATE TABLE public.invoices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  -- your columns here
);

-- Don't forget RLS!
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Add policies...
```

## Running Migrations

These run automatically when you set up Supabase, or manually:

```bash
supabase db push
```

That's it - now go build something awesome! 🚀