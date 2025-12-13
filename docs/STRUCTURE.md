# Project Structure

This document provides a detailed overview of the Social Media Scheduler V2 codebase structure. The project is strictly separated into `backend` (API/Worker/DB) and `frontend` (UI/Next.js).

## Architecture Diagram

```mermaid
graph TD
    User[User Browser]
    
    subgraph Frontend [Frontend (Port 3000)]
        UI[Next.js App Router]
        API_Client[API Client lib/api/client.ts]
        Auth_Middleware[Middleware (Route Protection)]
    end
    
    subgraph Backend [Backend (Port 4000)]
        API_Gateway[Next.js API Routes]
        Error_Middleware[Error Handling Middleware]
        DB[(PostgreSQL + Drizzle)]
        Worker[BullMQ Worker]
        Redis[(Redis)]
    end
    
    User --> UI
    UI -- "Fetch (Bearer Token)" --> API_Gateway
    API_Client --> API_Gateway
    API_Gateway --> DB
    API_Gateway --> Worker
    Worker --> DB
    Worker --> Redis
```

## Root Directory

### `backend/`
Contains the server-side logic, API definitions, database connectivity, and background workers.
*   **Tech Stack:** Next.js (API Routes), Drizzle ORM, BullMQ, Supabase Auth.

### `frontend/`
Contains the client-side UI, routing, and user interaction logic.
*   **Tech Stack:** Next.js (App Router), Tailwind CSS, Shadcn UI, React Query.

### `docs/`
Documentation specific to the V2 architecture.

---

## Backend Directory (`backend/`)

### `app/api/`
API Route Handlers (REST endpoints). **All DB Access happens here.**
*   **`settings/`**: User profile and preference management.
*   **`invites/`**: Team invitation handling (public check + acceptance).
*   **`accounts/`**: Social media account management.
*   **`ai/`**: AI generation endpoints.
*   **`billing/`**: Stripe integration.
*   **`media/`**: Media upload and management.
*   **`posts/`**: Post creation, scheduling.
*   **`webhooks/`**: External webhook handlers.

### `worker/`
Background job processing with BullMQ.
*   **`index.ts`**: Main worker; processes 'publish-queue'.
*   **`analytics-sync.ts`**: Scheduled analytics jobs.
*   **`notifications.ts`**: Email notifications.

### `lib/`
Core logic.
*   **`db/`**: Schema and Drizzle client.
*   **`posting/`**: PostDispatcher.
*   **`errors.ts`**: `AppError` and custom error classes.

### `middleware/`
*   **`error.ts`**: `withErrorHandler` HOF for centralized API error handling/logging.
*   **`auth.ts`**: Request authentication helpers.

---

## Frontend Directory (`frontend/`)

### `app/`
Application routes. Logic here **MUST NOT** import `db`.
*   **`global-error.tsx`**: Root error boundary.
*   **`not-found.tsx`**: Global 404 page.
*   **`lib/api/client.ts`**: Singleton API client.
*   **`invite/[token]/`**: Invite acceptance page (uses API).
*   **`(dashboard)/settings/`**: Settings page (uses API).

### `lib/`
*   **`api/client.ts`**: The ONLY place that calls the Backend. Handles 401s and Errors.

---

## Key Configuration

### Environment
*   **Frontend:** `NEXT_PUBLIC_API_BASE_URL` (points to Backend).
*   **Backend:** `DATABASE_URL`, `REDIS_URL`.

### Strict Rules
1.  **No DB Access in Frontend**: Frontend must call Backend API.
2.  **Auth Headers**: Frontend Server Components must pass Session Token in `Authorization` header.
3.  **Error Handling**: All Backend routes must be wrapped in `withErrorHandler`.
