# Social Media Scheduler SaaS - Architecture & Engineering Plan

## 1. Complete Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router, React Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query (React Query) for server state
- **UI Components**: Shadcn/ui (Radix Primitives) + Lucide React (Icons)
- **Forms**: React Hook Form + Zod validation

### Backend
- **API Framework**: Next.js API Routes (Server Actions/Route Handlers) for primary CRUD.
- **Worker Service**: Node.js (Express or standalone TS scripts) for the BullMQ consumer (Auto-posting engine).
- **Runtime**: Node.js 20+

### Database & Storage
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma or Drizzle ORM (Drizzle recommended for performance/serverless compatibility)
- **Queue System**: Redis (managed Upstash or self-hosted) + BullMQ
- **File Storage**: AWS S3 (or Supabase Storage acting as S3 wrapper)

### DevOps & Infrastructure
- **Hosting**: Vercel (Frontend/API) + Railway/Render/DigitalOcean (Worker Service & Redis)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (Error Tracking), PostHog (Analytics), Axiom (Logging)

---

## 2. System Architecture

### Component Diagram
```mermaid
graph TD
    Client[Web Client (Next.js)] -->|HTTPS| API[Next.js API Routes]
    Client -->|Uploads| S3[AWS S3/Storage]
    API -->|Read/Write| DB[(Supabase PostgreSQL)]
    API -->|Enqueue Jobs| Redis[(Redis Queue)]
    
    Worker[Worker Service (Node.js/BullMQ)] -->|Poll/Listen| Redis
    Worker -->|Update Status| DB
    Worker -->|Fetch Media| S3
    
    Worker -->|Post| FB[Facebook Graph API]
    Worker -->|Post| IG[Instagram Graph API]
    Worker -->|Post| LI[LinkedIn API]
    Worker -->|Post| TW[Twitter/X API]
    Worker -->|Post| YT[YouTube Data API]
    Worker -->|Post| TK[TikTok API]
    
    Scheduler[Cron/Scheduler - BullMQ Repeated Jobs] -->|Trigger| Redis
```

### Critical Flows

1.  **Auto-Posting Workflow**:
    *   User creates post -> API saves to `ScheduledPosts` (status: 'scheduled') -> API adds job to BullMQ (delayed).
    *   When time arrives -> BullMQ releases job -> Worker Process picks it up.
    *   Worker validates tokens -> refreshes if needed -> posts to social platform.
    *   On Success: Update `ScheduledPosts` status to 'published', Create `PublishedPosts` entry.
    *   On Failure: Retry based on policy -> if max retries reached, update status 'failed', log error.

2.  **Token Refresh**:
    *   Before posting, check `token_expires_at`.
    *   If expired/near expiry, call Platform Refresh Endpoint.
    *   Update `SocialAccounts` with new token.
    *   Proceed with post.

3.  **Rate Limit Protection**:
    *   BullMQ Limiter: Configure queues per platform/account with rate limits (e.g., 25 posts/hour).
    *   Handle `429 Too Many Requests` from platforms by pausing the specific queue or delaying the job.

---

## 3. Database Schema

### Users
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique User ID |
| `email` | VARCHAR | User Email |
| `full_name` | VARCHAR | Display Name |
| `password_hash` | VARCHAR | Auth (if not using Supabase Auth) |
| `created_at` | TIMESTAMPTZ | Creation time |
| `subscription_tier` | ENUM | Free, Pro, Business |

### SocialAccounts
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique Account ID |
| `user_id` | UUID (FK) | Owner |
| `platform` | ENUM | facebook, instagram, twitter, linkedin, youtube, tiktok |
| `platform_account_id`| VARCHAR | ID on the social platform |
| `account_name` | VARCHAR | Handle/Page Name |
| `access_token` | TEXT | Encrypted Access Token |
| `refresh_token` | TEXT | Encrypted Refresh Token |
| `token_expires_at` | TIMESTAMPTZ | Expiry for refresh logic |
| `metadata` | JSONB | Avatar URL, profile data |

### ScheduledPosts
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Post ID |
| `user_id` | UUID (FK) | Creator |
| `content` | TEXT | Post caption/text |
| `scheduled_at` | TIMESTAMPTZ | Time to publish |
| `status` | ENUM | draft, scheduled, publishing, published, failed |
| `platform_configs` | JSONB | Specific settings per platform (e.g. location, tags) |

### PostDestinations (Many-to-Many Link)
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `post_id` | UUID (FK) | Link to ScheduledPost |
| `social_account_id`| UUID (FK) | Link to SocialAccount |
| `status` | ENUM | pending, success, failed |
| `platform_post_id` | VARCHAR | ID returned by platform after posting |
| `error_message` | TEXT | Failure reason if any |

