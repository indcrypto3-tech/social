# Project Structure

This document provides a detailed overview of the Social Media Scheduler codebase structure, organized by directory and file purpose.

## Root Directory

### `package.json`
*   **Path:** `./package.json`
*   **Details:** The project manifest file. Lists all dependencies (dependencies) and devDependencies (build tools). Defines npm scripts for development (`npm run dev`), building (`npm run build`), database management (`npm run db:push`), and running the worker (`npm run worker`).

### `middleware.ts`
*   **Path:** `./middleware.ts`
*   **Details:** Next.js Middleware that runs on every request. It is primarily used to refresh Supabase Auth sessions, ensuring that the user's session remains active and valid as they navigate the application.

### `next.config.mjs`
*   **Path:** `./next.config.mjs`
*   **Details:** Configuration file for Next.js.
    *   **Configured:** `images.remotePatterns` allow loading images from Supabase Storage and localhost.

### `drizzle.config.ts`
*   **Path:** `./drizzle.config.ts`
*   **Details:** Configuration for Drizzle Kit. Specifies where the schema is located (`lib/db/schema.ts`), the output directory for migrations, and the database connection credentials.

### `tailwind.config.ts`
*   **Path:** `./tailwind.config.ts`
*   **Details:** Configuration for Tailwind CSS. Includes paths to analyze for class usage, theme extensions (colors, radius, animations), and `shadcn/ui` plugin integration.

### `.env`
*   **Path:** `./.env`
*   **Details:** Environment variables file. Stores sensitive information like `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and Redis connection details. (Not committed to git).

---

## App Directory (`app/`)
The main application code using Next.js App Router.

### `app/layout.tsx`
*   **Path:** `app/layout.tsx`
*   **Details:** The root layout file. It wraps the entire application with global providers (like `ThemeProvider` or `Toaster`). Contains the `<html>` and `<body>` tags.

### `app/globals.css`
*   **Path:** `app/globals.css`
*   **Details:** Global CSS file. Includes Tailwind directives and defines CSS variables for the color system (supporting light/dark modes).

### `app/auth/callback/route.ts`
*   **Path:** `app/auth/callback/route.ts`
*   **Details:** API Route Handler for OAuth callbacks.
    *   **Function:** Accepts the `code` from Supabase Auth after a social login.
    *   **Logic:** Exchanges the code for a session.
    *   **Crucial:** Upserts the connected account's tokens into the `social_accounts` table.

### `app/(auth)/`
Route group for authentication pages.

*   **`login/page.tsx`**: Login page UI.
*   **`register/page.tsx`**: Registration page UI.
*   **`actions.ts`**: Server Actions for handling login (`login`) and signup (`signup`) logic. Includes logic to sync new users to the `public.users` table.

### `app/(dashboard)/`
Route group for the main application dashboard (protected routes).

*   **`layout.tsx`**: Dashboard layout. Includes the `Sidebar` and `Header` components.
*   **`components/sidebar.tsx`**: Navigation sidebar component.
*   **`dashboard/page.tsx`**: Main dashboard landing page.
*   **`accounts/page.tsx`**: "Accounts" page. Lists connected social accounts and provides a dialog to connect new ones.
*   **`accounts/actions.ts`**: Server Actions for initiating the OAuth connection flow (`connectSocialAccount`).
*   **`media/page.tsx`**: "Media Library" page. Displays gallery of uploaded images.
*   **`media/actions.ts`**: Server Actions for uploading files (`uploadMedia`) to Supabase Storage and saving metadata to the DB. Also handles deletion.
*   **`composer/page.tsx`**: "Create Post" page. A UI text editor with preview, media selection, and account targeting.
*   **`composer/actions.ts`**: Server Action (`createPost`) to save a scheduled post to the DB and add a job to the BullMQ queue.
*   **`calendar/page.tsx`**: "Calendar" page. Displays scheduled posts in a month-view grid.
*   **`calendar/calendar-view.tsx`**: Client component for the calendar grid UI interaction.
*   **`posts/actions.ts`**: CRUD Server Actions for scheduled posts (Read, Update, Delete).
*   **`settings/page.tsx`**: "Settings" page. User profile, notifications, billing (mock), and team (UI only).
*   **`settings/settings-client.tsx`**: Client component managing the tabbed settings interface with animations.
*   **`settings/actions.ts`**: Server Actions for updating profile (`updateProfile`, `deleteAccount`) and notification preferences (`updateNotificationPreferences`).
*   **`settings/components/`**: Directory containing sub-section components (`profile-settings`, `notification-settings`, `billing-settings`, `team-settings`, `danger-zone`).
*   **`api/billing/portal/route.ts`**: API Route handler for redirecting to Stripe billing portal (mocked integration).

---

## Library Directory (`lib/`)
Shared utilities and configurations.

### `lib/db/`
*   **`index.ts`**: Initializes the Drizzle ORM client connection to Postgres.
*   **`schema.ts`**: Defines the database schema.
    *   **Tables:** `users`, `social_accounts`, `scheduled_posts`, `post_destinations`, `media_library`.
    *   **Relations:** Defines how tables link to each other.

### `lib/supabase/`
Supabase client configurations using `@supabase/ssr`.
*   **`client.ts`**: Browser-side Supabase client.
*   **`server.ts`**: Server-side Supabase client (used in Server Actions/Components).
*   **`middleware.ts`**: Helper for middleware session management.

### `lib/utils.ts`
*   **Path:** `lib/utils.ts`
*   **Details:** Utility functions, primarily `cn` (classnames) helper for conditional Tailwind class merging.

---

## Worker Directory (`worker/`)
Background job processing.

### `worker/index.ts`
*   **Path:** `worker/index.ts`
*   **Details:** The entry point for the background worker.
    *   **Logic:** Initializes a BullMQ `Worker`.
    *   **Job:** Listens for 'publish-post' jobs.
    *   **Action:** Fetches the post from the DB, iterates through destinations, and (in the future) calls the respective social APIs. Updates post status to 'published' or 'failed'.

---

## Docs Directory (`docs/`)
Project documentation.

*   **`ROADMAP.md`**: Project roadmap and progress tracker.
*   **`ARCHITECTURE.md`**: High-level system architecture and design decisions.
*   **`SOCIAL_MEDIA_SETUP.md`**: Guide for configuring Social Media API keys (Facebook, Twitter, etc.).
*   **`STRUCTURE.md`**: (This file) Detailed project structure.
