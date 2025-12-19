# Autopostr Backend - Project Structure

**Last Updated**: December 19, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

## Overview

The Autopostr backend is a production-ready Next.js 14 (App Router) application that provides comprehensive social media management capabilities including OAuth integrations, post scheduling, team collaboration, AI-powered content generation, and analytics.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Drizzle ORM)
- **Cache/Queue**: Redis (Upstash recommended)
- **Background Jobs**: BullMQ
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o
- **Payments**: Stripe

## Directory Structure

```
backend/
├── app/
│   └── api/                    # API Routes (Next.js App Router)
│       ├── accounts/           # Connected social accounts management
│       ├── ai/                 # AI-powered features
│       ├── analytics/          # Analytics and metrics
│       ├── auth/               # Authentication endpoints
│       ├── billing/            # Stripe payment integration
│       ├── calendar/           # Calendar view and drag-reschedule
│       ├── cron/               # Maintenance cron jobs
│       ├── dashboard/          # Dashboard data
│       ├── health/             # Health check endpoint
│       ├── invites/            # Team invitations
│       ├── logging/            # Centralized logging
│       ├── media/              # Media library management
│       ├── oauth/              # OAuth provider callbacks
│       ├── posts/              # Post CRUD and scheduling
│       ├── settings/           # User settings
│       ├── team/               # Team management
│       ├── waitlist/           # Waitlist management
│       ├── webhooks/           # External webhooks (Stripe)
│       └── workers/            # Internal worker endpoints
│
├── jobs/                       # Background job definitions
│   ├── analytics-sync.job.ts  # Platform metrics sync
│   ├── media-cleanup.job.ts   # Orphaned media cleanup
│   ├── publishing.queue.ts    # Post publishing queue
│   └── session-cleanup.job.ts # Expired session cleanup
│
├── lib/                        # Shared libraries and utilities
│   ├── ai/                     # AI integration modules
│   │   ├── caption-generator.ts
│   │   ├── content-ideas.ts
│   │   ├── hashtag-generator.ts
│   │   └── openai.ts
│   ├── db/                     # Database configuration
│   │   ├── index.ts            # Drizzle client
│   │   └── schema.ts           # Database schema
│   ├── oauth/                  # OAuth providers
│   │   ├── providers/
│   │   │   ├── facebook.ts
│   │   │   ├── instagram.ts
│   │   │   ├── linkedin.ts
│   │   │   └── twitter.ts
│   │   ├── storage.ts          # Token storage
│   │   └── types.ts            # OAuth interfaces
│   ├── social/                 # Platform publishers
│   │   ├── facebook.ts
│   │   ├── instagram.ts
│   │   ├── linkedin.ts
│   │   └── twitter.ts
│   ├── storage/                # File storage (Supabase)
│   │   └── index.ts
│   ├── supabase/               # Supabase client
│   │   └── server.ts
│   ├── crypto.ts               # Encryption utilities
│   ├── env.ts                  # Environment validation
│   ├── errors.ts               # Custom error classes
│   ├── logger.ts               # Structured logging
│   ├── permissions.ts          # Role-based permissions
│   ├── rate-limit.ts           # Rate limiting
│   ├── redis.ts                # Redis client
│   └── session.ts              # Session management
│
├── middleware/                 # Express-style middleware
│   ├── auth.ts                 # Authentication middleware
│   ├── error.ts                # Error handling
│   └── session-guard.ts        # Session validation
│
├── docs/                       # Documentation
│   ├── API_DOCUMENTATION.md    # Complete API reference
│   ├── CHANGELOG.md            # Version history
│   └── STRUCTURE.md            # This file
│
├── instrumentation.ts          # Next.js boot-time validation
├── .env.example                # Environment template
├── ENV_SETUP.md                # Environment setup guide
├── ENV_REFERENCE.md            # Environment variables reference
├── changes.sql                 # Database migrations
└── package.json                # Dependencies

```

## Core Features

### 1. Authentication & Sessions
- **Supabase Auth**: Email/password authentication
- **PostgreSQL Sessions**: Server-side session storage
- **Session Cleanup**: Automatic expired session removal
- **Refresh Tokens**: Automatic session extension

### 2. OAuth Integrations
- **Facebook**: Pages and Instagram Business accounts
- **Instagram**: Content publishing via Facebook Graph API
- **LinkedIn**: Personal and organization posting
- **Twitter/X**: OAuth 2.0 with PKCE
- **Token Encryption**: AES-256-GCM encryption at rest
- **Auto-Refresh**: Background token refresh job

### 3. Post Management
- **CRUD Operations**: Create, read, update, delete posts
- **Scheduling**: Future post scheduling with BullMQ
- **Multi-Platform**: Publish to multiple platforms simultaneously
- **Media Support**: Images and videos via Supabase Storage
- **Draft/Scheduled/Published**: Complete post lifecycle
- **Approval Workflows**: Team approval before publishing

### 4. Team Collaboration
- **Team Management**: Create and manage teams
- **Role-Based Access**: Owner, Editor, Viewer roles
- **Invitations**: Email-based team invites
- **Approval Workflows**: Post approval before publishing
- **Permissions**: Granular permission system

