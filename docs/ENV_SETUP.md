# Environment Setup Guide

This guide details the Environment Variables required to run the application in both Local Development and Production environments.

> **Important:** Never commit your `.env` file to version control (Git). It contains sensitive secrets.

---

## 1. Local Development (`.env`)

Create a file named `.env` in the root of your project.

```ini
# --- Database (Drizzle ORM) ---
# Connection string for your local Postgres database.
# If using Supabase Local CLI, typically usually port 54322.
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# --- Supabase (Auth & Storage) ---
# These keys are generated when you run `npx supabase start`.
# You can find them in the terminal output of the start command.
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-local-timestamp-generated-anon-key>"

# --- Redis (Background Worker) ---
# Used by BullMQ for job queues.
# If running Redis locally via Docker or native install.
REDIS_HOST="localhost"
REDIS_PORT="6379"
# REDIS_PASSWORD="" # Optional, if you have set one

# --- App URL ---
# The base URL of your application. Used for absolute links/callbacks.
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 2. Production Environment

When deploying to a provider like Vercel, Netlify, or configuring a VPS, you must set these variables in the platform's "Environment Variables" settings.

```ini
# --- Database (Drizzle ORM) ---
# Your production Postgres connection string.
# Recommended: Use the Transaction Pooler (port 6543) for serverless environments (Vercel).
# Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DATABASE_URL="postgresql://postgres:[password]@..."

# --- Supabase (Auth & Storage) ---
# Retrieve these from your Supabase Project Dashboard > Settings > API.
NEXT_PUBLIC_SUPABASE_URL="https://[your-project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-production-anon-key]"

# --- Redis (Background Worker) ---
# You need a hosted Redis instance (e.g., Upstash, Railway, or managed Redis).
REDIS_HOST="[your-redis-host]"
REDIS_PORT="[your-redis-port-usually-6379-or-tls-port]"
REDIS_PASSWORD="[your-redis-password]"
# If using TLS (rediss://), ensure your worker connection logic supports it (usually just standard config).

# --- App URL ---
# Your production domain.
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

---

## Variable Descriptions

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | The PostgreSQL connection string used by Drizzle ORM to perform migrations and queries. Isolate user/password credentials here. |
| `NEXT_PUBLIC_SUPABASE_URL` | The REST API URL for your Supabase project. Exposed to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The "Public" API key for Supabase. Safe to expose to the browser if RLS policies are set correctly. |
| `REDIS_HOST` | Hostname/IP of your Redis server (required for scheduling queues). |
| `REDIS_PORT` | Port for Redis (Default: 6379). |
| `REDIS_PASSWORD` | Password for Redis authentication (if enabled). |
