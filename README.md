
# Social Media Scheduler

A powerful SaaS for scheduling social media posts with AI capabilities.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Queue**: Redis + BullMQ
- **Styling**: Tailwind CSS + Shadcn UI

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scheduler
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

3. **Database Setup**
   ```bash
   # Generate SQL from schema
   npm run db:generate
   
   # Apply migrations (ensure DB is running)
   npm run db:migrate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

5. **Run Worker Service** (in a separate terminal)
   The worker handles the actual posting to social networks.
   ```bash
   npm run worker
   ```

## Architecture
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.
