#!/bin/bash

# Comprehensive API Testing Report
# Tests all endpoints and generates a detailed report

echo "🧪 Comprehensive API Testing Report"
echo "==================================="
echo "Date: $(date)"
echo ""

API_URL="http://localhost:8000"
REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).md"

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# API Testing Report

## Test Summary

| Category | Endpoint | Status | Notes |
|----------|----------|--------|-------|
EOF

# Function to test and log
test_and_log() {
    local method=$1
    local path=$2
    local data=$3
    local desc=$4
    local category=$5
    
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
        status="✅ Pass"
        echo -e "\033[32m✓\033[0m $desc"
    else
        status="❌ Fail ($http_code)"
        echo -e "\033[31m✗\033[0m $desc (HTTP $http_code)"
    fi
    
    # Log to report
    echo "| $category | $path | $status | $desc |" >> "$REPORT_FILE"
}

# 1. Core Endpoints
echo "1️⃣  Testing Core Endpoints"
echo "-------------------------"
test_and_log GET "/" "" "Root health check" "Core"
test_and_log GET "/docs" "" "API documentation" "Core"
test_and_log GET "/openapi.json" "" "OpenAPI spec" "Core"

# 2. Authentication
echo -e "\n2️⃣  Testing Authentication"
echo "-------------------------"
test_and_log GET "/api/auth/me" "" "Get current user (no auth)" "Auth"
test_and_log GET "/api/auth/profile" "" "Get profile (no auth)" "Auth"

# 3. LLM Services
echo -e "\n3️⃣  Testing LLM Services"
echo "-----------------------"
test_and_log GET "/api/llm/models" "" "List available models" "LLM"
test_and_log GET "/api/llm/providers" "" "List providers status" "LLM"
test_and_log POST "/api/llm/demo" '{"prompt":"Test","model":"demo"}' "Demo generation" "LLM"

# 4. Payment Services
echo -e "\n4️⃣  Testing Payment Services"
echo "---------------------------"
test_and_log GET "/api/payments-demo/stripe/status" "" "Stripe status" "Payments"
test_and_log GET "/api/payments-demo/lemonsqueezy/status" "" "LemonSqueezy status" "Payments"
test_and_log GET "/api/payments-demo/comparison" "" "Payment comparison" "Payments"
test_and_log GET "/api/payments-demo/recommendations" "" "Payment recommendations" "Payments"

# 5. Vector Database
echo -e "\n5️⃣  Testing Vector Database"
echo "---------------------------"
test_and_log POST "/api/vectordb/search" '{"collection_name":"test","vector":[0.1,0.2,0.3]}' "Vector search (no auth)" "VectorDB"

# 6. File Upload
echo -e "\n6️⃣  Testing File Upload"
echo "-----------------------"
test_and_log POST "/api/upload" "" "File upload (no file)" "Upload"

# 7. Examples
echo -e "\n7️⃣  Testing Example Endpoints"
echo "-----------------------------"
test_and_log GET "/api/examples/" "" "List examples" "Examples"
test_and_log GET "/api/examples/1" "" "Get example by ID" "Examples"

# 8. Development Endpoints
echo -e "\n8️⃣  Testing Development Endpoints"
echo "--------------------------------"
test_and_log GET "/api/dev/config" "" "Get configuration" "Dev"
test_and_log GET "/api/dev/health" "" "Dev health check" "Dev"

# Add detailed findings to report
echo -e "\n\n## Configuration Status\n" >> "$REPORT_FILE"

# Check LLM providers
echo "### LLM Providers" >> "$REPORT_FILE"
curl -s "$API_URL/api/llm/providers" | jq -r '.providers | to_entries[] | "- **\(.key)**: \(.value.configured)"' >> "$REPORT_FILE" 2>/dev/null

# Check payment status
echo -e "\n### Payment Providers" >> "$REPORT_FILE"
echo "#### Stripe" >> "$REPORT_FILE"
curl -s "$API_URL/api/payments-demo/stripe/status" | jq -r '. | "- Configured: \(.configured)\n- Test Mode: \(.test_mode)\n- Message: \(.message)"' >> "$REPORT_FILE" 2>/dev/null

echo -e "\n#### LemonSqueezy" >> "$REPORT_FILE"
curl -s "$API_URL/api/payments-demo/lemonsqueezy/status" | jq -r '. | "- Configured: \(.configured)\n- Test Mode: \(.test_mode)\n- Message: \(.message)"' >> "$REPORT_FILE" 2>/dev/null

# Add test recommendations
echo -e "\n## Recommendations\n" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'
### Next Steps for Full Testing

1. **Configure Supabase**
   - Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY` to backend/.env
   - This enables authentication, database, and vector storage

2. **Add AI Provider Keys**
   - Add at least one: `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`
   - DeepSeek recommended for cost-effectiveness ($0.14/million tokens)

3. **Configure Payment Processing**
   - Add `STRIPE_SECRET_KEY` (use test key: sk_test_...)
   - Or add `LEMONSQUEEZY_API_KEY` for alternative payment provider

4. **Test with Authentication**
   - Once Supabase is configured, test protected endpoints
   - Test file uploads with authentication
   - Test vector database operations

5. **Frontend Integration**
   - Ensure frontend is running on http://localhost:3000
   - Test full authentication flow
   - Test payment checkout flow
EOF

echo -e "\n\n✅ Test complete! Report saved to: $REPORT_FILE"
echo ""
echo "View the report with: cat $REPORT_FILE"