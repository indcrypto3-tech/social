# Supabase Setup Guide

This guide explains how to set up the Supabase backend for both Local Development and Production environments.

---

## 1. Local Development Support

We use the [Supabase CLI](https://supabase.com/docs/guides/cli) to run a full Supabase stack locally on your machine. This includes Postgres, Auth, Storage, and Realtime.

### Prerequisites
*   Docker Desktop (must be running)
*   Node.js & NPM

### Initial Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Supabase:**
    Run the following command to pull the docker images and start the services:
    ```bash
    npx supabase start
    ```

3.  **Access Local Studio:**
    Once running, you can access the Supabase Dashboard locally at:
    *   **Dashboard:** [http://127.0.0.1:54323](http://127.0.0.1:54323)
    *   **Default Database Password:** `postgres` (or as configured in config.toml)

4.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (copy from `.env.example` if available) and add the local keys output by the `start` command:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-local-anon-key>
    DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
    ```
    *Note: The `DATABASE_URL` port is usually `54322` for the connection pooler or direct DB access.*

5.  **Database & Schema:**
    We use Drizzle ORM to manage the database schema.
    *   **Push Schema:** Apply the schema defined in `lib/db/schema.ts` to your local database:
        ```bash
        npm run db:push
        ```
    *   **View Data:** You can use `npx drizzle-kit studio` or the Supabase Local Studio to view data.

6.  **Storage Setup:**
    The application requires a storage bucket named `media`.
    *   Go to **Local Studio** > **Storage**.
    *   Create a new bucket named **`media`**.
    *   Set it to **Public**.
    *   **Policies:** Add a policy to allow Authenticated users to INSERT (upload) and SELECT (view). (Or for dev simplified: allow ALL for authenticated).

---

## 2. Production Environment (Supabase Cloud)

For production, you will create a hosted project on [supabase.com](https://supabase.com).

### Step 1: Create Project
1.  Log in to Supabase and create a new project.
2.  Set a strong database password and save it securely.
3.  Wait for the database to provision.

### Step 2: Get Credentials
1.  Go to **Project Settings** > **API**.
2.  Copy the **Project URL** and **anon public key**.
3.  Go to **Project Settings** > **Database** > **Connection parameters**.
4.  Copy the **Connection String (URI)**. *Remember to replace `[YOUR-PASSWORD]` with your actual password.*

### Step 3: Configure Hosting (e.g., Vercel)
Add the following Environment Variables to your hosting provider:

*   `NEXT_PUBLIC_SUPABASE_URL`: Your production Project URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your production Anon Key.
*   `DATABASE_URL`: Your production Connection String (use the Transaction Pooler, port 6543, for serverless envs like Vercel).

### Step 4: Deploy Database Schema
You need to push your local Drizzle schema to the production database.
1.  Temporarily update your local `.env` with the **Production** `DATABASE_URL`.
2.  Run:
    ```bash
    npm run db:push
    ```
3.  *Revert your local `.env` to the local development URL afterwards.*

### Step 5: Configure Auth
1.  Go to **Authentication** > **URL Configuration**.
2.  **Site URL:** Set this to your production domain (e.g., `https://your-app.vercel.app`).
3.  **Redirect URLs:** Add your callback URL:
    *   `https://your-app.vercel.app/auth/callback`
    *   `https://your-app.vercel.app/**` (Wildcard if needed)
4.  **Social Providers:** Configure Facebook, Twitter, etc., using the production keys and properly updated Redirect callback URLs.

### Step 6: Configure Storage
1.  Go to **Storage** in the Production Dashboard.
2.  Create a new bucket named **`media`**.
3.  Set it to **Public**.
4.  **Add RLS Policies:**
    *   **SELECT:** Enable for `public` role (Allow anyone to view).
    *   **INSERT:** Enable for `authenticated` role (Allow logged-in users to upload).
    *   **DELETE:** Enable for `authenticated` role (Allow users to delete their own files - generally requires row-level check `auth.uid() = owner_id`, but basic auth check is a good start).

---

## Troubleshooting

*   **Connection Refused:** Ensure Docker is running for local dev.
*   **RLS Errors:** Check your Storage Policies. If an upload fails with 403, you likely missed adding the INSERT policy.
*   **Auth Redirects:** Ensure your `Site URL` and `Redirect URIs` match exactly what is in your browser address bar.
