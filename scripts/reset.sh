#!/bin/bash

# Reset Script - Cleans everything to simulate fresh clone
# Usage: ./scripts/reset.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Prompt-Stack Reset Script${NC}"
echo -e "${BLUE}===========================${NC}"
echo ""
echo "This will reset your environment to a fresh clone state."
echo -e "${YELLOW}Warning: This will remove all .env files and stop all containers!${NC}"
echo ""

# Confirm with user
read -p "Are you sure you want to reset? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Reset cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Starting reset process...${NC}"
echo ""

# 1. Stop all containers
echo -e "${YELLOW}→ Stopping Docker containers...${NC}"
if docker-compose -f docker-compose.dev.yml ps -q 2>/dev/null | grep -q .; then
    docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
    echo -e "${GREEN}✓ Containers stopped${NC}"
else
    echo -e "${GREEN}✓ No containers running${NC}"
fi

# 2. Remove all .env files
echo -e "${YELLOW}→ Removing environment files...${NC}"
rm -f backend/.env
rm -f frontend/.env.local
rm -f .env
echo -e "${GREEN}✓ Environment files removed${NC}"

# 3. Clean build artifacts
echo -e "${YELLOW}→ Cleaning build artifacts...${NC}"
rm -rf frontend/node_modules frontend/.next 2>/dev/null || true
rm -rf backend/__pycache__ backend/.pytest_cache 2>/dev/null || true
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
echo -e "${GREEN}✓ Build artifacts cleaned${NC}"

# 4. Remove any Docker volumes
echo -e "${YELLOW}→ Removing Docker volumes...${NC}"
docker volume prune -f 2>/dev/null || true
echo -e "${GREEN}✓ Docker volumes cleaned${NC}"

# 5. Clear Docker build cache (optional)
echo ""
read -p "Clear Docker build cache too? This will free space but slow next build (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}→ Clearing Docker build cache...${NC}"
    docker builder prune -f 2>/dev/null || true
    echo -e "${GREEN}✓ Docker cache cleared${NC}"
fi

echo ""
echo -e "${GREEN}✅ Reset complete!${NC}"
echo ""
echo "Your environment is now in a fresh state."
echo "Next steps:"
echo "  1. Run: ${BLUE}./setup.sh${NC} to configure environment"
echo "  2. Run: ${BLUE}make dev${NC} to start development"
echo ""