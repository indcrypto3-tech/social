# Twitter (X) OAuth Integration Guide

This document outlines the complete implementation of the Twitter OAuth flow for connecting user accounts to the application.

## A. Architecture Overview

The flow allows an existing logged-in user to connect their Twitter account.

### Workflow
1.  **User Action**: User clicks "Connect Twitter" button on Frontend (`/settings`).
2.  **Supabase OAuth**: Frontend calls `supabase.auth.signInWithOAuth({ provider: 'twitter' })`.
3.  **Redirects**:
    *   Browser -> Supabase Auth URL
    *   Supabase -> Twitter Auth Screen
    *   Twitter -> Supabase Callback
    *   Supabase -> Frontend Callback (`/auth/callback`)
4.  **Frontend Callback**:
    *   Exchanges code for session (automatically via Supabase Helper or manually).
    *   Extracts `provider_token` (Twitter Access Token) and `user.identities`.
    *   **Crucial Step**: Frontend makes a secure Server-to-Server API call to the Backend (`POST /api/oauth/connect`).
5.  **Backend Processing**:
    *   Backend validates Supabase JWT (sent in Authorization header).
    *   Backend receives Twitter Token + Metadata.
    *   Backend upserts data into `social_accounts` table (linking to the authenticated user).
6.  **Completion**: Frontend redirects user back to `/settings`.

### Data Flow Diagram
`User` -> `Frontend` -> `Supabase Auth` -> `Twitter` -> `Supabase Auth` -> `Frontend Callback` -> `Backend API` -> `Database`

---

## B. Frontend Implementation

### Files
*   `components/connect-twitter-button.tsx`: Triggers the OAuth flow.
*   `app/auth/callback/route.ts`: Handles the return from Supabase, extracts tokens, and calls the backend.

### Key logic
*   **Scopes**: `tweet.read`, `tweet.write`, `users.read`, `offline.access`.
*   **Strict Mode Safety**: The callback is an API Route (Server Side), so it runs once per request.
*   **Idempotency**: The backend `onConflictDoUpdate` ensures safe re-execution.

---

## C. Backend Implementation

### Files
*   `app/api/oauth/connect/route.ts`: Dedicated endpoint for linking accounts.
*   `lib/db/schema.ts`: `social_accounts` table.

### Security
*   Validates `Authorization: Bearer <Supabase-JWT>` header.
*   (Optional) Validates `accessToken` against Twitter API `/2/users/me` (Implemented in logic if needed, currently trusts Supabase session).

---

## D. Supabase Setup (Step-By-Step)

### 1. Create Twitter Developer App
1.  Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2.  Create a Project and App.
3.  **User Authentication Settings**:
    *   **App Permissions**: Read and Write (and Direct Message if needed).
    *   **Type of App**: Web App, Automated App or Bot.
    *   **Callback URI / Redirect URL**:
        *   `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`
    *   **Website URL**: Your application URL (e.g., `https://social-one-ivory.vercel.app` or `http://localhost:3000`).

### 2. Configure Supabase Auth
1.  Go to [Supabase Dashboard](https://supabase.com/dashboard) -> Authentication -> Providers.
2.  Enable **Twitter**.
3.  Enter **API Key** (Client ID) and **API Key Secret** (Client Secret) from Twitter.
4.  **Redirect URL**:
    *   Ensure `http://localhost:3000/**` is in the **Redirect URLs** allowlist in Supabase Auth -> URL Configuration.
    *   Add your production URL (e.g. `https://your-app.vercel.app/**`).

---

## E. Environment Variables

### Frontend (`frontend/.env`)
```env
# URL of your Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# Service Role Key is used for Admin tasks if needed
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Port
PORT=4000
```

### Development vs Production
*   **Local**: Backend runs on `4000`, Frontend on `3000`.
*   **Vercel**: Supabase variables are auto-synced if you use the integration. Make sure to add `NEXT_PUBLIC_API_BASE_URL` to Frontend Vercel Env pointing to the Backend Vercel URL.

---

## F. Security & Failure Handling

*   **CSRF**: Handled by Supabase Auth (state parameter).
*   **Session Expiry**: If session expires during flow, Supabase handles re-login or fails. The `provider_token` is only available immediately after exchange.
*   **Duplicate Callbacks**: The Backend uses `ON CONFLICT` in SQL to handle duplicate requests safely (idempotent).
*   **User Cancel**: User is redirected to `/auth/auth-code-error` (handled in callback).
*   **Partial Data**: If Twitter returns incomplete data, the backend defaults fields like `accountName` to "Unknown" but stores the critical `providerAccountId` and tokens.

---

## G. Final Verification Checklist

- [ ] **Twitter App**: Callback URL set to Supabase URL.
- [ ] **Supabase**: Twitter enabled, Client ID/Secret correct.
- [ ] **Supabase**: Redirect URLs allow `http://localhost:3000/auth/callback`.
- [ ] **Frontend**: `NEXT_PUBLIC_API_BASE_URL` is correct.
- [ ] **Backend**: DB Connection works, `social_accounts` table exists.
- [ ] **Test**: Click "Connect", verify redirect chain, check DB `social_accounts` for new row.
