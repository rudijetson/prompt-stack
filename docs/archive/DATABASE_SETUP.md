# Database Setup Guide

This guide explains how to set up your database for Prompt-Stack.

## Quick Start

### Option 1: Local Development (No Supabase Required)
The app works without any database in demo mode. User sessions are stored in memory.

### Option 2: Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Save your project URL and keys

2. **Run Migrations**
   ```bash
   cd supabase
   ./setup-database.sh
   ```
   Choose option 2 and enter your project details.

3. **Update Environment Variables**
   
   Backend (`backend/.env`):
   ```env
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```
   
   Frontend (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_DEMO_MODE=false
   ```

4. **Restart Services**
   ```bash
   docker-compose down && docker-compose up -d
   ```

## Database Schema

The skeleton includes **only the bare minimum**:

- **profiles** - Basic user profile information
  - Linked to Supabase auth.users
  - Fields: email, full_name, avatar_url, timestamps
  - Row Level Security enabled
  - Auto-created when users sign up

That's it! No assumptions about what you're building. 

When you need more tables for your app (invoices, projects, etc.), just create new migration files.

## Row Level Security

All tables have RLS enabled by default:
- Users can only read/update their own data
- Automatic profile creation on signup
- Secure by default

## Local Development

For local Supabase development:
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
cd supabase
supabase start

# Apply migrations
supabase db push
```

Local URLs:
- API: http://localhost:54321
- Database: postgresql://postgres:postgres@localhost:54322/postgres
- Studio: http://localhost:54323

## Troubleshooting

**Migration fails**: Check your Supabase project settings and ensure the database is accessible.

**Auth not working**: Ensure both backend and frontend have matching Supabase credentials.

**RLS blocking access**: Check the policies in Supabase Studio dashboard.