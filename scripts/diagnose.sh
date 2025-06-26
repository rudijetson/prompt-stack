#!/bin/bash

# Prompt-Stack Diagnostic Tool
# Helps developers quickly identify common setup issues

# Check for --quick flag
QUICK_MODE=false
if [[ "$1" == "--quick" || "$1" == "-q" ]]; then
    QUICK_MODE=true
fi

if [ "$QUICK_MODE" = true ]; then
    echo "🔍 Quick Setup Verification"
else
    echo "🔍 Prompt-Stack Diagnostic Tool"
fi
echo "==============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -n "Docker daemon: "
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo "  Fix: Start Docker Desktop or run 'sudo systemctl start docker'"
    exit 1
fi

# Check if containers are running
echo -n "Backend container: "
if docker-compose -f docker-compose.dev.yml ps | grep -q "backend.*Up"; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo "  Fix: Run 'make dev' or 'docker-compose -f docker-compose.dev.yml up -d'"
fi

echo -n "Frontend container: "
if docker-compose -f docker-compose.dev.yml ps | grep -q "frontend.*Up"; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo "  Fix: Run 'make dev' or 'docker-compose -f docker-compose.dev.yml up -d'"
fi

# Check API health
echo ""
echo "📡 API Health:"
echo -n "Backend API: "
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health/)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Not responding (HTTP $HEALTH_RESPONSE)${NC}"
    echo "  Check: docker logs prompt-stack-backend-1"
fi

echo -n "Frontend: "
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Accessible${NC}"
else
    echo -e "${RED}❌ Not responding (HTTP $FRONTEND_RESPONSE)${NC}"
    echo "  Check: docker logs prompt-stack-frontend-1"
fi

# Check environment setup
echo ""
echo "🔧 Environment Configuration:"
echo -n "Backend .env file: "
if [ -f backend/.env ]; then
    echo -e "${GREEN}✅ Exists${NC}"
    
    # Check for API keys
    echo -n "  API keys configured: "
    if docker-compose -f docker-compose.dev.yml exec -T backend env | grep -E "(OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|DEEPSEEK_API_KEY)" | grep -v "=$" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Found${NC}"
    else
        echo -e "${YELLOW}⚠️  None found (Demo mode active)${NC}"
    fi
else
    echo -e "${RED}❌ Missing${NC}"
    echo "  Fix: Run 'make setup' or 'cp backend/.env.example backend/.env'"
fi

echo -n "Frontend .env.local file: "
if [ -f frontend/.env.local ]; then
    echo -e "${GREEN}✅ Exists${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    echo "  Fix: Run 'make setup' or 'cp frontend/.env.example frontend/.env.local'"
fi

# Check provider status
echo ""
echo "🤖 AI Provider Status:"
PROVIDERS=$(curl -s http://localhost:8000/api/llm/providers 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$PROVIDERS" ]; then
    # Check demo provider
    echo -n "  Demo: "
    echo -e "${GREEN}✅ Always available${NC}"
    
    # Check real providers
    for provider in openai anthropic gemini deepseek; do
        echo -n "  $provider: "
        if echo "$PROVIDERS" | jq -e ".data.providers[] | select(.name == \"$provider\" and .configured == true)" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Not configured${NC}"
        fi
    done
else
    echo -e "${RED}  ❌ Cannot fetch provider status${NC}"
fi

# Common issues
echo ""
echo "💡 Quick Fixes:"
echo ""
echo "1. ${YELLOW}Environment changes not working?${NC}"
echo "   ⚠️  FULL RESTART REQUIRED after .env changes:"
echo "   ${GREEN}docker-compose -f docker-compose.dev.yml down && make dev${NC}"
echo ""
echo "2. ${YELLOW}Getting 404 errors?${NC}"
echo "   Check API endpoints:"
echo "   - LLM: POST /api/llm/generate"
echo "   - Auth: POST /api/auth/demo/signin"
echo ""
echo "3. ${YELLOW}Want to test the API?${NC}"
echo "   ${GREEN}./scripts/test-api-simple.sh${NC}"
echo ""
echo "4. ${YELLOW}LLMs configured but can't test them?${NC}"
echo "   You need Supabase for authentication!"
echo "   Setup order: Supabase → LLMs → Others"
echo ""

# Final status
echo "📊 Overall Status:"
if [ "$HEALTH_RESPONSE" = "200" ] && [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ System is running! Visit http://localhost:3000${NC}"
else
    echo -e "${RED}❌ System needs attention. Check the errors above.${NC}"
fi

# Quick mode summary
if [ "$QUICK_MODE" = true ]; then
    echo ""
    if [ -f backend/.env ] && [ -f frontend/.env.local ]; then
        if curl -s http://localhost:8000/api/health/ | grep -q "healthy" && curl -s http://localhost:3000 | grep -q "Prompt-Stack"; then
            echo -e "${GREEN}🎉 Everything looks good!${NC}"
            echo ""
            echo "Next steps:"
            echo "1. Visit http://localhost:3000"
            echo "2. Add API keys to backend/.env for real AI responses"
            exit 0
        fi
    fi
    echo -e "${YELLOW}Some issues found. Run without --quick for details.${NC}"
fi