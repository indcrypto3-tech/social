# Engineering Roadmap

## Phase 1: Foundation (Weeks 1-2)

### Week 1: Core Setup & Auth
- ✅ Initialize Next.js project with Tailwind & Typescript.
- ✅ Setup Supabase project (DB & Auth).
- ✅ Implement Prisma/Drizzle schema.
- ✅ Create basic Auth pages (Login/Signup).
- ✅ Setup Layouts (Sidebar, Navbar) using `shadcn/ui`.

### Week 2: Social Account Connections
- ✅ Implement "Connect Account" backend flow (OAuth handling).
- ✅ Create `SocialAccounts` table CRUD.
- ✅ Implement Instagram & Facebook Login wrappers (Generic OAuth Action).
- ✅ Implement Twitter & LinkedIn Login wrappers (Generic OAuth Action).
- ✅ Store tokens securely (Supabase Auth + DB).

## Phase 2: Posting Engine (Weeks 3-4)

### Week 3: Post Creation & Media
- ✅ Build Media Library (S3 Uploads, Gallery View).
- ✅ Build Post Composer UI (Text, Media selection, Account selection).
- ✅ Implement `ScheduledPosts` DB CRUD.
- ✅ Create Preview components for each platform (Basic Generic Preview implemented).

### Week 4: Scheduling & Worker
- ✅ Setup Redis & BullMQ.
- ✅ Implement Queue Producer (Add job on post schedule).
- ✅ Implement Worker Consumer (Core logic shell).
- [ ] Implement Instagram Graph API posting logic.
- [ ] Implement Twitter/X API posting logic.
- [ ] Handle basic retries and failures.

## Phase 3: Advanced Features (Weeks 5-6)

### Week 5: Calendar & Management
- ✅ Build Calendar UI (Month View Grid).
- [ ] Implement Drag-and-Drop Rescheduling.
- [ ] Add List View for posts.
- [ ] Add "Post Now" immediate execution feature.

### Week 6: AI & Collaboration
- [ ] Integrate OpenAI API.
- [ ] Build "Generate Caption" modal/popover.
- [ ] Implement Team Management (Invite members, Roles).
- [ ] Add Post Approval workflows (Draft status).

## Phase 4: Polish & Launch (Weeks 7-8)

### Week 7: Analytics & Reliability
- [ ] Create Analytics Dashboard (Charts for reach/engagement).
- [ ] Implement Token Refresh background jobs.
- [ ] Add comprehensive error logging (Sentry).
- [ ] Optimize database queries and API response times.

### Week 8: Final Review & Deployment
- [ ] End-to-end testing of all platforms.
- [ ] UI/UX Polish (Dark mode, transitions, responsive fixes).
- [ ] Deployment to Vercel (Production).
- [ ] Setup Cron jobs for maintenance tasks.
