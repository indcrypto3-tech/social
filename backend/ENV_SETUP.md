# Environment Configuration Guide

This guide explains how to set up environment variables for the Autopostr backend.

## Quick Start

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in required values** (see sections below)

3. **Validate configuration**:
   ```bash
   npm run dev
   ```
   The app will validate all environment variables on startup.

## Required Variables

### Database
```env
DATABASE_URL=postgresql://user:password@host:port/database
```
- **Local**: Use Supabase local instance or PostgreSQL
- **Production**: Use hosted PostgreSQL (Supabase, Neon, Railway, etc.)

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Get from: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API
- **ANON_KEY**: Public key for client-side auth
- **SERVICE_ROLE_KEY**: Private key for server-side operations (never expose!)

### Redis (Upstash)
```env
REDIS_URL=rediss://default:xxxxx@xxxxx.upstash.io:6379
```
- **Production**: Use [Upstash Redis](https://console.upstash.com/)
- **Local**: `redis://localhost:6379` (requires Redis installed)

### Security Keys
```env
ENCRYPTION_KEY=your-32-byte-encryption-key
WORKER_SECRET=your-worker-secret
CRON_SECRET=your-cron-secret
```

**Generate secure keys**:
```bash
# Encryption key (32 bytes)
openssl rand -hex 32

# Worker secret
openssl rand -hex 32

# Cron secret
openssl rand -hex 32
```

### Application URL
```env
NEXT_PUBLIC_APP_URL=http://localhost:4000
```
- **Local**: `http://localhost:4000`
- **Production**: Your deployed URL (e.g., `https://api.autopostr.com`)

## OAuth Configuration

### Facebook / Instagram

1. **Create App**: [Facebook Developers](https://developers.facebook.com/apps/)
2. **Add Products**: Facebook Login, Instagram Basic Display
3. **Configure**:
   ```env
   FACEBOOK_APP_ID=123456789012345
   FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
   FACEBOOK_CALLBACK_URL=http://localhost:4000/api/oauth/facebook/callback
   ```
4. **Required Permissions**:
   - `pages_show_list`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`

### LinkedIn

1. **Create App**: [LinkedIn Developers](https://www.linkedin.com/developers/apps/)
2. **Add Products**: Sign In with LinkedIn, Share on LinkedIn
3. **Configure**:
   ```env
   LINKEDIN_CLIENT_ID=abcdef123456
   LINKEDIN_CLIENT_SECRET=AbCdEf123456
   LINKEDIN_CALLBACK_URL=http://localhost:4000/api/oauth/linkedin/callback
   ```
4. **Required Scopes**:
   - `r_liteprofile`
   - `r_emailaddress`
   - `w_member_social`

### Twitter / X

1. **Create App**: [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. **Enable OAuth 2.0**
3. **Configure**:
   ```env
   X_CLIENT_ID=your-client-id
   X_CLIENT_SECRET=your-client-secret
   X_CALLBACK_URL=http://localhost:4000/api/oauth/twitter/callback
   ```
4. **Required Scopes**:
   - `tweet.read`
   - `tweet.write`
   - `users.read`
   - `offline.access`

## Optional Services

### OpenAI (AI Features)
```env
OPENAI_API_KEY=sk-proj-xxxxx
```
- Get from: [OpenAI Platform](https://platform.openai.com/api-keys)
- Used for: Caption generation, hashtag suggestions, content improvement
- **Cost**: Pay-per-use (GPT-4o recommended)

### Stripe (Payments)
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```
- Get from: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Test Mode**: Use `sk_test_` keys for development
- **Live Mode**: Use `sk_live_` keys for production

### Sentry (Error Monitoring)
```env
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```
- Get from: [Sentry.io](https://sentry.io/)
- Optional but highly recommended for production

## Environment-Specific Configurations

### Development (.env.local)
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=http://localhost:4000
DEBUG=true
```

### Production (.env.production)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.supabase.co:5432/postgres
REDIS_URL=rediss://default:xxxxx@xxxxx.upstash.io:6379
NEXT_PUBLIC_APP_URL=https://api.autopostr.com
ENABLE_AI_FEATURES=true
ENABLE_ANALYTICS_SYNC=true
```

## Validation

The app automatically validates environment variables on startup:

✅ **Success**: All required variables present
```
✅ Environment validation passed
```

❌ **Error**: Missing required variables
```
❌ ENVIRONMENT VALIDATION FAILED
  • Missing required environment variable: DATABASE_URL
  • Missing required environment variable: ENCRYPTION_KEY
```

⚠️ **Warning**: Missing optional variables
```
⚠️  ENVIRONMENT WARNINGS
  • Optional variable not set: OPENAI_API_KEY
  • Incomplete Facebook OAuth configuration
```

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use different keys** for development and production
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Use environment-specific values** (don't reuse production keys in dev)
5. **Encrypt sensitive values** in CI/CD pipelines
6. **Limit access** to production environment variables
7. **Monitor for leaked secrets** using tools like GitGuardian

## Troubleshooting

### "Missing required environment variable"
- Ensure `.env` file exists in the backend directory
- Check variable name spelling (case-sensitive)
- Verify no extra spaces around `=` sign

### "Invalid URL format"
- URLs must include protocol (`http://` or `https://`)
- Redis URLs use `redis://` or `rediss://` (SSL)
- No trailing slashes in URLs

### "ENCRYPTION_KEY must be at least 32 characters"
- Generate a new key: `openssl rand -hex 32`
- Use the full output (64 characters)

### OAuth callback errors
- Ensure callback URLs match exactly in provider settings
- Include protocol and port for local development
- Update URLs when deploying to production

## Support

For issues or questions:
- Check [Documentation](../docs/)
- Review [Backend API Docs](../docs/BACKEND_API.md)
- Open an issue on GitHub
