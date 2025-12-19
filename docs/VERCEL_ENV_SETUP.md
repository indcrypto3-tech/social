# Vercel Environment Variables Setup

## Backend Environment Variables

Go to your Vercel project → Settings → Environment Variables and add the following:

### ✅ Already Added by Supabase Integration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (backend only)
- `DATABASE_URL` - PostgreSQL connection string

### 🔧 Additional Variables You Need to Add

#### Required for Backend:
```bash
# Port (optional, Vercel handles this)
PORT=4000

# Redis (if using Redis for queues)
REDIS_URL=your-redis-url

# Stripe (for billing)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# X (Twitter) OAuth
X_CLIENT_ID=your-x-client-id
X_CLIENT_SECRET=your-x-client-secret
X_BEARER_TOKEN=your-x-bearer-token
X_CALLBACK_URL=https://your-backend-domain.vercel.app/api/auth/callback/twitter

# Optional: Sentry (for error monitoring)
SENTRY_DSN=your-sentry-dsn
```

---

## Frontend Environment Variables

### ✅ Already Added by Supabase Integration
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 🔧 Additional Variables You Need to Add

```bash
# Backend API URL (IMPORTANT!)
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.vercel.app/api

# X (Twitter) OAuth Callback
NEXT_PUBLIC_X_CALLBACK_URL=https://your-backend-domain.vercel.app/api/auth/callback/twitter
```

---

## 🚀 Deployment Setup

### Step 1: Deploy Backend First
1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Set **Root Directory** to `backend`
4. Add all backend environment variables listed above
5. Deploy

### Step 2: Deploy Frontend
1. Import the same GitHub repository (or create a new project)
2. Set **Root Directory** to `frontend`
3. Add frontend environment variables
4. **IMPORTANT**: Update `NEXT_PUBLIC_API_BASE_URL` with your backend Vercel URL
5. Deploy

### Step 3: Update Callback URLs
After both are deployed, update these URLs:

1. **X Developer Portal**:
   - Update callback URL to: `https://your-backend-domain.vercel.app/api/auth/callback/twitter`

2. **Stripe Dashboard**:
   - Update webhook URL to: `https://your-backend-domain.vercel.app/api/webhooks/stripe`

---

## 🔄 Database Migrations

After deployment, you need to run database migrations:

### Option 1: Using Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Run your migration files manually

### Option 2: Using Drizzle Kit (Recommended)
```bash
# Install Drizzle Kit globally
npm install -g drizzle-kit

# Push schema to database
drizzle-kit push:pg --config=drizzle.config.ts
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend is accessible at `https://your-backend-domain.vercel.app`
- [ ] Frontend is accessible at `https://your-frontend-domain.vercel.app`
- [ ] Frontend can connect to backend API
- [ ] Supabase authentication works
- [ ] Database connection is successful
- [ ] Environment variables are properly set

---

## 🐛 Troubleshooting

### CORS Errors
If you get CORS errors, add this to your backend `middleware.ts`:

```typescript
export const config = {
  matcher: '/api/:path*',
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', 'https://your-frontend-domain.vercel.app');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
```

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if Supabase allows connections from Vercel IPs
- Ensure connection pooling is enabled

### Environment Variables Not Working
- Make sure to redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- For `NEXT_PUBLIC_*` variables, they must be set at build time

---

## 📝 Notes

1. **Separate Deployments**: Backend and frontend should be separate Vercel projects
2. **Environment Scopes**: Set variables for Production, Preview, and Development as needed
3. **Secrets**: Never commit `.env` files to Git
4. **Updates**: After changing environment variables, trigger a new deployment

---

## 🔗 Useful Links

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Vercel Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
