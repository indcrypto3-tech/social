---

## Landing Page (`/`)

**SocialScheduler Logo (Navbar)**
- Type: Clickable Link
- Action: Navigates to the home page (`/`)

**Features Link**
- Type: Clickable Link
- Action: Scolls to features section

**Pricing Link**
- Type: Clickable Link
- Action: Navigates to `/pricing` page

**About Link**
- Type: Clickable Link
- Action: Navigates to `/about` page

**Log in Link**
- Type: Clickable Link
- Action: Navigates to `/login` page

**Get Started Button (Hero)**
- Type: Clickable Button
- Action: Redirects to registration or login page

**Start Free Trial Button**
- Type: Clickable Button
- Action: Redirects to registration

**FAQ Accordions**
- Type: Clickable Toggle
- Action: Expands/collapses FAQ details

**Footer Links**
- Type: Clickable Links
- Action: Navigate to legal, social, and misc pages (Privacy, Terms, verify footer presence)

---

## Login Page (`/login`)

**Email Field**
- Type: Input (text/email)
- Action: User enters email address

**Password Field**
- Type: Input (password)
- Action: User enters password

**Login Button**
- Type: Clickable Button
- Action: Submits credentials to authenticate

**Forgot Password Link**
- Type: Clickable Link
- Action: Navigates to password reset flow

**Sign Up Link**
- Type: Clickable Link
- Action: Navigates to user registration

---

## Dashboard Shell (Global)

**Sidebar Navigation Links**
- Type: Clickable Links
- Action: Navigate to Dashboard, Accounts, Composer, Calendar, Media, Analytics, Team, Settings

**Sidebar Create Post**
- Type: Clickable Link/Button
- Action: Shortcuts to `/composer`

**Search Bar (Top)**
- Type: Input (text)
- Action: Filters content or searches app

**Theme Toggle**
- Type: Clickable Button/Switch
- Action: Toggles Light/Dark mode

**Notifications Icon**
- Type: Clickable Button
- Action: Opens notifications dropdown

**User Avatar/Menu**
- Type: Clickable Dropdown
- Action: Opens user menu (Profile, Logout)

**Logout Button (in User Menu)**
- Type: Clickable Button
- Action: Ends session and redirects to login

---

## Dashboard Home (`/dashboard`)

**Metrics Cards**
- Type: Display Elements
- Action: Show summary stats (Total Posts, Connected Accounts, etc.)

**Quick Actions (Connect, Create, View Calendar)**
- Type: Clickable Buttons
- Action: Shortcuts to respective pages

**Onboarding Checklist (if visible)**
- Type: Interactive List
- Action: Guides user through setup steps

---

## Accounts Page (`/accounts`)

**Connect Account Button**
- Type: Clickable Button
- Action: Initiates OAuth flow for social platforms

**Account List Items**
- Type: Display/Interactive
- Action: Shows connected status; may have "Disconnect" or "Refresh" options

---

## Composer Page (`/composer`)

**Platform Toggles/Selectors**
- Type: Clickable Toggles
- Action: Selects which platforms to post to

**Post Content Area**
- Type: Input (Textarea)
- Action: User types post content

**Media Upload Area**
- Type: Interactive Dropzone/Button
- Action: Opens file picker to upload images/video

**AI Tools (Generate/Improve)**
- Type: Clickable Buttons
- Action: Triggers AI content generation

**Post Now Button**
- Type: Clickable Button
- Action: Publishes content immediately

**Schedule Post Button**
- Type: Clickable Button
- Action: Opens date/time picker to schedule

---

## Calendar Page (`/calendar`)

**View Toggles (Month/Week/Day)**
- Type: Clickable Buttons
- Action: Changes calendar view mode

**Navigation Arrows (< >)**
- Type: Clickable Buttons
- Action: Moves to previous/next month/week

**Calendar Grid/Events**
- Type: Clickable Elements
- Action: Clicking an event opens details/preview

---

## Media Library (`/media`)

**Upload Media Button**
- Type: Clickable Button
- Action: Triggers file selection for upload

**Search Media Input**
- Type: Input (text)
- Action: Filters media items by name

**Media Grid Items**
- Type: Interactive Elements
- Action: Click to preview or select media; delete options usually present

---

## Analytics Page (`/analytics`)

**Date Range Picker**
- Type: Input/Dropdown
- Action: Selects time period for data

**Platform Filter**
- Type: Dropdown
- Action: Filters analytics by specific platform

**Export Report Button**
- Type: Clickable Button
- Action: Downloads analytics data (CSV/PDF)

---

## Team Page (`/team`)

**Invite Member Button**
- Type: Clickable Button
- Action: Opens modal to invite new users via email

**Role Selector (in Invite)**
- Type: Dropdown
- Action: Assigns permissions (Admin/Editor/Viewer)

**Member List Actions**
- Type: Clickable Buttons
- Action: Remove member or change role

---

## Settings Page (`/settings`)

**Settings Tabs (Profile, Notifications, Billing, Danger Zone)**
- Type: Clickable Navigation
- Action: Switches between settings context

### Profile Tab
**Name Input**
- Type: Input (text)
- Action: Edit user display name

**Email Input**
- Type: Input (text)
- Action: View/Edit email (often read-only)

**Avatar Upload**
- Type: Interactive Button
- Action: Change profile picture

**Save Changes Button**
- Type: Clickable Button
- Action: Persists profile updates

### Notifications Tab
**Email Preferences Toggles**
- Type: Switch/Checkbox
- Action: Enable/Disable specific email alerts

### Billing Tab
**Upgrade/Manage Plan Button**
- Type: Clickable Button
- Action: Redirects to Stripe portal or upgrade flow

### Danger Zone Tab
**Delete Account Button**
- Type: Clickable Button
- Action: Permanently deletes user account (usually requires confirmation)

---
