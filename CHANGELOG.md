# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Prompt-Stack skeleton
- Next.js 15 frontend with TypeScript
- FastAPI backend with async support
- Demo mode - works without any API keys
- Authentication system (Supabase + Demo auth)
- Multi-provider AI support (OpenAI, Anthropic, Gemini, DeepSeek)
- Payment integration (Stripe & Lemon Squeezy)
- Vector search capabilities
- Docker Compose development environment
- Comprehensive health checks and diagnostics
- Rate limiting (10/min demo, 30/min authenticated)
- CORS configuration for local development
- API documentation with Swagger UI
- Example pages and components
- Centralized feature configuration
- Environment variable validation
- Quick setup script (3-minute setup)

### Security
- Environment variables properly isolated
- Secure authentication flow
- API key validation
- Rate limiting protection

## [1.0.0] - Coming Soon

### Planned
- Production deployment guides
- Advanced monitoring setup
- Team collaboration features
- Enhanced vector search
- More AI provider integrations

---

For upgrade guides and breaking changes, see [docs/UPGRADE.md](docs/UPGRADE.md)