# Quick Start Guide

Get Prompt-Stack running in under 5 minutes!

## Prerequisites

You only need:
- Docker Desktop installed and running
- Git to clone the repository

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/prompt-stack.git
cd prompt-stack
```

### 2. Run Setup Script

```bash
./setup.sh
```

When prompted:
- **Configure API keys?** → Press `n` (use demo mode)
- **Start development environment?** → Press `Y`

### 3. Wait for Startup

The first run takes 2-3 minutes to:
- Download Docker images
- Install dependencies
- Build the application

You'll know it's ready when you see:
```
frontend-1  |  ✓ Ready in 1350ms
```

### 4. Access Your App

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## Total Time: ~3 minutes

- Setup script: 30 seconds
- Container startup: 2-3 minutes (first time only)
- Future starts: < 30 seconds

## What You Get

In demo mode, everything works without configuration:
- ✅ Authentication (any email/password)
- ✅ AI Chat (demo responses)
- ✅ API endpoints
- ✅ Full UI experience

## Common Commands

```bash
# Check if everything is working
./scripts/diagnose.sh

# Test the API
./scripts/test-api-simple.sh

# Stop everything
docker-compose down

# Restart
make dev
```

## Troubleshooting

If you see any issues:
```bash
./scripts/troubleshoot.sh
```

## Next Steps

1. Explore the demo at http://localhost:3000
2. Try the API at http://localhost:8000/docs
3. When ready, add real API keys to `.env` files
4. Check out the [full documentation](../README.md)

---

**Note**: The "path contains spaces" warning doesn't affect functionality - it's just a best practice suggestion.