# System Architecture & Refactoring Plan

## 1. Architecture Diagram

```ascii
                                    +-----------------+
                                    |   User Browser  |
                                    +--------+--------+
                                             |
                                     HTTPS / JSON
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                  Load Balancer (Vercel/AWS)                             |
+--------------------------------------------+--------------------------------------------+
                                             |
                     +-----------------------+-----------------------+
                     |                                               |
+--------------------v--------------------+       +------------------v--------------------+
|             FRONTEND APP                |       |             BACKEND API               |
|         (Next.js App Router)            |       |         (Next.js API Only)            |
|                                         |       |                                       |
|  [UI Components] [Pages] [Hooks]        |       |  [API Routes] [Middleware] [Valid.]   |
|         |           |                   |       |         |           |                 |
|         +-----------+                   |       |         +-----------+                 |
|               |                         |       |               |                       |
|       [API Client Lib] ------------------------>|       [Controller / Services]         |
|   (Handles Auth, Errors, Retries)       |       |               |                       |
+-----------------------------------------+       |       [Drizzle ORM]                   |
                                                  |               |                       |
                                                  +-------+-------+-------+---------------+
                                                          |       |       |
                                                          |       |       |
                                            +-------------v-------v-------v-------------+
                                            |           Database & Services             |
                                            |  [Postgres] [Redis] [Supabase] [Stripe]   |
                                            +-------------------------------------------+
                                                                  ^
                                                                  |
                                                      +-----------+-----------+
                                                      |     Worker System     |
                                                      |    (BullMQ / Node)    |
                                                      +-----------------------+
```

## 2. Final Folder Structure (`socialv2/`)

```
socialv2/
├── frontend/                  # Next.js UI Application
│   ├── app/                   # App Router Pages
│   │   ├── (auth)/            # Login/Register
│   │   ├── (dashboard)/       # Main App (Composer, Calendar, etc.)
│   │   └── layout.tsx         # Root Layout
│   ├── components/            # React Components
│   │   ├── ui/                # Shadcn UI
│   │   ├── error-boundary.tsx # Global Error Boundary
│   │   └── ...
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts      # Central API Client
│   │   └── utils.ts
│   ├── public/
│   ├── styles/
│   ├── .env                   # NEXT_PUBLIC_API_BASE_URL
│   ├── next.config.mjs
│   └── package.json
│
└── backend/                   # API & Workers
    ├── app/
    │   └── api/               # API Routes (Endpoints)
    │       ├── auth/
    │       ├── posts/
    │       └── ...
    ├── lib/
    │   ├── db/                # Drizzle Configuration
    │   ├── errors.ts          # Typed Error Classes
    │   └── ...
    ├── middleware/
    │   └── error.ts           # Central Error Handling Middleware
    ├── worker/                # Background Workers
    │   ├── index.ts
    │   └── ...
    ├── .env                   # DB_URL, STRIPE_KEY, etc.
    └── package.json
```

## 3. Migration Checklist

### Phase 1: Setup & Scaffolding
- [x] Create `socialv2` root directory.
- [x] Create `frontend` and `backend` directories.
- [x] Setup `frontend/lib/api/client.ts`.
- [x] Setup `backend/lib/errors.ts`.
- [x] Setup `backend/middleware/error.ts`.
- [x] Initialize `package.json` for both apps (Copy dependencies).


### Phase 2: Backend Migration
- [x] Move `socialscheduler/lib/db` -> `socialv2/backend/lib/db`.
- [x] Move `socialscheduler/drizzle` -> `socialv2/backend/drizzle`.
- [x] Move `socialscheduler/app/api` -> `socialv2/backend/app/api`.
- [x] Refactor API routes to use `withErrorHandler`.
- [x] Move `socialscheduler/worker` -> `socialv2/backend/worker`.
- [x] Verify Backend `.env` configuration.


### Phase 3: Frontend Migration
- [x] Move server components & pages from `socialscheduler/app` to `socialv2/frontend/app`.
- [x] **CRITICAL**: Find all `fetch` or internal API calls and replace with `apiClient`.
- [x] Move `socialscheduler/components` -> `socialv2/frontend/components`.
- [x] Wrap layouts with `<ErrorBoundary>`.
- [x] Verify Frontend `.env` configuration (`NEXT_PUBLIC_API_BASE_URL`).


### Phase 4: Validation
- [ ] Test Auth Flow (Frontend -> Backend -> Supabase).
- [ ] Test Post Creation (Frontend -> API -> DB -> Worker).
- [ ] trigger forced 500 status to test Error Boundary.

## 4. Failure Handling Strategy

| Scenario | Component | Detection | Handling Action | User Experience |
| :--- | :--- | :--- | :--- | :--- |
| **Network Failure** | Frontend Client | `fetch` throws error | `ApiClient` catches, retries if idempotent (GET), else throws `NetworkError`. | Show "You are offline" toast or banner. |
| **API 500 Error** | Backend | Middleware Catches | Log stack to Sentry. Return generic `{ success: false, message: "Internal Server Error" }`. | Show "Something went wrong" toast. |
| **API 401 (Auth)** | Frontend Client | `fetch` returns 401 | `ApiClient` intercepts. | Redirect to `/login` or refresh token loop. |
| **Database Down** | Backend | Connection Timeout | `withErrorHandler` catches `DbConnectionError` -> returns 503. | "Service unavailable, please try again later". |
| **Worker Failure** | BullMQ | Job Fails | Retry policy (Exponential backoff). Move to Dead Letter Queue after N tries. | Post shows "Failed" status in UI. |
| **Validation Error** | Backend | Zod Parse Error | Return 400 with field-specific details. | Highlight form fields in red with messages. |

## 5. Environment Configuration

**Frontend (`socialv2/frontend/.env`):**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api # Local Backend
# In Production: https://api.socialscheduler.com/api
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Backend (`socialv2/backend/.env`):**
```bash
PORT=4000
DATABASE_URL=postgres://...
SUPABASE_SERVICE_ROLE_KEY=...
REDIS_URL=redis://...
STRIPE_SECRET_KEY=...
```
