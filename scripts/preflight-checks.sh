#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Running Preflight Checks...${NC}\n"

# Track if any checks fail
CHECKS_PASSED=true

# Function to print check results
print_check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        CHECKS_PASSED=false
    fi
}

# Check Docker
echo -e "${YELLOW}Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    print_check 0 "Docker is installed"
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        print_check 0 "Docker daemon is running"
    else
        print_check 1 "Docker daemon is not running. Please start Docker."
    fi
else
    print_check 1 "Docker is not installed. Please install Docker Desktop."
fi

# Check Docker Compose
echo -e "\n${YELLOW}Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    print_check 0 "Docker Compose is available"
else
    print_check 1 "Docker Compose is not available"
fi

# Check ports
echo -e "\n${YELLOW}Checking port availability...${NC}"

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local process=$(lsof -Pi :$port -sTCP:LISTEN -t | xargs ps -p | tail -n 1)
        print_check 1 "Port $port is in use by: $process"
        echo -e "  ${YELLOW}→ ${service} needs port $port. Please free this port.${NC}"
    else
        print_check 0 "Port $port is available for ${service}"
    fi
}

check_port 3000 "Frontend"
check_port 8000 "Backend API"

# Check environment files
echo -e "\n${YELLOW}Checking environment files...${NC}"

if [ -f ".env" ]; then
    print_check 0 "Backend .env file exists"
else
    print_check 1 "Backend .env file missing"
    echo -e "  ${YELLOW}→ Run './setup.sh' to create it${NC}"
fi

if [ -f "frontend/.env.local" ]; then
    print_check 0 "Frontend .env.local file exists"
else
    print_check 1 "Frontend .env.local file missing"
    echo -e "  ${YELLOW}→ Run './setup.sh' to create it${NC}"
fi

# Check for common issues
echo -e "\n${YELLOW}Checking for common issues...${NC}"

# Check if running in a path with spaces
if [[ "$PWD" =~ \  ]]; then
    print_check 1 "Project path contains spaces: $PWD"
    echo -e "  ${YELLOW}→ Move project to a path without spaces${NC}"
else
    print_check 0 "Project path is valid"
fi

# Check Node.js (optional, for local development)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_check 0 "Node.js version is 18+ (optional)"
    else
        print_check 1 "Node.js version is below 18 (optional)"
        echo -e "  ${YELLOW}→ Consider upgrading for local development${NC}"
    fi
fi

# Check Python (optional, for local development)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    if [[ $(echo "$PYTHON_VERSION >= 3.8" | bc) -eq 1 ]]; then
        print_check 0 "Python version is 3.8+ (optional)"
    else
        print_check 1 "Python version is below 3.8 (optional)"
    fi
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}✅ All checks passed! You're ready to run the project.${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "  1. Run ${GREEN}make dev${NC} to start in development mode"
    echo -e "  2. Visit ${BLUE}http://localhost:3000${NC} for the frontend"
    echo -e "  3. Visit ${BLUE}http://localhost:8000/docs${NC} for API documentation"
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    echo -e "\n${YELLOW}Need help?${NC}"
    echo -e "  • Run ${GREEN}./scripts/troubleshoot.sh${NC} for solutions"
    echo -e "  • Check the README for detailed setup instructions"
fi

exit 0