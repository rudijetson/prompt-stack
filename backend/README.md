# Backend API

FastAPI backend for Prompt-Stack.

## Structure

```
app/
├── api/endpoints/     # API routes
├── services/         # Business logic
├── models/           # Pydantic models
├── core/             # Core utilities
└── main.py          # Application entry
```

## Key Endpoints

- `/health` - Health check
- `/api/auth/*` - Authentication
- `/api/llm/*` - AI text generation
- `/api/vectordb/*` - Vector search
- `/api/payments-demo/*` - Payment demos

## Adding New Endpoints

1. Create file in `app/api/endpoints/`
2. Add router to `app/api/router.py`
3. Test at http://localhost:8000/docs

## Environment Variables

See `/backend/.env.example` for required variables.

## Common Tasks

```python
# Add new LLM provider
# Edit app/services/llm_service.py

# Add new API endpoint
# Create app/api/endpoints/your_endpoint.py

# Modify rate limits
# Edit app/core/rate_limiter.py
```