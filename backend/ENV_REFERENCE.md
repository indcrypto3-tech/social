# Environment Variables Reference

Complete list of all environment variables used in Autopostr backend.

## Status Legend
- ✅ **Required**: Must be set for app to start
- ⚠️ **Recommended**: Optional but needed for specific features
- 📝 **Optional**: Nice to have, has defaults

---

## Core Application

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `PORT` | 📝 | `4000` | Server port |
| `NODE_ENV` | 📝 | `development` | Environment mode |
| `NEXT_PUBLIC_APP_URL` | ✅ | - | Public application URL |

---

## Database & Storage

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string |
| `REDIS_URL` | ✅ | - | Redis connection string (Upstash recommended) |

---

## Authentication (Supabase)

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | - | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | - | Supabase anonymous key (public) |
| `SUPABASE_URL` | ✅ | - | Supabase project URL (server) |
| `SUPABASE_ANON_KEY` | ✅ | - | Supabase anonymous key (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | - | Supabase service role key (private) |

---

## Security & Sessions

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `ENCRYPTION_KEY` | ✅ | - | 32-byte key for token encryption |
| `WORKER_SECRET` | ✅ | - | Secret for worker authentication |
| `CRON_SECRET` | ⚠️ | `WORKER_SECRET` | Secret for cron job authentication |
| `SESSION_TTL_HOURS` | 📝 | `168` | Session expiry in hours (7 days) |

---

## OAuth - Facebook / Instagram

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `FACEBOOK_APP_ID` | ⚠️ | - | Facebook App ID |
| `FACEBOOK_APP_SECRET` | ⚠️ | - | Facebook App Secret |
| `FACEBOOK_CALLBACK_URL` | ⚠️ | - | OAuth callback URL |

**Required Permissions**: `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`

---

## OAuth - LinkedIn

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `LINKEDIN_CLIENT_ID` | ⚠️ | - | LinkedIn Client ID |
| `LINKEDIN_CLIENT_SECRET` | ⚠️ | - | LinkedIn Client Secret |
| `LINKEDIN_CALLBACK_URL` | ⚠️ | - | OAuth callback URL |

**Required Scopes**: `r_liteprofile`, `r_emailaddress`, `w_member_social`

---

## OAuth - Twitter / X

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `X_CLIENT_ID` | ⚠️ | - | Twitter/X Client ID |
| `X_CLIENT_SECRET` | ⚠️ | - | Twitter/X Client Secret |
| `X_CALLBACK_URL` | ⚠️ | - | OAuth callback URL |

**Required Scopes**: `tweet.read`, `tweet.write`, `users.read`, `offline.access`

---

## AI Features (OpenAI)

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `OPENAI_API_KEY` | ⚠️ | - | OpenAI API key for GPT-4o |
| `AI_RATE_LIMIT_PER_MINUTE` | 📝 | `10` | Rate limit for AI endpoints |
| `ENABLE_AI_FEATURES` | 📝 | `true` | Enable/disable AI features |

**Used For**: Caption generation, hashtag suggestions, content improvement

---

## Payments (Stripe)

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `STRIPE_SECRET_KEY` | ⚠️ | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | - | Stripe webhook signing secret |

---

## Monitoring & Logging

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `SENTRY_DSN` | 📝 | - | Sentry error tracking DSN |
| `DEBUG` | 📝 | `false` | Enable debug logging |

---

## Feature Flags

| Variable | Status | Default | Description |
|----------|--------|---------|-------------|
| `ENABLE_AI_FEATURES` | 📝 | `true` | Enable AI caption/hashtag features |
| `ENABLE_ANALYTICS_SYNC` | 📝 | `true` | Enable background analytics sync |
| `ENABLE_MEDIA_CLEANUP` | 📝 | `true` | Enable automatic media cleanup |

---

## Quick Setup Commands

### Generate Security Keys
```bash
# Encryption key (32 bytes)
openssl rand -hex 32

# Worker secret
openssl rand -hex 32

# Cron secret
openssl rand -hex 32
```

### Copy Environment Template
```bash
cp .env.example .env
```

### Validate Configuration
```bash
npm run dev
```

---

## Environment-Specific Examples

### Local Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=http://localhost:4000
DEBUG=true
```

### Production (Vercel/Railway/Render)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod.supabase.co:5432/postgres
REDIS_URL=rediss://default:xxxxx@xxxxx.upstash.io:6379
NEXT_PUBLIC_APP_URL=https://api.autopostr.com
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Validation Errors

The app validates environment variables on startup. Common errors:

### Missing Required Variable
```
❌ ENVIRONMENT VALIDATION FAILED
  • Missing required environment variable: DATABASE_URL
```
**Fix**: Add the variable to your `.env` file

### Invalid URL Format
```
❌ ENVIRONMENT VALIDATION FAILED
  • Invalid URL format for REDIS_URL: localhost:6379
```
**Fix**: Add protocol (`redis://localhost:6379`)

### Incomplete OAuth Configuration
```
⚠️  ENVIRONMENT WARNINGS
  • Incomplete Facebook OAuth configuration. Missing: FACEBOOK_APP_SECRET
```
**Fix**: Add all required OAuth variables or remove partial configuration

---

## Security Checklist

- [ ] Never commit `.env` files to git
- [ ] Use different keys for dev/staging/production
- [ ] Rotate `ENCRYPTION_KEY` every 90 days
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` private
- [ ] Use Upstash Redis for production (not local Redis)
- [ ] Enable Sentry in production
- [ ] Use strong, random secrets (32+ characters)
- [ ] Limit access to production environment variables
- [ ] Monitor for leaked secrets in commits

---

## Support

For detailed setup instructions, see [ENV_SETUP.md](./ENV_SETUP.md)