### 5. Media Library
- **Upload**: File upload with validation
- **Storage**: Supabase Storage integration
- **Cleanup**: Automatic orphaned media removal
- **Validation**: File type and size limits

### 6. AI Features
- **Caption Generation**: GPT-4o powered captions
- **Hashtag Suggestions**: AI-generated hashtags
- **Content Improvement**: Caption enhancement
- **Rate Limiting**: 10 requests/minute per user

### 7. Analytics
- **Overview**: Dashboard metrics and KPIs
- **Post Analytics**: Per-post engagement metrics
- **Account Analytics**: Per-platform performance
- **Background Sync**: Automatic metrics sync every 6 hours
- **Historical Data**: Daily snapshots for trend analysis

### 8. Reliability
- **Health Checks**: Database, Redis, environment validation
- **Structured Logging**: JSON logs with context
- **Error Tracking**: Sentry integration ready
- **Cron Jobs**: Automated maintenance tasks
- **Rate Limiting**: Redis-based rate limiting

## Database Schema

### Core Tables
- `users`: User accounts (Supabase Auth)
- `sessions`: Server-side sessions
- `social_accounts`: Connected OAuth accounts
- `scheduled_posts`: Posts and scheduling
- `post_destinations`: Platform-specific post targets
- `media_library`: Uploaded media files
- `publish_logs`: Publishing history

### Team Tables
- `teams`: Team definitions
- `team_members`: Team membership
- `team_invites`: Pending invitations

### Analytics Tables
- `analytics_snapshots`: Historical metrics

## API Architecture

### Route Organization
```
/api
├── /auth               # Authentication
├── /accounts           # Social account management
├── /posts              # Post CRUD and scheduling
├── /team               # Team management
├── /media              # Media library
├── /ai                 # AI features
├── /analytics          # Analytics and reporting
├── /calendar           # Calendar views
├── /health             # Health monitoring
├── /logging            # Centralized logging
├── /cron               # Maintenance jobs
└── /workers            # Internal workers
```

### Authentication Flow
1. User signs in via Supabase Auth
2. Backend creates server-side session
3. Session stored in PostgreSQL
4. HttpOnly cookie sent to client
5. All requests validated via session

### OAuth Flow
1. User initiates OAuth via `/api/oauth/{provider}/start`
2. Redirected to provider authorization
3. Provider redirects to `/api/oauth/{provider}/callback`
4. Backend exchanges code for tokens
5. Tokens encrypted and stored in database
6. User redirected to dashboard

### Publishing Flow
1. User creates post via `/api/posts`
2. User schedules via `/api/posts/{id}/schedule`
3. BullMQ job created with delay
4. Worker calls `/api/workers/execute-post`
5. Platform-specific publisher called
6. Results logged and status updated

## Security

### Token Encryption
- **Algorithm**: AES-256-GCM
- **Key**: 32-byte encryption key from env
- **Storage**: Encrypted tokens in database
- **Decryption**: Only when needed for API calls

### Session Security
- **HttpOnly Cookies**: Prevent XSS attacks
- **Server-Side Storage**: PostgreSQL sessions
- **Expiration**: Configurable TTL (default 7 days)
- **Cleanup**: Automatic expired session removal

### API Security
- **Authentication**: Required for all user endpoints
- **Authorization**: Ownership checks on resources
- **Rate Limiting**: Redis-based per-user limits
- **Worker Auth**: Bearer token for internal endpoints
- **Cron Auth**: Separate secret for cron jobs

## Environment Variables

See [ENV_REFERENCE.md](./ENV_REFERENCE.md) for complete list.

### Required
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis/Upstash connection
- `SUPABASE_*`: Authentication keys
- `ENCRYPTION_KEY`: Token encryption
- `WORKER_SECRET`: Worker authentication

### Optional
- OAuth provider credentials
- `OPENAI_API_KEY`: AI features
- `STRIPE_SECRET_KEY`: Payments
- `SENTRY_DSN`: Error monitoring

## Development

### Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in required values
# See ENV_SETUP.md for details

# Run development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

### Database Migrations
```bash
# Apply migrations
psql $DATABASE_URL < changes.sql

# Or use Drizzle Kit
npx drizzle-kit push:pg
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add ENCRYPTION_KEY production
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Setup
1. Set all required environment variables
2. Configure Upstash Redis
3. Set up Supabase project
4. Configure OAuth apps
5. Set cron jobs for maintenance

## Monitoring

### Health Check
```bash
curl https://api.autopostr.com/api/health
```

### Logs
- Structured JSON logs
- Sentry for errors (when configured)
- CloudWatch/DataDog integration ready

### Metrics
- Request/response times
- Error rates
- Queue depths
- Database connection pool

## Support

- **Documentation**: See `/docs` directory
- **API Reference**: [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)
- **Changelog**: [CHANGELOG.md](./docs/CHANGELOG.md)
- **Issues**: GitHub Issues

## License

Proprietary - All Rights Reserved
