# Security Guide

This document outlines security practices, common vulnerabilities, and protective measures for the Prompt-Stack application.

## Table of Contents
1. [Security Principles](#security-principles)
2. [Authentication & Authorization](#authentication--authorization)
3. [Common Vulnerabilities](#common-vulnerabilities)
4. [Data Protection](#data-protection)
5. [API Security](#api-security)
6. [Frontend Security](#frontend-security)
7. [Infrastructure Security](#infrastructure-security)
8. [Security Checklist](#security-checklist)
9. [Incident Response](#incident-response)

## Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Grant minimum necessary permissions
3. **Fail Secure**: Errors should not compromise security
4. **Zero Trust**: Verify everything, trust nothing
5. **Security by Design**: Build security in, not bolt it on

## Authentication & Authorization

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│ Client  │────▶│   API   │────▶│ Supabase │────▶│ Database │
└─────────┘     └─────────┘     └──────────┘     └──────────┘
     │               │                │                 │
     │  1. Login     │  2. Verify    │  3. Check       │
     │  Request      │  Credentials  │  User/Role      │
     │               │                │                 │
     │◀──────────────┴────────────────┴─────────────────┘
     │  4. JWT Token with Role Claims
```

### JWT Token Security

```python
# app/core/auth.py
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AuthUser:
    """Validate JWT token and return current user."""
    token = credentials.credentials
    
    try:
        # Verify token signature and expiration
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        
        # Check token expiration
        if payload.get("exp") and datetime.utcnow().timestamp() > payload["exp"]:
            raise HTTPException(status_code=401, detail="Token expired")
        
        # Fetch user role from database (not just token)
        user = await get_user_with_role(payload["sub"])
        
        return AuthUser(
            id=user.id,
            email=user.email,
            role=user.role
        )
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Role-Based Access Control (RBAC)

```python
# Protect endpoints with role requirements
@router.get("/admin/users")
async def list_users(user: AuthUser = Depends(require_admin)):
    # Only admins can access
    pass

@router.delete("/admin/users/{id}")
async def delete_user(user: AuthUser = Depends(require_super_admin)):
    # Only super admins can delete users
    pass
```

### Database Security (RLS)

```sql
-- Prevent users from modifying their own role
CREATE POLICY "Users can update own profile except role" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (NEW.role IS NOT DISTINCT FROM OLD.role)
  );

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

## Common Vulnerabilities

### 1. SQL Injection Prevention

**Bad:**
```python
# NEVER DO THIS
query = f"SELECT * FROM users WHERE email = '{email}'"
```

**Good:**
```python
# Use parameterized queries
result = await db.execute(
    "SELECT * FROM users WHERE email = :email",
    {"email": email}
)
```

### 2. Cross-Site Scripting (XSS)

**Frontend Protection:**
```typescript
// React automatically escapes values
<div>{userInput}</div>  // Safe

// Dangerous - only if absolutely needed
<div dangerouslySetInnerHTML={{__html: userInput}} />  // XSS risk!

// Sanitize if you must use HTML
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />
```

### 3. Cross-Site Request Forgery (CSRF)

**Protection via SameSite Cookies:**
```python
# Set secure cookie attributes
response.set_cookie(
    key="session",
    value=session_token,
    httponly=True,      # No JS access
    secure=True,        # HTTPS only
    samesite="strict",  # CSRF protection
    max_age=3600
)
```

### 4. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/api/llm/generate")
@limiter.limit("10/minute")  # 10 requests per minute
async def generate_text(request: Request):
    pass
```

### 5. Input Validation

```python
from pydantic import BaseModel, validator, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain number')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        if len(v) > 100:
            raise ValueError('Name too long')
        # Prevent XSS in names
        if '<' in v or '>' in v:
            raise ValueError('Name contains invalid characters')
        return v
```

## Data Protection

### 1. Encryption at Rest
- Database: Supabase encrypts all data at rest
- File uploads: Encrypt before storing in S3/storage

### 2. Encryption in Transit
- Always use HTTPS (TLS 1.2+)
- Secure WebSocket connections for real-time features

### 3. Sensitive Data Handling

```python
# Never log sensitive data
logger.info("User login", extra={
    "user_id": user.id,  # OK
    # "password": password,  # NEVER!
})

# Hash passwords properly
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### 4. API Key Security

```python
# Store API keys encrypted
from cryptography.fernet import Fernet

def encrypt_api_key(api_key: str, user_key: bytes) -> str:
    f = Fernet(user_key)
    return f.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key: str, user_key: bytes) -> str:
    f = Fernet(user_key)
    return f.decrypt(encrypted_key.encode()).decode()
```

## API Security

### 1. API Authentication

```python
# Require authentication for all API endpoints
app.add_middleware(
    AuthenticationMiddleware,
    backend=JWTAuthenticationBackend()
)
```

### 2. Request Validation

```python
# Validate all inputs
@router.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    user: AuthUser = Depends(get_current_user)
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Invalid file type")
    
    # Validate file size
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")
    
    # Scan for malware (example)
    if await scan_file(file):
        raise HTTPException(400, "File contains malware")
```

### 3. Response Headers

```python
# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

## Frontend Security

### 1. Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL};
    `.replace(/\n/g, ' ').trim()
  }
]
```

### 2. Secure Storage

```typescript
// Don't store sensitive data in localStorage
// Bad
localStorage.setItem('apiKey', userApiKey)

// Better - use httpOnly cookies or session storage
// Or encrypt if you must use localStorage
import CryptoJS from 'crypto-js'

function secureStore(key: string, value: any, password: string) {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(value),
    password
  ).toString()
  sessionStorage.setItem(key, encrypted)
}
```

### 3. API Communication

```typescript
// Always validate API responses
async function fetchUserData(userId: string) {
  const response = await apiClient(`/api/users/${userId}`)
  
  // Validate response structure
  if (!response || typeof response.id !== 'string') {
    throw new Error('Invalid response format')
  }
  
  // Sanitize any HTML content
  if (response.bio) {
    response.bio = DOMPurify.sanitize(response.bio)
  }
  
  return response
}
```

## Infrastructure Security

### 1. Environment Variables

```bash
# .env.production
# Never commit secrets!
DATABASE_URL=postgresql://...  # Use secrets manager
STRIPE_SECRET_KEY=sk_live_...  # Use secrets manager
JWT_SECRET=$(openssl rand -base64 32)  # Generate strong secrets
```

### 2. Docker Security

```dockerfile
# Run as non-root user
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Don't expose unnecessary ports
EXPOSE 3000
# Not EXPOSE 22, 3306, 5432, etc.
```

### 3. Network Security

```yaml
# docker-compose.yml
services:
  backend:
    networks:
      - internal
      - frontend
    
  database:
    networks:
      - internal  # Not exposed to frontend
    
networks:
  internal:
    internal: true  # No external access
  frontend:
    # Public facing
```

## Security Checklist

### Development
- [ ] All dependencies up to date (`npm audit`, `pip check`)
- [ ] Environment variables not committed
- [ ] Input validation on all endpoints
- [ ] Output encoding to prevent XSS
- [ ] SQL injection prevention (parameterized queries)
- [ ] Authentication required for protected routes
- [ ] Authorization checks for admin functions
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] HTTPS enforced

### Pre-Production
- [ ] Security scan passed (OWASP ZAP, etc.)
- [ ] Penetration testing completed
- [ ] Secrets rotated from development
- [ ] Logging excludes sensitive data
- [ ] Error messages don't leak information
- [ ] File upload restrictions in place
- [ ] CORS properly configured
- [ ] CSP headers tested
- [ ] Database backups configured
- [ ] Monitoring alerts set up

### Production
- [ ] SSL/TLS certificates valid
- [ ] WAF (Web Application Firewall) configured
- [ ] DDoS protection enabled
- [ ] Regular security updates scheduled
- [ ] Incident response plan documented
- [ ] Access logs monitored
- [ ] Anomaly detection active
- [ ] Regular security audits scheduled
- [ ] Compliance requirements met
- [ ] Data retention policies enforced

## Incident Response

### 1. Detection
```python
# Monitor for suspicious activity
async def detect_suspicious_activity(user_id: str, action: str):
    recent_actions = await get_user_actions(user_id, minutes=5)
    
    if len(recent_actions) > 100:  # Too many requests
        await flag_user(user_id, "Potential abuse")
        await notify_security_team(user_id, action)
```

### 2. Response Plan

1. **Immediate Actions**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IPs
   - Enable emergency mode

2. **Investigation**
   - Review logs
   - Identify attack vector
   - Assess data exposure
   - Document timeline

3. **Recovery**
   - Patch vulnerabilities
   - Restore from backups
   - Reset credentials
   - Update security measures

4. **Post-Incident**
   - Notify affected users
   - Update security policies
   - Conduct retrospective
   - Improve monitoring

### 3. Emergency Contacts

```yaml
# security-contacts.yml
security_team:
  - email: security@company.com
  - phone: +1-xxx-xxx-xxxx
  - slack: #security-incidents

escalation:
  - cto@company.com
  - legal@company.com
```

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.io/docs/guides/platform/security)