#!/bin/bash

# Supabase Database Setup Script
# This script helps you set up your database schema locally or remotely

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Supabase Database Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: brew install supabase/tap/supabase"
    echo "Or see: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check for .env file
if [ ! -f "../backend/.env" ]; then
    echo -e "${YELLOW}Warning: No backend/.env file found${NC}"
    echo "Database connection details should be in backend/.env"
fi

# Menu
echo "What would you like to do?"
echo "1) Set up local database (Supabase local development)"
echo "2) Apply migrations to remote database"
echo "3) Create a new migration"
echo "4) View migration status"
echo ""
read -p "Your choice (1-4): " choice

case $choice in
    1)
        echo -e "\n${BLUE}Setting up local database...${NC}"
        
        # Start Supabase locally
        supabase start
        
        # Apply migrations
        echo -e "\n${BLUE}Applying migrations...${NC}"
        supabase db push
        
        echo -e "\n${GREEN}✓ Local database setup complete!${NC}"
        echo -e "\nLocal Supabase URLs:"
        echo "  API URL: http://localhost:54321"
        echo "  DB URL: postgresql://postgres:postgres@localhost:54322/postgres"
        echo "  Studio URL: http://localhost:54323"
        ;;
        
    2)
        echo -e "\n${BLUE}Applying migrations to remote database...${NC}"
        
        # Check for remote project
        if [ ! -f "supabase/.temp/project-ref" ]; then
            echo -e "${YELLOW}No remote project linked${NC}"
            read -p "Enter your Supabase project ref: " project_ref
            supabase link --project-ref $project_ref
        fi
        
        # Push migrations
        supabase db push
        
        echo -e "\n${GREEN}✓ Remote migrations applied!${NC}"
        ;;
        
    3)
        echo -e "\n${BLUE}Creating new migration...${NC}"
        read -p "Migration name (e.g., add_user_preferences): " migration_name
        
        supabase migration new $migration_name
        
        echo -e "\n${GREEN}✓ Migration created!${NC}"
        echo "Edit the migration file in supabase/migrations/"
        ;;
        
    4)
        echo -e "\n${BLUE}Migration status:${NC}"
        supabase migration list
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}Done!${NC}"
echo -e "${BLUE}================================${NC}"