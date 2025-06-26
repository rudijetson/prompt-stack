#!/bin/bash
# Prompt-Stack Setup Script
# Handles the complete setup flow intelligently

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}       🚀 Prompt-Stack Setup${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to check if API keys are present
has_api_keys() {
    if [ -f backend/.env ]; then
        grep -q "SUPABASE_URL=https://" backend/.env || return 1
        return 0
    fi
    return 1
}

# Function to check if Supabase is configured
has_supabase() {
    if [ -f backend/.env ]; then
        grep -q "SUPABASE_URL=https://.*\.supabase\.co" backend/.env && \
        grep -q "SUPABASE_ANON_KEY=eyJ" backend/.env
        return $?
    fi
    return 1
}

# Function to restart Docker containers
restart_docker() {
    print_step "Restarting Docker containers to load new environment..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for services to be ready
    print_step "Waiting for services to start..."
    sleep 10
    
    # Check if services are healthy
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Backend is running"
    else
        print_error "Backend failed to start"
        exit 1
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is running"
    else
        print_error "Frontend failed to start"
        exit 1
    fi
}

# Main setup flow
print_header

# Step 1: Check if this is first run
if [ ! -f backend/.env ]; then
    print_step "First time setup detected"
    
    # Create demo environment
    print_step "Creating demo configuration..."
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env.local
    print_success "Demo environment created"
    
    # Start services
    print_step "Starting services in demo mode..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for services
    sleep 10
    
    print_success "Demo setup complete!"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Prompt-Stack is running in DEMO MODE${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend:  http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo -e "${YELLOW}Want to add real features?${NC}"
    echo ""
    echo "Add Supabase (auth + database):"
    echo "  ${BLUE}./setup.sh supabase${NC}"
    echo ""
    echo "Add AI providers:"
    echo "  ${BLUE}./setup.sh ai${NC}"
    echo ""
    echo "Or configure everything:"
    echo "  ${BLUE}./setup.sh configure${NC}"
    echo ""
    exit 0
fi

# Handle different commands
case "$1" in
    "supabase")
        echo ""
        print_step "Configuring Supabase..."
        echo "Get your keys from: https://app.supabase.com/project/_/settings/api"
        echo ""
        read -p "Supabase URL: " supabase_url
        read -p "Supabase Anon Key: " supabase_anon
        read -p "Supabase Service Key: " supabase_service
        
        # Update backend
        sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$supabase_url|" backend/.env
        sed -i.bak "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$supabase_anon|" backend/.env
        sed -i.bak "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$supabase_service|" backend/.env
        
        # Update frontend
        sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$supabase_url|" frontend/.env.local
        sed -i.bak "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon|" frontend/.env.local
        
        rm -f backend/.env.bak frontend/.env.local.bak
        print_success "Supabase configured"
        
        # Restart Docker
        restart_docker
        
        # Run migration script to prepare combined SQL
        print_step "Preparing database migrations..."
        ./scripts/run-migrations.sh > /dev/null 2>&1
        
        # Show migration instructions
        SUPABASE_URL=$supabase_url
        PROJECT_ID=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
        
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}📊 Database Migration Required${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Run migrations with one of these methods:"
        echo ""
        echo "Method 1 (Recommended):"
        echo "  ${BLUE}./scripts/run-migrations.sh${NC}"
        echo "  Then follow the instructions"
        echo ""
        echo "Method 2 (Direct link):"
        echo "  1. Open: ${BLUE}https://app.supabase.com/project/$PROJECT_ID/sql/new${NC}"
        echo "  2. Copy contents of: ${BLUE}supabase/migrations/all_migrations_combined.sql${NC}"
        echo "  3. Paste and click 'Run'"
        echo ""
        echo "Then verify with: ${BLUE}./setup.sh status${NC}"
        ;;
        
    "ai")
        echo ""
        print_step "Configuring AI Providers (press Enter to skip any)..."
        
        read -p "OpenAI API Key: " openai_key
        [ -n "$openai_key" ] && sed -i.bak "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$openai_key|" backend/.env
        
        read -p "Anthropic API Key: " anthropic_key
        [ -n "$anthropic_key" ] && sed -i.bak "s|ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=$anthropic_key|" backend/.env
        
        read -p "Gemini API Key: " gemini_key
        [ -n "$gemini_key" ] && sed -i.bak "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=$gemini_key|" backend/.env
        
        read -p "DeepSeek API Key: " deepseek_key
        [ -n "$deepseek_key" ] && sed -i.bak "s|DEEPSEEK_API_KEY=.*|DEEPSEEK_API_KEY=$deepseek_key|" backend/.env
        
        rm -f backend/.env.bak
        print_success "AI providers configured"
        
        # Restart Docker
        restart_docker
        ;;
        
    "configure")
        # Run both
        $0 supabase
        echo ""
        read -p "Press Enter to continue with AI configuration..."
        $0 ai
        ;;
        
    "status"|"verify")
        echo ""
        print_step "Checking setup status..."
        
        # Check backend
        BACKEND_STATUS=$(curl -s http://localhost:8000/ | jq -r '.data.demo_mode')
        if [ "$BACKEND_STATUS" == "false" ]; then
            print_success "Backend: Production mode"
        else
            print_success "Backend: Demo mode"
        fi
        
        # Check providers
        echo ""
        print_step "AI providers:"
        curl -s http://localhost:8000/api/llm/providers | jq -r '.data.providers[] | select(.configured == true) | "  ✓ " + .name' | while read line; do
            echo -e "${GREEN}$line${NC}"
        done
        
        # Check Supabase
        if has_supabase; then
            echo ""
            print_step "Database:"
            HEALTH=$(curl -s http://localhost:8000/api/health/detailed | jq -r '.data.services.database')
            if [ "$HEALTH" == "connected" ] || [ "$HEALTH" == "online" ]; then
                print_success "  ✓ Supabase connected"
            else
                print_error "  ✗ Supabase not connected (run migrations?)"
            fi
        fi
        ;;
        
    "restart")
        restart_docker
        ;;
        
    "help"|"--help"|"-h")
        echo "Usage: ./setup.sh [command]"
        echo ""
        echo "Commands:"
        echo "  ${BLUE}(no command)${NC}     Initial setup (creates demo environment)"
        echo "  ${BLUE}supabase${NC}         Configure Supabase authentication"
        echo "  ${BLUE}ai${NC}               Configure AI providers"  
        echo "  ${BLUE}configure${NC}        Configure everything interactively"
        echo "  ${BLUE}status${NC}           Check current configuration"
        echo "  ${BLUE}restart${NC}          Restart Docker containers"
        echo "  ${BLUE}help${NC}             Show this help"
        echo ""
        ;;
        
    *)
        # Default: show current status
        if has_supabase; then
            echo -e "${GREEN}✓ Supabase configured${NC}"
        else
            echo -e "${YELLOW}○ Run: ./setup.sh supabase${NC}"
        fi
        
        if has_api_keys; then
            echo -e "${GREEN}✓ API keys configured${NC}"
        else
            echo -e "${YELLOW}○ Run: ./setup.sh ai${NC}"
        fi
        
        echo ""
        echo "Services:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:8000"
        echo ""
        echo "Run ${BLUE}./setup.sh help${NC} for all commands"
        ;;
esac