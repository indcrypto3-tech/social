# Frontend Pages Documentation

This document provides a detailed overview of the frontend pages in the application, mapping their routes to the corresponding file paths and describing their functionality and key components.

## 1. Marketing & Public Pages

These pages are accessible to the public and serve to introduce the product, pricing, and company information.

### Landing Page
- **Route:** `/`
- **File:** `app/(marketing)/page.tsx`
- **Description:** The main entry point for visitors. It showcases the product's value proposition through various sections.
- **Components:**
    - `Hero`: Main headline and call-to-action (CTA). Adjusts display based on "Waitlist Mode".
    - `Features`: Highlights key capabilities.
    - `HowItWorks`: Explains the user workflow.
    - `Integrations`: Shows supported platforms.
    - `Testimonials`: Social proof (hidden in Waitlist Mode).
    - `PricingSummary`: Pricing tiers (hidden in Waitlist Mode).
    - `FAQ`: Frequently asked questions (hidden in Waitlist Mode).

### Other Marketing Pages
- **About:** `/about` (`app/(marketing)/about/page.tsx`) - Company information.
- **Contact:** `/contact` (`app/(marketing)/contact/page.tsx`) - Contact form/info.
- **Pricing:** `/pricing` (`app/(marketing)/pricing/page.tsx`) - Detailed pricing plans.
- **Privacy Policy:** `/privacy` (`app/(marketing)/privacy/page.tsx`) - Legal privacy statement.
- **Terms of Service:** `/terms` (`app/(marketing)/terms/page.tsx`) - Legal terms.
- **Waitlist:** `/waitlist` (`app/(marketing)/waitlist/page.tsx`) - Dedicated waitlist signup page.

---

## 2. Authentication

Pages handling user identification and access control.

### Login
- **Route:** `/login`
- **File:** `app/(auth)/login/page.tsx`
- **Description:** Allows users to sign in via Email/Password or OAuth providers.
- **Key Features:**
    - Displays error messages from URL parameters.
    - Includes a link to "Forgot Password".
    - Includes a link to "Sign up".
    - Integrates `OAuthSignIn` component for social login.

### Register
- **Route:** `/register`
- **File:** `app/(auth)/register/page.tsx`
- **Description:** User registration form. Likely similar to Login but for creating new accounts.

### Forgot Password
- **Route:** `/forgot-password`
- **File:** `app/(auth)/forgot-password/page.tsx`
- **Description:** Flow to initiate password recovery.

### Auth Callback
- **Route:** `/auth/callback`
- **File:** `app/auth/callback/page.tsx`
- **Description:** Handles the redirect from OAuth providers (e.g., Supabase Auth). It processes the code/token and redirects the user to their intended destination (e.g., Dashboard).

---

## 3. Dashboard (Protected)

The core application area, protected by authentication. Layout is typically determined by `(dashboard)/layout.tsx`.

### Main Dashboard
- **Route:** `/dashboard`
- **File:** `app/(dashboard)/dashboard/page.tsx`
- **Description:** The landing view after login.
- **Functionality:**
    - Fetches onboarding progress data serverside via `getOnboardingProgress`.
    - Renders `DashboardClient` to display the UI based on user state (e.g., recent activity, stats, or onboarding steps).

### Composer (Create Post)
- **Route:** `/dashboard/composer`
- **File:** `app/(dashboard)/composer/page.tsx`
- **Description:** A comprehensive workspace for creating and scheduling social media posts.
- **Key Features:**
    - **Account Selection:** Allows selecting multiple connected accounts to post to simultaneously.
    - **Rich Text Editor:** Textarea for post content with character count and emoji support.
    - **AI Toolbar:** Integrated `AIToolbar` for content generation/refinement.
    - **Media Upload:** Drag-and-drop area for images/videos.
    - **Scheduling:** Options to pick a specific Date and Time for the post.
    - **Live Preview:** Real-time preview of how the post will look on selected platforms (Facebook, Twitter, LinkedIn, etc.).
    - **Action:** Submits data to `createPost` server action.

