#!/bin/bash

# Simple API Testing Script
# Tests key endpoints to verify configuration

echo "🧪 Testing Prompt-Stack API"
echo "=========================="
echo ""

API_URL="http://localhost:8000"

# Function to test endpoint
test() {
    local method=$1
    local path=$2
    local data=$3
    local desc=$4
    
    echo -n "Testing $desc... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "HTTP_CODE:%{http_code}" "$API_URL$path" 2>/dev/null)
    else
        response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$API_URL$path" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
    
    if [ "$http_code" = "200" ]; then
        echo "✅ OK"
        if [ -n "$body" ] && command -v jq >/dev/null 2>&1; then
            echo "$body" | jq -C '.' 2>/dev/null | head -10 || echo "$body" | head -50
        fi
    else
        echo "❌ Failed (HTTP $http_code)"
        echo "$body" | head -50
    fi
    echo ""
}

# 1. Health Check
echo "1️⃣  Health & Status"
echo "-------------------"
test GET "/" "" "Root endpoint"
test GET "/api/health/" "" "Health check"
test GET "/api/dev/health" "" "Detailed health"

# 2. LLM Configuration
echo "2️⃣  LLM Configuration"
echo "--------------------"
test GET "/api/llm/providers" "" "Provider status"

# 3. Demo LLM
echo "3️⃣  Demo LLM Generation"
echo "----------------------"
test POST "/api/llm/generate-demo" '{"prompt":"Hello! Tell me about yourself.","model":"demo"}' "Demo generation"

# 4. Authentication
echo "4️⃣  Authentication"
echo "-----------------"
test GET "/api/auth/demo/check" "" "Check demo auth"
test POST "/api/auth/demo/signin" '{"email":"test@example.com","password":"test123"}' "Demo sign in"

# 5. Payment Config
echo "5️⃣  Payment Configuration"
echo "------------------------"
test GET "/api/payments-demo/stripe/status" "" "Stripe status"
test GET "/api/payments-demo/lemonsqueezy/status" "" "Lemon Squeezy status"

echo ""
echo "✅ Basic API test complete!"
echo ""
echo "To run more comprehensive tests, check:"
echo "- Authentication with real Supabase"
echo "- LLM generation with API keys"
echo "- Payment processing with test keys"
echo "- Vector database operations"