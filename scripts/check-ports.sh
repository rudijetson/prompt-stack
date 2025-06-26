#!/bin/bash

# Check if default ports are in use
echo "Checking for port conflicts..."

# Default ports
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-8000}

# Function to check if port is in use
check_port() {
    local port=$1
    local service=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo "❌ Port $port is already in use (needed for $service)"
        echo "   Process using port:"
        lsof -i :$port | grep LISTEN | head -1
        return 1
    else
        echo "✅ Port $port is available ($service)"
        return 0
    fi
}

# Check both ports
conflicts=0
check_port $FRONTEND_PORT "frontend" || ((conflicts++))
check_port $BACKEND_PORT "backend" || ((conflicts++))

if [ $conflicts -gt 0 ]; then
    echo ""
    echo "To use different ports, create a .env file with:"
    echo "FRONTEND_PORT=3001"
    echo "BACKEND_PORT=8002"
    echo ""
    echo "Then update frontend/.env.local:"
    echo "NEXT_PUBLIC_API_URL=http://localhost:8002"
    exit 1
else
    echo ""
    echo "All ports are available! You can run:"
    echo "docker-compose up -d"
fi