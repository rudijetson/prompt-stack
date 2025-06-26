#!/bin/bash

# Backend deployment script
echo "🚀 Deploying backend..."

# Ask which platform
echo "Select deployment platform:"
echo "1) Railway (recommended)"
echo "2) Render"
echo "3) Fly.io"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Deploying to Railway..."
        # Check if railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm i -g @railway/cli
        fi
        
        # Login and deploy
        railway login
        railway link
        railway up
        
        echo "Don't forget to set environment variables:"
        echo "railway variables set SUPABASE_URL=your-url"
        echo "railway variables set SUPABASE_ANON_KEY=your-key"
        echo "railway variables set OPENAI_API_KEY=your-key"
        ;;
        
    2)
        echo "Deploying to Render..."
        echo "1. Push your code to GitHub"
        echo "2. Visit https://render.com/new"
        echo "3. Connect your GitHub repo"
        echo "4. Render will auto-detect render.yaml"
        echo "5. Add environment variables in Render dashboard"
        ;;
        
    3)
        echo "Deploying to Fly.io..."
        # Check if fly CLI is installed
        if ! command -v flyctl &> /dev/null; then
            echo "Please install Fly CLI first:"
            echo "brew install flyctl (macOS)"
            echo "Or visit: https://fly.io/docs/getting-started/installing-flyctl/"
            exit 1
        fi
        
        cd backend
        flyctl launch
        flyctl deploy
        ;;
        
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo "✅ Backend deployment complete!"