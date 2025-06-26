#!/bin/bash

# Frontend deployment script for Vercel
echo "🚀 Deploying frontend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Navigate to frontend directory
cd frontend

# Check for environment variables
if [ ! -f .env.local ]; then
    echo "⚠️  No .env.local found. Creating from template..."
    cp .env.production .env.local
    echo "Please edit frontend/.env.local with your production values before deploying."
    exit 1
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment complete!"