# Security Guide - Injections & Best Practices

## 🔒 Current Security Status

### ✅ What's Already Secure

1. **Passwords**
   - Never exposed in URLs
   - Sent via POST request body
   - Hashed by Supabase before storage
   - Never logged or stored in plain text

2. **SQL Injection Protection**
   - Supabase uses parameterized queries
   - Row Level Security (RLS) enabled
   - No raw SQL concatenation

3. **XSS (Cross-Site Scripting) Protection**
   - React automatically escapes values
   - Next.js sanitizes output
   - No dangerouslySetInnerHTML usage

4. **Authentication Tokens**
   - JWTs stored in httpOnly cookies
   - Tokens expire and refresh automatically
   - CSRF protection built-in

## 🚨 When to Worry About Injections

### 1. **SQL Injection**
**Risk Areas:**
```typescript
// ❌ DANGEROUS - Never do this
const query = `SELECT * FROM users WHERE email = '${userInput}'`

// ✅ SAFE - Use parameterized queries
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userInput)
```

### 2. **XSS (Cross-Site Scripting)**
**Risk Areas:**
```typescript
// ❌ DANGEROUS - Renders raw HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - React escapes by default
<div>{userInput}</div>
```

### 3. **URL Parameter Injection**
**Risk Areas:**
```typescript
// ❌ DANGEROUS - Direct URL usage
window.location.href = userProvidedURL

// ✅ SAFE - Validate and whitelist
const allowedDomains = ['localhost:3000', 'yourdomain.com']
if (allowedDomains.includes(new URL(url).host)) {
  router.push(url)
}
```

### 4. **Command Injection**
**Risk Areas:**
```typescript
// ❌ DANGEROUS - Never pass user input to exec
exec(`convert ${userFilename} output.pdf`)

// ✅ SAFE - Use libraries with safe APIs
await sharp(userFile).toPdf()
```

## 🛡️ Best Practices

### 1. **Input Validation**
```typescript
// Always validate user input
const emailSchema = z.string().email()
const validated = emailSchema.parse(userInput)
```

### 2. **Output Encoding**
```typescript
// React does this automatically
<p>{userContent}</p> // Safe
```

### 3. **Use Security Headers**
```typescript
// In next.config.js
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]
```

### 4. **Environment Variables**
```bash
# Never commit secrets
SUPABASE_SERVICE_KEY=xxx # Add to .gitignore
```

## 📋 Security Checklist

### Authentication & Authorization
- [ ] Passwords sent via POST, never GET
- [ ] Tokens stored securely (httpOnly cookies)
- [ ] RLS policies enforce authorization
- [ ] Admin routes check user roles

### Input Handling
- [ ] All user inputs validated
- [ ] File uploads restricted by type/size
- [ ] URL parameters sanitized
- [ ] Form data validated before use

### Output Handling
- [ ] No dangerouslySetInnerHTML with user content
- [ ] API responses sanitized
- [ ] Error messages don't leak sensitive info

### Database
- [ ] Use Supabase client (parameterized queries)
- [ ] RLS enabled on all tables
- [ ] No raw SQL with user input
- [ ] Prepared statements only

## 🔍 Common Attack Vectors to Watch

1. **Login Forms**
   - Rate limiting implemented ✅
   - No SQL injection possible ✅
   - Passwords hashed ✅

2. **File Uploads**
   - Validate file types
   - Scan for malware
   - Store outside web root

3. **API Endpoints**
   - Authenticate all requests
   - Validate all inputs
   - Rate limit endpoints

4. **Third-party Libraries**
   - Keep dependencies updated
   - Audit for vulnerabilities
   - Use `npm audit`

## 🚀 Quick Security Wins

1. **Enable Supabase RLS**
   ```sql
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
   ```

2. **Add Rate Limiting**
   ```typescript
   // Already in backend/app/main.py
   limiter = Limiter(key_func=get_remote_address)
   ```

3. **Validate Everything**
   ```typescript
   // Use zod or similar
   const schema = z.object({
     email: z.string().email(),
     age: z.number().min(0).max(150)
   })
   ```

4. **Security Headers**
   - Already configured in Next.js
   - Add CSP for extra protection

## 💡 Remember

- **Never trust user input** - Always validate
- **Defense in depth** - Multiple security layers
- **Least privilege** - Give minimum necessary permissions
- **Keep it updated** - Patch vulnerabilities quickly

Your current setup is secure by default thanks to:
- Supabase's secure authentication
- React's XSS protection
- Next.js security features
- Parameterized database queries

Stay vigilant about user inputs and you'll be fine!