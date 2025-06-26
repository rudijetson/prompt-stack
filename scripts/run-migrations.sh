#!/bin/bash
# Supabase Migration Runner - Combines all migrations for easy execution

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for backend/.env
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}Error: backend/.env not found${NC}"
    exit 1
fi

# Extract project ID
SUPABASE_URL=$(grep "^SUPABASE_URL=" backend/.env | cut -d'=' -f2-)
PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}       🗄️  Supabase Migration Runner${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Count migration files
count=$(find supabase/migrations -name "[0-9]*.sql" -type f 2>/dev/null | wc -l | tr -d ' ')
echo -e "${YELLOW}Found $count migration file(s) in supabase/migrations/${NC}"
echo ""

# Create combined file
combined="supabase/migrations/all_migrations_combined.sql"
echo "-- Combined Supabase migrations" > "$combined"
echo "-- Generated: $(date)" >> "$combined"
echo "-- Run this file in Supabase SQL Editor" >> "$combined"
echo "" >> "$combined"

# Add each migration in order
for migration in supabase/migrations/[0-9]*.sql; do
    if [ -f "$migration" ]; then
        echo -e "  Adding: $(basename $migration)"
        echo "" >> "$combined"
        echo "-- ================================================" >> "$combined"
        echo "-- Migration: $(basename $migration)" >> "$combined"
        echo "-- ================================================" >> "$combined"
        cat "$migration" >> "$combined"
        echo "" >> "$combined"
    fi
done

echo ""
echo -e "${GREEN}✓ Created: $combined${NC}"
echo ""
echo -e "${BLUE}To run all migrations:${NC}"
echo ""
echo "1. Open: ${GREEN}https://app.supabase.com/project/${PROJECT_REF}/sql/new${NC}"
echo "2. Copy contents of: ${GREEN}$combined${NC}"
echo "3. Paste and click 'Run'"
echo ""
echo -e "${YELLOW}Note: Migrations will set up:${NC}"
echo "  - User profiles with roles (user/admin/super_admin)"
echo "  - Row Level Security policies"
echo "  - Automatic admin assignment for first user"
echo "  - Role change audit logging"
echo "  - JWT custom claims for authentication"