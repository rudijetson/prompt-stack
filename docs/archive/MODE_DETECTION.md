# Mode Detection System

## Overview

PromptStack automatically detects which services are configured and adjusts its behavior accordingly. This allows you to start with demo mode and gradually add real services as needed.

## How It Works

### Automatic Detection

The system checks your environment variables on startup:
- If API keys are present and valid → Production mode for that service
- If API keys are missing or invalid → Demo mode for that service
- Mixed configurations are fully supported

### Three Operating Modes

1. **Demo Mode** (`DEMO_MODE=true` or no services configured)
   - All features use mock data
   - No API keys required
   - Perfect for initial exploration

2. **Production Mode** (`DEMO_MODE=false` with all services configured)
   - All features use real services
   - Requires valid API keys
   - For live applications

3. **Auto Mode** (`DEMO_MODE=auto` - default)
   - Automatically detects configuration
   - Uses real services where available
   - Falls back to demo for unconfigured services

## Configuration

### Environment Variables

```bash
# Force specific mode
DEMO_MODE=true   # Always use demo
DEMO_MODE=false  # Always use production (fails if services missing)
DEMO_MODE=auto   # Automatic detection (default)

# Service configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
# ... etc
```

### Valid vs Invalid Keys

The system recognizes these as "not configured":
- Missing environment variable
- Empty value: `OPENAI_API_KEY=`
- Placeholder text: `OPENAI_API_KEY=your-key-here`
- Demo values: `SUPABASE_URL=demo`

## Security: Auth-First Policy

**Important**: To use real AI providers, you MUST have real authentication configured.

This prevents:
- Accidental API usage without user tracking
- Unattributed API costs
- Security vulnerabilities

## Checking Current Mode

### Backend API
```bash
curl http://localhost:8000/api/system/capabilities
```

### Frontend Hook
```typescript
import { useCapabilities } from '@/lib/hooks/useCapabilities'

function MyComponent() {
  const { capabilities, mode, isDemoMode } = useCapabilities()
  // Use the capability information
}
```

### Status Indicators
- Navigation bar shows current mode
- Demo banner appears when in demo/mixed mode
- Dashboard displays service status

## Common Scenarios

### Starting Fresh
1. Clone repository
2. Run `make dev` 
3. System starts in demo mode
4. Add API keys as you obtain them
5. Services automatically activate

### Development Setup
1. Add Supabase credentials for real auth
2. Add one AI provider for testing
3. Leave payments in demo mode
4. System uses real services where configured

### Production Deployment
1. Set all required API keys
2. Optionally set `DEMO_MODE=false` to enforce
3. System validates all services are configured
4. Fails fast if any service is missing

## Troubleshooting

### Service shows as demo when API key is set
- Check for typos in environment variable names
- Ensure no spaces around `=` in .env file
- Restart Docker containers after changes
- Verify key isn't a placeholder value

### "Authentication required" error with AI
- The auth-first policy requires real authentication
- Add Supabase credentials before AI providers
- Or use the demo endpoint for testing

### Mixed mode not working as expected
- Check `/api/system/capabilities` endpoint
- Ensure `DEMO_MODE=auto` (or not set)
- Review which services are detected as configured