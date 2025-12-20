# Backend API Documentation

This document outlines the available API endpoints for the Social Media Scheduler backend.
All endpoints are available under the base URL.

**Authentication**:
All protected routes require a valid session.
1. **Session Cookie**: Primary method for Postman/Direct API usage (Requires `SameSite=None; Secure`).
2. **Bearer Token**: Primary method for Cross-Domain Frontend calls.
   `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`

---

## 1. Scheduled Posts (`/api/posts`)

### GET `/api/posts`
Retrieves a list of scheduled posts for the authenticated user, ordered by schedule date (descending).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "userId": "user-uuid",
      "content": "Hello World",
      "mediaUrls": ["https://..."],
      "scheduledAt": "2023-10-27T10:00:00.000Z",
      "status": "scheduled",
      "destinations": [
        {
          "socialAccount": {
            "platform": "twitter",
            "username": "my_handle"
          }
        }
      ]
    }
  ]
}
```

### POST `/api/posts`
Creates a new scheduled post.

**Request Body:**
```json
{
  "content": "My new post content",
  "mediaUrls": ["https://supa.base/image.png"],
  "scheduledAt": "2023-12-25T09:00:00.000Z",
  "accountIds": ["account-uuid-1", "account-uuid-2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "new-post-id", "status": "scheduled", ... }
}
```

---

## 2. Social Accounts (`/api/accounts`)

### GET `/api/accounts`
Retrieves all connected social media accounts for the user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "account-uuid",
      "platform": "twitter",
      "username": "userhandle",
      "avatarUrl": "https://..."
    }
  ]
}
```

### POST `/api/accounts`
*Not Implemented* - Placeholder for manual account connection.

---

## 3. Media Library (`/api/media`)

### GET `/api/media`
Retrieves all uploaded media files for the user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "media-uuid",
      "url": "https://...",
      "fileName": "image.png",
      "fileType": "image/png"
    }
  ]
}
```

### POST `/api/media`
Records a new file upload metadata.

**Request Body:**
```json
{
  "url": "https://...",
  "fileName": "image.png",
  "fileType": "image/jpeg",
  "fileSize": 102400
}
```

### DELETE `/api/media?id={id}`
Deletes a media item.

---

## 4. User Settings (`/api/settings`)

### GET `/api/settings`
Retrieves the current user's profile and subscription details.

### PATCH `/api/settings`
Updates user profile information.

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "timezone": "America/New_York",
  "avatarUrl": "https://..."
}
```

---

## 5. AI Features (`/api/ai`)

### POST `/api/ai/generate-caption`
Generates a social media caption using AI.

**Request Body:**
```json
{
  "prompt": "A photo of a sunset on the beach",
  "platform": "instagram",
  "tone": "inspirational"
}
```

**Response:**
```json
{
  "success": true,
  "data": "Sunset vibes! #nature #peace"
}
```

---

## 6. Analytics (`/api/analytics`)

### GET `/api/analytics`
Retrieves the last 100 analytics snapshots for the user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2023-10-25T00:00:00.000Z",
      "totalFollowers": 1500,
      "engagementRate": 0.05
    }
  ]
}
```

---

## 7. Billing (`/api/billing`)

### POST `/api/billing/checkout`
Creates a Stripe Checkout Session for a subscription.

**Request Body:**
```json
{
  "priceId": "price_12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "url": "https://checkout.stripe.com/..." }
}
```

### POST `/api/billing/portal`
Creates a Stripe Customer Portal session.

**Response:**
```json
{
  "success": true,
  "data": { "url": "https://billing.stripe.com/..." }
}
```

---

## 8. Dashboard (`/api/dashboard`)

### GET `/api/dashboard/onboarding`
Retrieves the user's onboarding progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "hasConnectedAccount": true,
    "hasCreatedPost": false,
    "hasScheduledPost": false,
    "isPro": false
  }
}
```

---

## 9. Team Invites (`/api/invites`)

### GET `/api/invites/[token]`
Validates and retrieves invite details.

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "invitee@example.com",
    "role": "editor",
    "teamName": "My Team"
  }
}
```

### POST `/api/invites/[token]/accept`
Accepts a team invite.

**Response:**
```json
{
  "success": true
}
```

---

## 10. Webhooks (`/api/webhooks`)

### POST `/api/webhooks/stripe`
Stripe event listener (checkout completion, subscription updates).
*Signatures verified by Stripe SDK.*

---

## 11. Waitlist (`/api/waitlist`)

### POST `/api/waitlist`
Adds an email to the waitlist.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Joined waitlist successfully"
}
```
