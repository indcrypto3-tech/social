# Project Structure Documentation

This document defines the current structure of the **Autopostr** (formerly Social Media Scheduler) project.

**IMPORTANT**: The project follows a strict Monorepo-style structure split into `frontend` and `backend` directories.

**For all new development, prefer the `frontend/` and `backend/` directories.**

---

## 1. Frontend Application (`frontend/`)
**Tech Stack**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI, Supabase Auth (Client).
**Port**: Default (3000)

### Key Directories
*   **`frontend/app/`**: Main application routes.
    *   `(auth)/`: Login/Register pages.
    *   `(dashboard)/`: Protected application pages (Dashboard, Calendar, Settings).
    *   `(marketing)/`: Public landing pages.
    *   `auth/`: OAuth Callback handlers.
*   **`frontend/components/`**: UI Components (Shadcn & Custom).
*   **`frontend/hooks/`**: Custom React hooks.
*   `frontend/lib/`:
    *   `api/`: **Crucial**. Contains the HTTP client (`client.ts`) that communicates with the Backend API.
    *   `utils.ts`: Utility functions (Tailwind merger, etc.).
*   **`frontend/public/`**: Static assets (images, branding).
*   **`frontend/middleware.ts`**: Handles session refreshing and route protection.

---

## 2. Backend Application (`backend/`)
**Tech Stack**: Next.js (API Routes), Drizzle ORM, PostgreSQL, Redis, BullMQ.
**Port**: 4000 (Run via `npm run dev` inside `backend/`)

### Key Directories
*   **`backend/app/api/`**: **The Core API**.
    *   `accounts/`, `posts/`, `media/`: Feature-specific endpoints.
    *   `oauth/`: Backend-owned OAuth flows.
        *   `[provider]/start`: Initiates OAuth.
        *   `[provider]/callback`: Handles callbacks.
*   **`backend/lib/`**: Shared logic.
    *   `db/`: Drizzle Client and Schema definitions (`schema.ts`).
    *   `posting/`: Logic for dispatching posts to social networks.
    *   `oauth/`: OAuth Provider implementations (Facebook, LinkedIn, Twitter, etc.).
    *   `social/`: Platform-specific utilities.
*   **`backend/drizzle/`**: Database migrations and schema snapshots.
*   **`backend/worker/`**: Background workers (BullMQ) for processing scheduled posts.
*   **`backend/middleware/`**: Custom middleware for error handling and authentication verification.
*   **`backend/scripts/`**: Utility scripts.

---

## 3. Documentation (`docs/`)
Contains all project documentation, including architecture diagrams, API specs, and setup guides.
*   `STRUCTURE.md`: This file.
*   `API_DOCUMENTATION.md`, `BACKEND_API.md`: API details.
*   `FRONTEND_PAGES.md`: Frontend route documentation.
*   `changelog.md`: Project change history.

---

## AI Implementation Guide

### Where to write code?
*   **UI / Pages**: Write in `frontend/app/`.
*   **API / Business Logic**: Write in `backend/app/api/`.
*   **Database Schema**: Define in `backend/lib/db/schema.ts`.
*   **Background Jobs**: Define in `backend/worker/`.

### Development Workflow
1.  **Frontend**: Calls `frontend/lib/api/client.ts` -> Calls `/api/...` -> Next.js Rewrite proxies to `BACKEND_INTERNAL_URL` (Port 4000).
2.  **Backend**: Receives request -> Authenticates -> Calls DB/Queue -> Returns JSON.

### Database Access
*   **Frontend**: NEVER access the DB directly.
*   **Backend**: ALWAYS access DB via Drizzle (`backend/lib/db`).

### Authentication
*   Auth is handled by Supabase (Email/Password).
*   **Social OAuth**: Managed by Backend (BFF pattern).
    *   Frontend redirects to `backend/app/api/oauth/[provider]/start`.
    *   Backend handles handshake and redirects back to Frontend.
*   **Connected Accounts**: Stored in `social_accounts`. Status (connected/expired) is computed at runtime. Disconnecting performs a soft-delete (`is_active = false`).
*   Frontend manages the session.
*   Frontend passes the Access Token in the `Authorization` header to the Backend.
*   Backend verifies the token using Supabase Admin/Client.

## Error Handling
*   **Global Error Boundary**: `frontend/app/(dashboard)/error.tsx` catches runtime errors in the dashboard layout and provides a user-friendly retry mechanism.
*   **API Failures**: Pages (Calendar, Media, Settings) implement defensive programming (try/catch) to handle API downtime gracefully without crashing the UI.
