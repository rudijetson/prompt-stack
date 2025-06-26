#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Common issues and solutions
print_header() {
  echo -e "\n${BLUE}===== $1 =====${NC}\n"
}

print_solution() {
  echo -e "${GREEN}Solution:${NC} $1"
}

print_command() {
  echo -e "${CYAN}  \$ $1${NC}"
}

# Main troubleshooting function
troubleshoot() {
  local issue="$1"
  
  case "$issue" in
    "port")
      print_header "Port Already in Use"
      echo "One or more required ports (3000, 8000) are already in use."
      echo
      print_solution "Option 1: Stop the conflicting process"
      print_command "lsof -ti:3000 | xargs kill -9  # Kill process on port 3000"
      print_command "lsof -ti:8000 | xargs kill -9  # Kill process on port 8000"
      echo
      print_solution "Option 2: Use our preflight check script"
      print_command "./scripts/preflight-checks.sh"
      echo
      print_solution "Option 3: Find what's using the ports"
      print_command "lsof -i :3000  # See what's using port 3000"
      print_command "lsof -i :8000  # See what's using port 8000"
      ;;
      
    "docker")
      print_header "Docker Not Running"
      echo "Docker needs to be running to use Prompt-Stack."
      echo
      print_solution "Start Docker Desktop"
      if [[ "$OSTYPE" == "darwin"* ]]; then
        print_command "open -a Docker  # macOS"
      else
        print_command "systemctl start docker  # Linux with systemd"
        print_command "service docker start   # Linux with init.d"
      fi
      echo
      print_solution "Verify Docker is running"
      print_command "docker info"
      echo
      print_solution "If Docker is not installed"
      echo "Visit: https://www.docker.com/products/docker-desktop"
      ;;
      
    "setup")
      print_header "Setup Issues"
      echo "Having trouble with the initial setup?"
      echo
      print_solution "Run setup manually"
      print_command "./setup.sh"
      echo
      print_solution "Skip interactive prompts"
      print_command "NONINTERACTIVE=true ./setup.sh"
      echo
      print_solution "Create minimal .env files manually"
      print_command "cp .env.example .env"
      print_command "cp frontend/.env.local.example frontend/.env.local"
      ;;
      
    "auth")
      print_header "Authentication Issues"
      echo "Problems with login or authentication?"
      echo
      print_solution "In Demo Mode"
      echo "- Any email/password combination works"
      echo "- Sessions are stored in localStorage"
      echo "- Check browser console for errors"
      echo
      print_solution "Clear browser data"
      echo "1. Open DevTools (F12)"
      echo "2. Go to Application tab"
      echo "3. Clear localStorage"
      echo "4. Refresh the page"
      echo
      print_solution "Verify demo mode is enabled"
      print_command "grep DEMO_MODE .env"
      print_command "grep NEXT_PUBLIC_DEMO_MODE frontend/.env.local"
      ;;
      
    "api")
      print_header "API Connection Issues"
      echo "Frontend can't connect to backend?"
      echo
      print_solution "Check if backend is running"
      print_command "curl http://localhost:8000/api/health"
      echo
      print_solution "Check Docker containers"
      print_command "docker ps"
      echo
      print_solution "View backend logs"
      print_command "docker-compose logs backend"
      echo
      print_solution "Restart containers"
      print_command "docker-compose down"
      print_command "docker-compose up"
      ;;
      
    "slow")
      print_header "Slow Performance"
      echo "First run taking too long?"
      echo
      echo "This is normal! First run needs to:"
      echo "- Download Docker images (~500MB)"
      echo "- Install npm dependencies"
      echo "- Build the application"
      echo
      print_solution "Monitor progress"
      print_command "docker-compose logs -f"
      echo
      print_solution "Future runs will be much faster!"
      ;;
      
    *)
      print_header "Prompt-Stack Troubleshooting Guide"
      echo "Common issues and solutions:"
      echo
      echo -e "${YELLOW}Port conflicts:${NC}      ./scripts/troubleshoot.sh port"
      echo -e "${YELLOW}Docker issues:${NC}       ./scripts/troubleshoot.sh docker"
      echo -e "${YELLOW}Setup problems:${NC}      ./scripts/troubleshoot.sh setup"
      echo -e "${YELLOW}Auth issues:${NC}         ./scripts/troubleshoot.sh auth"
      echo -e "${YELLOW}API connection:${NC}      ./scripts/troubleshoot.sh api"
      echo -e "${YELLOW}Slow performance:${NC}    ./scripts/troubleshoot.sh slow"
      echo
      echo -e "${CYAN}Quick Commands:${NC}"
      echo -e "  Check status:      ${CYAN}make status${NC}"
      echo -e "  View logs:         ${CYAN}docker-compose logs -f${NC}"
      echo -e "  Restart:           ${CYAN}make clean && make dev-demo${NC}"
      echo -e "  Full reset:        ${CYAN}make clean && rm -rf .env frontend/.env.local${NC}"
      ;;
  esac
  
  echo
  echo -e "${BLUE}Still having issues?${NC}"
  echo "- Check the docs: https://github.com/anthropics/prompt-stack"
  echo "- Report an issue: https://github.com/anthropics/prompt-stack/issues"
  echo
}

# Run if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  troubleshoot "$@"
fi