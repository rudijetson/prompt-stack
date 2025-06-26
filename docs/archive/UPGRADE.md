# Upgrade Guide

This guide helps you upgrade between versions of Prompt-Stack.

## General Upgrade Process

1. **Check the [CHANGELOG](../CHANGELOG.md)** for breaking changes
2. **Backup your environment files** before upgrading
3. **Pull the latest changes**
4. **Run the setup script** if there are new dependencies
5. **Restart your containers** with full rebuild:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Version-Specific Guides

### Upgrading to 1.0.0 (from pre-release)

If you're using a pre-1.0 version:

1. **Database Changes**:
   - New migrations system in `supabase/migrations/`
   - Run `make db-setup` to apply migrations
   - No breaking changes to existing tables

2. **Environment Variables**:
   - No changes required
   - New optional variables can be added later

3. **CI/CD**:
   - GitHub Actions now included
   - No action required unless you want to use it

### Future Versions

Breaking changes will be documented here with clear migration paths.

## Common Issues

**Docker containers won't start after upgrade**:
- Clear volumes: `docker-compose down -v`
- Rebuild: `docker-compose build --no-cache`

**New features not working**:
- Check if new environment variables are required
- Run diagnostics: `./scripts/diagnose.sh`

**Database migrations fail**:
- Ensure Supabase credentials are correct
- Check migration files for syntax errors
- Try applying manually via Supabase dashboard

## Rollback Process

If you need to rollback:

1. Note your current git commit: `git rev-parse HEAD`
2. Rollback code: `git checkout <previous-version-tag>`
3. Restore environment files from backup
4. Rebuild containers: `docker-compose build --no-cache`
5. Start services: `docker-compose up -d`

## Getting Help

- Check the [documentation](../README.md)
- Review [common issues](https://github.com/yourusername/prompt-stack/issues)
- Ask in discussions