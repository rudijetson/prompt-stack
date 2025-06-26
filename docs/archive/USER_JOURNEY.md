# User Journey Guide

## From Demo to Production

This guide walks you through the typical journey from trying out PromptStack to deploying a production application.

## Phase 1: Initial Exploration (Demo Mode)

### What You Get
- Fully functional UI with mock data
- Simulated authentication flow
- Demo AI responses
- Test payment flows
- In-memory vector search

### Getting Started
```bash
# Clone and start
git clone <repository>
cd prompt-stack-skeleton
make dev
```

Visit http://localhost:3000 and explore:
- Sign in with any email (demo auth)
- Test AI chat with various providers
- Try payment flows
- Explore the dashboard

### Key Pages to Visit
1. **Homepage** - Overview and quick links
2. **Dev Guide** (`/dev-guide`) - Complete documentation
3. **Test AI** (`/test-ai`) - Try different AI models
4. **Test API** (`/test-api`) - Check system status

## Phase 2: Adding Authentication

### Why Start Here?
- Most features require user context
- Auth-first security policy for AI usage
- Essential for any real application

### Steps
1. Create a Supabase project at https://supabase.com
2. Add to `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```
3. Add to `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart services: `make restart`

### What Changes
- Real user accounts and sessions
- Persistent user data
- Secure authentication flow
- User profile management

## Phase 3: Enabling AI Features

### Prerequisites
- Authentication must be configured (auth-first policy)
- Choose one or more AI providers

### Provider Setup

#### OpenAI
```env
OPENAI_API_KEY=sk-...
```
Models: gpt-4, gpt-3.5-turbo

#### Anthropic
```env
ANTHROPIC_API_KEY=sk-ant-...
```
Models: claude-3-sonnet, claude-3-haiku

#### Google Gemini
```env
GEMINI_API_KEY=...
```
Models: gemini-2.0-flash, gemini-2.5-pro

#### DeepSeek
```env
DEEPSEEK_API_KEY=...
```
Models: deepseek-chat, deepseek-coder

### Testing AI
1. Sign in with real account
2. Go to `/test-ai`
3. Select a provider and model
4. Send test prompts
5. Monitor usage in provider dashboards

## Phase 4: Adding Payments (Optional)

### Stripe Setup
```env
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Lemon Squeezy Setup
```env
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
```

### Implementation
- Update pricing in `backend/app/core/config.py`
- Customize checkout flow
- Set up webhooks for subscriptions
- Test with provider test modes

## Phase 5: Database & Storage

### PostgreSQL with pgvector
Already configured if using Supabase:
- Vector similarity search
- Full SQL capabilities
- Automatic backups

### File Storage
Supabase Storage is integrated:
- User uploads
- Profile pictures
- Document storage

## Phase 6: Production Deployment

### Environment Setup
1. Set `DEMO_MODE=false` to enforce production mode
2. Configure all required services
3. Set secure secrets
4. Enable HTTPS

### Deployment Options

#### Backend
- **Fly.io**: `fly deploy` from backend/
- **Railway**: Connect GitHub repo
- **Heroku**: Standard Python buildpack
- **AWS/GCP**: Container deployment

#### Frontend
- **Vercel**: Automatic from GitHub
- **Netlify**: Next.js preset
- **Cloudflare Pages**: Next.js compatibility

### Production Checklist
- [ ] All API keys configured
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] CORS origins updated
- [ ] Rate limiting configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] SSL certificates active

## Best Practices

### Security
1. Never commit API keys
2. Use environment variables
3. Enable rate limiting
4. Implement proper CORS
5. Regular security updates

### Development Workflow
1. Develop with mixed mode
2. Test with real services
3. Deploy with production mode
4. Monitor usage and costs

### Cost Management
1. Start with free tiers
2. Set up usage alerts
3. Implement rate limiting
4. Cache AI responses
5. Monitor API usage

## Common Patterns

### Feature Flags
Use capability detection for gradual rollout:
```typescript
if (capabilities.ai === 'production') {
  // Show AI features
}
```

### Graceful Degradation
Handle missing services:
```typescript
try {
  const result = await generateAI(prompt)
} catch (error) {
  // Fall back to simpler feature
}
```

### Progressive Enhancement
Add features as services are configured:
- Basic: Demo mode
- Better: Real auth + demo AI
- Best: All services production

## Troubleshooting

### Nothing Works After Adding Keys
- Restart Docker containers
- Check for typos in env vars
- Verify keys are valid
- Check API endpoint status

### Mixed Mode Confusion
- Use `/api/system/capabilities` to debug
- Check which services are detected
- Ensure auth is configured for AI

### Performance Issues
- Enable caching
- Implement rate limiting
- Use connection pooling
- Monitor API latency

## Next Steps

1. **Build Your Features**: Focus on your unique functionality
2. **Customize UI**: Adapt the design to your brand
3. **Add Domain Logic**: Implement your business rules
4. **Scale Gradually**: Add services as you grow
5. **Monitor Everything**: Track usage, errors, and costs

Remember: PromptStack provides the foundation. Your creativity and domain expertise make it unique!