### MediaLibrary
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Media ID |
| `user_id` | UUID (FK) | Owner |
| `url` | TEXT | S3 Public/Presigned URL |
| `file_type` | VARCHAR | image/jpeg, video/mp4 |
| `file_size` | INTEGER | Size in bytes |
| `created_at` | TIMESTAMPTZ | Upload time |

### Teams & Roles (Collaboration)
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Team ID |
| `name` | VARCHAR | Team Name |
| `owner_id` | UUID (FK) | Team Owner |

### TeamMembers
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `team_id` | UUID (FK) | Team |
| `user_id` | UUID (FK) | User |
| `role` | ENUM | admin, editor, viewer |

---

## 4. Backend API Endpoints

### Auth
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Session/JWT exchange

### Social Accounts
- `GET /api/accounts` - List connected accounts
- `POST /api/accounts/connect/{platform}` - OAuth callback handler
- `DELETE /api/accounts/{id}` - Disconnect account

### Posts
- `POST /api/posts`
  - Body: `{ content, mediaIds[], scheduledAt, accountIds[] }`
  - Response: `{ postId, status: 'scheduled' }`
- `GET /api/posts` - List posts (filter by status, date)
- `GET /api/posts/{id}` - Get details
- `PUT /api/posts/{id}` - Update content/schedule
- `DELETE /api/posts/{id}` - Cancel/Delete

### Media
- `POST /api/media/presign` - Get S3 presigned URL for upload
- `POST /api/media` - Confirm upload and save to DB
- `GET /api/media` - List user media

### Analytics
- `GET /api/analytics/posts/{id}` - Per-post metrics
- `GET /api/analytics/aggregate` - Account-wide performance (followers, engagement)

---

## 5. Auto-Posting Engine (Worker)

**Job Queue**: BullMQ "publish-queue"

**Job Structure**:
```json
{
  "jobId": "uuid",
  "name": "publish-post",
  "data": {
    "postId": "uuid",
    "accountId": "uuid",
    "userId": "uuid"
  },
  "opts": {
    "delay": 5000 // Calculated Ms until scheduled_at
  }
}
```

**Worker Logic**:
1.  **Pick Job**: Worker grabs job when delay expires.
2.  **Fetch Data**: Retrieve `SocialAccount` and `ScheduledPost` from DB.
3.  **Validation**: Check if post is still "scheduled" (not deleted).
4.  **Token Check**: Verify access token validity. Call `refresh_token` flow if 401.
5.  **Platform Adapter**:
    *   Switch (platform)
    *   **Instagram**: Create Container -> Publish Container.
    *   **Twitter/X**: Post Tweet (v2 API).
    *   **LinkedIn**: UGC Post API.
6.  **Result Handling**:
    *   **Success**: Update `PostDestinations` status to `success`, save `platform_post_id`.
    *   **Error**:
        *   If `429` (Rate Limit) -> throw error with `delay` to retry later.
        *   If `5xx` (Server Error) -> retry standard exponential backoff.
        *   If `4xx` (Auth/Bad Request) -> Mark as `failed`, log specific error.

---

## 6. AI Integration (OpenAI)

**Endpoint**: `POST /api/ai/generate`

### System Prompt
```text
You are an expert social media manager. Your goal is to generate engaging, viral, and platform-specific captions.
Tone options: Professional, Witty, Casual, Urgent.
Output format: JSON object { "caption": "...", "hashtags": ["#tag1", "#tag2"] }
```

### User Prompt Structure
```text
Topic: {topic}
Tone: {tone}
Platform: {platform}
Context: {additional_context}
Generate a caption with emojis and 5-10 relevant hashtags.
```

### Response
Prase JSON, display in Post Composer for user editing.

---

## 7. Frontend Implementation Plan

### File Structure
```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(dashboard)
    /layout.tsx       <-- Sidebar & Header
    /page.tsx         <-- Dashboard Home (Summary)
    /calendar/        <-- FullCalendar view
    /composer/        <-- Create Post
    /accounts/        <-- Manage linkages
    /media/           <-- Gallery
    /analytics/       <-- Charts
    /settings/        <-- Team & Billing
/components
   /ui/               <-- Shadcn components
   /forms/            <-- PostForm, AccountConnectForm
   /calendar/         <-- CalendarMonth, CalendarDay
   /media/            <-- Uploader, MediaGrid
```

### Key Components
1.  **Unified Post Composer**:
    *   Text area with character count (platform specific).
    *   Media picker (drag & drop + select from library).
    *   Account selector (multi-select).
    *   Preview pane (Live preview of how post looks on IG/FB/TW).
    *   "Generate with AI" button.

2.  **Calendar View**:
    *   Drag and drop rescheduling (updates DB `scheduled_at`).
    *   Color coded by platform or status.

3.  **Account Connection**:
    *   Cards for each platform.
    *   "Connect" button triggers OAuth popup.
    *   Status indicator (Connected/Expired).
