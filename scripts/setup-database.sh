#!/bin/bash

# Setup Supabase Database
# This script helps you set up the required database tables

set -e

echo "🔄 Setting up Supabase database..."

# Check if required environment variables are set
if [ -z "$1" ]; then
    echo "Loading environment from backend/.env..."
    if [ -f "backend/.env" ]; then
        export $(grep -E '^SUPABASE_URL' backend/.env | xargs)
    fi
fi

# Extract project ID from Supabase URL
if [ -n "$SUPABASE_URL" ]; then
    PROJECT_ID=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
    echo "📊 Project ID: $PROJECT_ID"
    echo ""
    echo "📋 To set up your database:"
    echo "1. Go to your Supabase SQL Editor:"
    echo "   https://app.supabase.com/project/$PROJECT_ID/sql/new"
    echo ""
    echo "2. Copy and paste the SQL from:"
    echo "   backend/migrations/001_create_profiles_table.sql"
    echo ""
    echo "3. Click 'Run' to create the profiles table"
    echo ""
    echo "✅ This will enable user authentication and role management"
else
    echo "❌ SUPABASE_URL not found in backend/.env"
    echo "Please add your Supabase configuration first."
fi