### Connected Accounts
- **Route:** `/dashboard/accounts`
- **File:** `app/(dashboard)/accounts/page.tsx`
- **Description:** Manages connections to third-party social media platforms.
- **Key Features:**
    - **List View:** Displays currently connected accounts with their status (Active/Error) and platform branding.
    - **Connect Flow:** `Dialog` containing buttons for supported platforms (Facebook, Instagram, X/Twitter, LinkedIn, YouTube).
    - **OAuth Handling:** `handleConnect` function triggers Supabase client-side OAuth flow with specific scopes for each platform.
    - **Empty State:** Specialized UI when no accounts are connected to encourage setup.

### Calendar
- **Route:** `/dashboard/calendar`
- **File:** `app/(dashboard)/calendar/page.tsx`
- **Description:** Visual representation of scheduled content.
- **Functionality:**
    - Fetches scheduled posts via `getScheduledPosts` server action.
    - Renders `CalendarView` (monthly/weekly calendar component) populated with the posts.

### Analytics
- **Route:** `/dashboard/analytics`
- **File:** `app/(dashboard)/analytics/page.tsx`
- **Description:** Data visualization for social media performance.
- **Functionality:**
    - Enforces authentication check.
    - Fetches analytics snapshots from the `/api/analytics` endpoint.
    - **Data Processing:** Aggregates data by date (summing followers, impressions, engagement).
    - **Components:**
        - `MetricsCards`: Summary stats (Total Followers, Impressions, Engagement).
        - `EngagementChart`: Visual graph of performance over time.
        - `TopPosts`: List of highest-performing content.
        - `BestTime`: Insight into optimal posting times.

### Media Library
- **Route:** `/dashboard/media`
- **File:** `app/(dashboard)/media/page.tsx`
- **Description:** Centralized management for uploaded images and videos.
- **Functionality:**
    - Fetches media items from `/api/media`.
    - Renders `MediaList` component for browsing and managing files.

### Settings
- **Route:** `/dashboard/settings`
- **File:** `app/(dashboard)/settings/page.tsx`
- **Description:** User preferences and profile settings management.
- **Functionality:**
    - Enforces authentication.
    - Fetches `userProfile` and `preferences` in parallel from `/api/settings` and `/api/settings/notifications`.
    - Renders `SettingsClient` which handles the UI for updating user details and notification preferences.

### Billing
- **Route:** `/dashboard/billing`
- **File:** `app/(dashboard)/billing/page.tsx`
- **Description:** Manage subscription plans and billing information.
- **Functionality:**
    - Enforces authentication.
    - **Current State:** Uses stubbed/default data ('free' plan, 'inactive' status) but is set up to fetch real data from the backend/database.
    - Renders `BillingContent` to display plan details and upgrade options.

### Team Management
- **Route:** `/dashboard/team`
- **File:** `app/(dashboard)/team/page.tsx`
- **Description:** Collaboration hub for managing team members and permissions.
- **Functionality:**
    - Fetches team data including members, invites, and current user role via `getTeamData`.
    - **Access Control:** Differentiates between 'owner' (can invite) and 'editor' roles.
    - **Components:**
        - `MembersList`: Displays current team members.
        - `InvitesList`: Shows pending invitations.
        - `InviteMember`: Form to send new email invitations.
        - `Tabs`: Separates 'Members' view from 'Team Settings' (renaming team).

---

## 4. Special Routes

### Team Invite
- **Route:** `/invite/[token]`
- **File:** `app/invite/[token]/page.tsx`
- **Description:** Dynamic route for accepting team invitations.
- **Functionality:**
    - Captures the `token` from the URL path.
    - Validates the token and allows the user to join the associated team/organization.

---

## 5. Artifacts

- **Default Template:** `app/_page.tsx` - Appears to be an unused artifact from the project initialization template.
