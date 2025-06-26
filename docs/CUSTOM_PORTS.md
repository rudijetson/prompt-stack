# Custom Port Configuration

This guide explains how to run Prompt-Stack on custom ports instead of the defaults (3000 for frontend, 8000 for backend).

## Quick Steps (Simplest Method)

### 1. Copy and edit the example file:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
FRONTEND_PORT=3001
BACKEND_PORT=8002
```

### 2. Update Frontend Environment

Edit `frontend/.env.local`:

```env
# Point to your custom backend port
NEXT_PUBLIC_API_URL=http://localhost:8002
```

### 3. Restart Services

```bash
docker-compose down
docker-compose up -d
```

That's it! The ports are now configured via environment variables.

## Examples

### Running on Alternative Ports

**Frontend on 3001, Backend on 8080:**

1. `docker-compose.dev.yml`:
   ```yaml
   frontend:
     ports:
       - "3001:3000"
   backend:
     ports:
       - "8080:8000"
   ```

2. `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

### Running Multiple Instances

You can run multiple Prompt-Stack instances by using different ports:

**Instance 1:**
- Frontend: 3000
- Backend: 8000

**Instance 2:**
- Frontend: 3001
- Backend: 8001
- Update `NEXT_PUBLIC_API_URL=http://localhost:8001`

## Important Notes

1. **Frontend Environment**: Always update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to match your backend port
2. **Docker Internal**: The second port number (after the colon) should stay the same - it's the internal container port
3. **Full Restart**: After changing ports, do a full restart with `docker-compose down` then `up`
4. **API Access**: All API endpoints will be available at your custom port (e.g., `http://localhost:8002/docs`)

## Troubleshooting

- **Frontend can't reach backend**: Check that `NEXT_PUBLIC_API_URL` matches your backend port
- **Port already in use**: Use `lsof -i :PORT` to check what's using the port
- **Changes not taking effect**: Ensure you did a full restart with `docker-compose down`