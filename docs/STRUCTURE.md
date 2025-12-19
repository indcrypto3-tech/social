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
*   **`frontend/components/`**: UI Components (Shadcn & Custom).
*   **`frontend/hooks/`**: Custom React hooks.
*   **`frontend/lib/`**:
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
    *   `accounts/`, `posts/`, `media/`, `oauth/`: Feature-specific endpoints.
*   **`backend/lib/`**: Shared logic.
    *   `db/`: Drizzle Client and Schema definitions (`schema.ts`).
    *   `posting/`: Logic for dispatching posts to social networks.
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
1.  **Frontend**: Calls `frontend/lib/api/client.ts` -> functions call `NEXT_PUBLIC_API_BASE_URL` (Backend).
2.  **Backend**: Receives request -> Authenticates -> Calls DB/Queue -> Returns JSON.

### Database Access
*   **Frontend**: NEVER access the DB directly.
*   **Backend**: ALWAYS access DB via Drizzle (`backend/lib/db`).

### Authentication
*   Auth is handled by Supabase (Email/Password).
*   **Social OAuth**: Managed by Backend (BFF pattern) via `backend/app/api/oauth`.
*   **Connected Accounts**: Stored in `social_accounts`. Status (connected/expired) is computed at runtime. Disconnecting performs a soft-delete (`is_active = false`).
*   Frontend manages the session.
*   Frontend passes the Access Token in the `Authorization` header to the Backend.
*   Backend verifies the token using Supabase Admin/Client.
