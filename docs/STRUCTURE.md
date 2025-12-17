# Project Structure Documentation

This document defines the current structure of the Social Media Scheduler project.
**IMPORTANT**: The project is in a hybrid state. It contains a "V2" structure split into `frontend` and `backend` directories, alongside "V1/Legacy" files in the root.

**For all new development, prefer the `frontend/` and `backend/` directories unless strictly instructed otherwise.**

---

## 1. Frontend Application (`frontend/`)
**Tech Stack**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI, Supabase Auth (Client).
**Port**: Default (3000)

### Key Directories
*   **`frontend/app/`**: Main application routes.
    *   `(auth)/`: Login/Register pages.
    *   `(dashboard)/`: Protected application pages (Dashboard, Calendar, Settings).
*   **`frontend/components/`**: UI Components (mostly Shadcn).
*   **`frontend/lib/`**:
    *   `api/`: **Crucial**. Contains the HTTP client (`client.ts`) that communicates with the Backend API.
    *   `utils.ts`: Tailwind class merger.
*   **`frontend/middleware.ts`**: Handles session refreshing and route protection.

---

## 2. Backend Application (`backend/`)
**Tech Stack**: Next.js (API Routes), Drizzle ORM, PostgreSQL, Redis, BullMQ.
**Port**: 4000 (Run via `npm run dev` inside `backend/`)

### Key Directories
*   **`backend/app/api/`**: **The Core API**. separation of concerns is strict here.
    *   `accounts/`, `posts/`, `media/`: Feature-specific endpoints.
*   **`backend/lib/`**: Shared logic.
    *   `db/`: Drizzle Client and Schema definitions.
    *   `posting/`: Logic for dispatching posts to social networks.
*   **`backend/drizzle/`**: Database migrations and schema snapshots.
*   **`backend/worker/`**: Background workers (BullMQ) for processing scheduled posts.
*   **`backend/middleware/`**: Custom middleware for error handling and authentication verification.

---

## 3. Root / Legacy Directory (`./`)
**Status**: Partially Deprecated / Mixed.
Contains files from the previous single-app architecture.

*   `app/`: Legacy Next.js routes.
*   `components/`: Legacy React components.
*   `lib/`: Legacy utility functions.
*   `worker/`: Legacy worker entry point.
*   `doc/`: Documentation files.

## AI Implementation Guide

### Where to write code?
*   **UI / Pages**: Write in `frontend/app/`.
*   **API / Business Logic**: Write in `backend/app/api/`.
*   **Database Schema**: Define in `backend/lib/db/schema.ts` (or `backend/drizzle/schema.ts` if split).
*   **Background Jobs**: Define in `backend/worker/`.

### Development Workflow
1.  **Frontend**: Calls `frontend/lib/api/client.ts` -> functions call `NEXT_PUBLIC_API_BASE_URL` (Backend).
2.  **Backend**: Receives request -> Authenticates -> Calls DB/Queue -> Returns JSON.

### Database Access
*   **Frontend**: NEVER access the DB directly.
*   **Backend**: ALWAYS access DB via Drizzle (`backend/lib/db`).

### Authentication
*   Auth is handled by Supabase.
*   Frontend manages the session.
*   Frontend passes the Access Token in the `Authorization` header to the Backend.
*   Backend verifies the token.
