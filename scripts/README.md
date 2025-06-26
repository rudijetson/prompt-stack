# Scripts Directory

Quick reference for all scripts in Prompt-Stack.

## 🚀 Setup & Development

### Main Setup Script
- **`../setup.sh`** - The ONE setup script you need!
  ```bash
  ./setup.sh              # First time? Creates demo config & starts
  ./setup.sh --configure  # Add real services later
  ```

### Development Tools
- **`diagnose.sh`** - System health check
  ```bash
  ./scripts/diagnose.sh         # Full diagnostic
  ./scripts/diagnose.sh --quick # Quick check only
  ```
- **`reset.sh`** - Reset to clean state (removes .env, stops containers)
- **`preflight-checks.sh`** - Pre-launch verification (used internally)

## 🧪 Testing
- **`test-api-simple.sh`** - Quick API health check
- **`test-api-comprehensive.sh`** - Full API test suite with report
- **`troubleshoot.sh`** - Interactive troubleshooting guide

## 🚢 Deployment
- **`deploy.sh`** - Deploy both frontend and backend
- **`deploy-frontend.sh`** - Deploy frontend to Vercel
- **`deploy-backend.sh`** - Deploy backend (Railway/Render/Fly)

## 🗄️ Database
- **`../supabase/setup-database.sh`** - Database migrations and setup

## Most Common Commands

```bash
# Start fresh (90% of users need just this)
./setup.sh

# Check if everything works
./scripts/diagnose.sh --quick

# Test the API
./scripts/test-api-simple.sh

# Having issues?
./scripts/troubleshoot.sh

# Start over
./scripts/reset.sh
```

## For AI/LLM Tools

When asked about scripts, check this directory:
- All scripts are executable shell scripts (.sh)
- Scripts are self-contained with help text
- Most scripts can be run without arguments
- Scripts use consistent color coding for output