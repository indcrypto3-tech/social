# Autopostr Backend - API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:4000` (development) | `https://api.autopostr.com` (production)  
**Last Updated**: December 19, 2025

## Table of Contents

1. [Authentication](#authentication)
2. [Social Accounts](#social-accounts)
3. [Posts](#posts)
4. [Team Management](#team-management)
5. [Media Library](#media-library)
6. [AI Features](#ai-features)
7. [Analytics](#analytics)
8. [Calendar](#calendar)
9. [Health & Monitoring](#health--monitoring)
10. [Error Codes](#error-codes)

---

## Authentication

All API endpoints (except health check and OAuth callbacks) require authentication via session cookie.

### Login

**POST** `/api/auth/login`

Verifies Supabase session and creates backend session.

**Request**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "id": "session-uuid",
    "expiresAt": "2025-12-26T10:00:00Z"
  }
}
```

**Errors**:
- `401`: Invalid or expired access token
- `500`: Server error

---

### Logout

**POST** `/api/auth/logout`

Destroys backend session and signs out from Supabase.

**Auth Required**: Yes

**Response** (200):
```json
{
  "success": true
}
```

---

### Get Session

**GET** `/api/auth/session`

Retrieves current session information.

**Auth Required**: Yes

**Response** (200):
```json
{
  "session": {
    "id": "session-uuid",
    "userId": "user-uuid",
    "expiresAt": "2025-12-26T10:00:00Z"
  }
}
```

**Errors**:
- `401`: No valid session

---

### Refresh Session

**POST** `/api/auth/refresh-session`

Extends session expiry.

**Auth Required**: Yes

**Response** (200):
```json
{
  "success": true,
  "expiresAt": "2025-12-26T10:00:00Z"
}
```

---

## Social Accounts

### Get Connected Accounts

**GET** `/api/accounts`

Returns all active social media accounts connected by the user.

**Auth Required**: Yes

**Response** (200):
```json
{
  "accounts": [
    {
      "id": "account-uuid",
      "platform": "facebook",
      "accountName": "My Page",
      "accountType": "page",
      "isActive": true,
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

### Disconnect Account

**DELETE** `/api/accounts/{id}`

Soft-deletes a social account (sets `isActive = false`).

**Auth Required**: Yes

**Parameters**:
- `id` (path): Account UUID

**Response** (200):
```json
{
  "success": true
}
```

**Errors**:
- `404`: Account not found
- `403`: Not account owner

---

### Refresh Account Token

**POST** `/api/accounts/{id}/refresh-token`

Manually refreshes OAuth token for an account.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Account UUID

**Response** (200):
```json
{
  "success": true,
  "expiresAt": "2025-12-26T10:00:00Z"
}
```

**Errors**:
- `404`: Account not found
- `400`: Platform doesn't support refresh
- `500`: Refresh failed

---

## Posts

### Create Post

**POST** `/api/posts`

Creates a new post (draft or scheduled).

**Auth Required**: Yes

**Request**:
```json
{
  "content": "Check out our new product!",
  "mediaUrls": ["https://storage.supabase.co/..."],
  "scheduledAt": "2025-12-20T15:00:00Z",
  "destinations": ["account-uuid-1", "account-uuid-2"],
  "platformConfigs": {
    "instagram": { "type": "feed" }
  }
}
```

**Response** (201):
```json
{
  "id": "post-uuid",
  "content": "Check out our new product!",
  "scheduledAt": "2025-12-20T15:00:00Z",
  "status": "draft",
  "createdAt": "2025-12-19T10:00:00Z"
}
```

---

### Get Posts

**GET** `/api/posts`

Returns all posts for the authenticated user.

**Auth Required**: Yes

**Query Parameters**:
- `status` (optional): Filter by status (draft, scheduled, published, failed)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200):
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "content": "Post content...",
      "scheduledAt": "2025-12-20T15:00:00Z",
      "status": "scheduled",
      "destinations": [...]
    }
  ]
}
```

---

### Get Single Post

**GET** `/api/posts/{id}`

Returns a single post by ID.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Response** (200):
```json
{
  "id": "post-uuid",
  "content": "Post content...",
  "mediaUrls": [...],
  "scheduledAt": "2025-12-20T15:00:00Z",
  "status": "scheduled",
  "destinations": [...]
}
```

**Errors**:
- `404`: Post not found
- `403`: Not post owner

---

### Update Post

**PATCH** `/api/posts/{id}`

Updates an existing post.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Request**:
```json
{
  "content": "Updated content",
  "scheduledAt": "2025-12-21T15:00:00Z"
}
```

**Response** (200):
```json
{
  "id": "post-uuid",
  "content": "Updated content",
  "updatedAt": "2025-12-19T11:00:00Z"
}
```

**Errors**:
- `404`: Post not found
- `403`: Not post owner
- `400`: Cannot update published posts

---

### Delete Post

**DELETE** `/api/posts/{id}`

Deletes a post.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Response** (200):
```json
{
  "success": true
}
```

**Errors**:
- `404`: Post not found
- `403`: Not post owner

---

### Schedule Post

**POST** `/api/posts/{id}/schedule`

Schedules a post for future publishing.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Request**:
```json
{
  "scheduledAt": "2025-12-20T15:00:00Z"
}
```

**Response** (200):
```json
{
  "success": true,
  "scheduledAt": "2025-12-20T15:00:00Z",
  "jobId": "job-uuid"
}
```

**Errors**:
- `400`: Invalid date (must be in future)
- `404`: Post not found

---

### Post Now

**POST** `/api/posts/{id}/post-now`

Publishes a post immediately.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Response** (200):
```json
{
  "success": true,
  "jobId": "job-uuid"
}
```

---

### Reschedule Post

**POST** `/api/posts/{id}/reschedule`

Changes the scheduled time for a post.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Request**:
```json
{
  "scheduledAt": "2025-12-21T15:00:00Z"
}
```

**Response** (200):
```json
{
  "success": true,
  "scheduledAt": "2025-12-21T15:00:00Z"
}
```

---

### Cancel Scheduled Post

**POST** `/api/posts/{id}/cancel`

Cancels a scheduled post (sets status to draft).

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Response** (200):
```json
{
  "success": true
}
```

---

### Submit for Approval

**POST** `/api/posts/{id}/submit-for-approval`

Submits a post for team approval.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Response** (200):
```json
{
  "success": true,
  "approvalStatus": "pending"
}
```

---

### Approve Post

**POST** `/api/posts/{id}/approve`

Approves a pending post (requires approval permission).

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Request**:
```json
{
  "teamId": "team-uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "approvalStatus": "approved",
  "reviewedBy": "user-uuid",
  "reviewedAt": "2025-12-19T12:00:00Z"
}
```

**Errors**:
- `403`: Insufficient permissions
- `400`: Post not pending approval

---

### Reject Post

**POST** `/api/posts/{id}/reject`

Rejects a pending post.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Post UUID

**Request**:
```json
{
  "teamId": "team-uuid",
  "reason": "Content needs revision"
}
```

**Response** (200):
```json
{
  "success": true,
  "approvalStatus": "rejected",
  "reason": "Content needs revision"
}
```

---

### Get Pending Approvals

**GET** `/api/posts/pending-approvals`

Returns posts pending approval.

**Auth Required**: Yes

**Query Parameters**:
- `teamId` (optional): Filter by team

**Response** (200):
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "content": "...",
      "approvalStatus": "pending",
      "createdAt": "2025-12-19T10:00:00Z"
    }
  ]
}
```

---

### List View

**GET** `/api/posts/list-view`

Returns posts in list format with filtering and sorting.

**Auth Required**: Yes

**Query Parameters**:
- `status` (optional): Filter by status
- `sortBy` (optional): Sort field (scheduledAt, createdAt)
- `sortOrder` (optional): asc or desc
- `limit` (optional): Results per page
- `offset` (optional): Pagination offset

**Response** (200):
```json
{
  "posts": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Team Management

### Invite Member

**POST** `/api/team/invite`

Invites a user to join a team.

**Auth Required**: Yes  
**Permission Required**: `canInvite` (owner only)

**Request**:
```json
{
  "teamId": "team-uuid",
  "email": "newmember@example.com",
  "role": "editor"
}
```

**Response** (201):
```json
{
  "success": true,
  "invite": {
    "id": "invite-uuid",
    "email": "newmember@example.com",
    "role": "editor",
    "expiresAt": "2025-12-26T10:00:00Z",
    "inviteLink": "http://localhost:4000/team/accept-invite?token=..."
  }
}
```

**Errors**:
- `403`: Insufficient permissions
- `404`: Team not found

---

### Accept Invite

**POST** `/api/team/accept-invite`

Accepts a team invitation.

**Auth Required**: Yes

**Request**:
```json
{
  "token": "invite-token-uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "teamId": "team-uuid",
  "role": "editor"
}
```

**Errors**:
- `404`: Invalid token
- `400`: Invite expired or already accepted
- `403`: Email mismatch

---

### Get Team Members

**GET** `/api/team/members`

Returns all members of a team.

**Auth Required**: Yes

**Query Parameters**:
- `teamId` (required): Team UUID

**Response** (200):
```json
{
  "teamId": "team-uuid",
  "teamName": "Marketing Team",
  "members": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "owner",
      "joinedAt": "2025-12-01T10:00:00Z",
      "isOwner": true
    }
  ],
  "total": 5
}
```

**Errors**:
- `403`: Not a team member
- `404`: Team not found

---

### Update Member Role

**PUT** `/api/team/members/{memberId}/role`

Changes a team member's role.

**Auth Required**: Yes  
**Permission Required**: `canChangeRoles` (owner only)

**Parameters**:
- `memberId` (path): Member UUID

**Request**:
```json
{
  "role": "viewer"
}
```

**Response** (200):
```json
{
  "success": true,
  "memberId": "member-uuid",
  "newRole": "viewer"
}
```

**Errors**:
- `403`: Insufficient permissions
- `404`: Member not found
- `400`: Invalid role

---

### Remove Member

**DELETE** `/api/team/members/{memberId}`

Removes a member from a team.

**Auth Required**: Yes  
**Permission Required**: `canRemoveMembers` (owner only)

**Parameters**:
- `memberId` (path): Member UUID

**Response** (200):
```json
{
  "success": true
}
```

**Errors**:
- `403`: Insufficient permissions
- `404`: Member not found

---

## Media Library

### Upload Media

**POST** `/api/media/upload`

Uploads a file to media library.

**Auth Required**: Yes

**Request**: `multipart/form-data`
- `file`: File to upload (max 50MB)

**Response** (201):
```json
{
  "id": "media-uuid",
  "url": "https://storage.supabase.co/...",
  "fileName": "image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1024000,
  "createdAt": "2025-12-19T10:00:00Z"
}
```

**Errors**:
- `400`: File too large or invalid type
- `500`: Upload failed

**Supported Types**:
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, QuickTime

---

### Get Media

**GET** `/api/media`

Returns all media files for the user.

**Auth Required**: Yes

**Response** (200):
```json
{
  "media": [
    {
      "id": "media-uuid",
      "url": "https://storage.supabase.co/...",
      "fileName": "image.jpg",
      "fileType": "image/jpeg",
      "fileSize": 1024000,
      "createdAt": "2025-12-19T10:00:00Z"
    }
  ]
}
```

---

### Delete Media

**DELETE** `/api/media/{id}`

Deletes a media file.

**Auth Required**: Yes

**Parameters**:
- `id` (path): Media UUID

**Response** (200):
```json
{
  "success": true
}
```

**Errors**:
- `404`: Media not found
- `403`: Not media owner

---

## AI Features

All AI endpoints are rate-limited to 10 requests per minute per user.

### Generate Caption

**POST** `/api/ai/generate-caption`

Generates a social media caption using AI.

**Auth Required**: Yes

**Request**:
```json
{
  "prompt": "New product launch - eco-friendly water bottle",
  "platform": "instagram",
  "tone": "Professional"
}
```

**Response** (200):
```json
{
  "success": true,
  "caption": "Introducing our latest innovation in sustainable living...",
  "metadata": {
    "platform": "instagram",
    "tone": "Professional",
    "estimatedTokens": 150
  }
}
```

**Headers**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 45
```

**Errors**:
- `400`: Invalid prompt or tone
- `429`: Rate limit exceeded
- `503`: AI service unavailable

**Valid Tones**: Professional, Casual, Viral, Storytelling, Minimal

---

### Improve Caption

**POST** `/api/ai/improve-caption`

Improves an existing caption.

**Auth Required**: Yes

**Request**:
```json
{
  "caption": "Check out our new product",
  "platform": "linkedin",
  "improvements": "Make it more professional and add a call-to-action"
}
```

**Response** (200):
```json
{
  "success": true,
  "original": "Check out our new product",
  "improved": "Discover our latest innovation...",
  "metadata": {
    "platform": "linkedin",
    "tokensUsed": 200
  }
}
```

---

### Hashtag Suggestions

**POST** `/api/ai/hashtag-suggestions`

Generates relevant hashtags for a post.

**Auth Required**: Yes

**Request**:
```json
{
  "caption": "Launching our new eco-friendly product line",
  "platform": "instagram",
  "niche": "sustainability"
}
```

**Response** (200):
```json
{
  "success": true,
  "hashtags": [
    "#sustainability",
    "#ecofriendly",
    "#greenproducts",
    ...
  ],
  "metadata": {
    "platform": "instagram",
    "niche": "sustainability",
    "count": 15
  }
}
```

**Fallback**: If AI fails, returns generic hashtags with `isFallback: true`

---

## Analytics

### Overview

**GET** `/api/analytics/overview`

Returns dashboard analytics overview.

**Auth Required**: Yes

**Query Parameters**:
- `period` (optional): Days to analyze (default: 30)

**Response** (200):
```json
{
  "period": 30,
  "overview": {
    "totalPosts": 45,
    "publishedPosts": 40,
    "scheduledPosts": 3,
    "failedPosts": 2,
    "successRate": 89
  },
  "engagement": {
    "totalFollowers": 5420,
    "totalImpressions": 12500,
    "totalEngagement": 890,
    "engagementRate": 7,
    "followerGrowth": 12
  },
  "trends": {
    "daily": [...]
  }
}
```

---

### Post Analytics

**GET** `/api/analytics/posts`

Returns analytics for individual posts.

**Auth Required**: Yes

**Query Parameters**:
- `status` (optional): Filter by status
- `limit` (optional): Results per page
- `offset` (optional): Pagination offset

**Response** (200):
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "content": "Post preview...",
      "scheduledAt": "2025-12-19T10:00:00Z",
      "status": "published",
      "platforms": ["facebook", "twitter"],
      "engagement": {
        "likes": 45,
        "comments": 12,
        "shares": 5,
        "impressions": 850,
        "reach": 720
      }
    }
  ]
}
```

---

### Account Analytics

**GET** `/api/analytics/accounts`

Returns performance metrics per social account.

**Auth Required**: Yes

**Query Parameters**:
- `period` (optional): Days to analyze (default: 30)

**Response** (200):
```json
{
  "period": 30,
  "accounts": [
    {
      "accountId": "account-uuid",
      "platform": "instagram",
      "accountName": "@myaccount",
      "metrics": {
        "followers": 2500,
        "followerGrowth": 15,
        "postsPublished": 12,
        "totalImpressions": 5000,
        "totalEngagement": 450,
        "engagementRate": 9.0
      },
      "trend": [...]
    }
  ]
}
```

---

### Sync Analytics

**POST** `/api/analytics/sync`

Manually triggers analytics sync.

**Auth Required**: Yes

**Request** (optional):
```json
{
  "accountId": "account-uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Analytics sync started",
  "jobId": "job-uuid"
}
```

---

## Calendar

### Get Calendar Events

**GET** `/api/calendar`

Returns posts formatted for calendar view.

**Auth Required**: Yes

**Query Parameters**:
- `start` (required): Start date (ISO 8601)
- `end` (required): End date (ISO 8601)

**Response** (200):
```json
{
  "timezone": "UTC",
  "events": [
    {
      "id": "post-uuid",
      "title": "Post preview...",
      "start": "2025-12-20T15:00:00Z",
      "status": "scheduled",
      "platforms": ["facebook", "instagram"],
      "destinationCount": 2
    }
  ],
  "total": 15
}
```

---

### Drag Reschedule

**POST** `/api/calendar/drag-reschedule`

Reschedules a post via drag-and-drop.

**Auth Required**: Yes

**Request**:
```json
{
  "postId": "post-uuid",
  "newScheduledAt": "2025-12-21T15:00:00Z"
}
```

**Response** (200):
```json
{
  "success": true,
  "scheduledAt": "2025-12-21T15:00:00Z",
  "hasCollision": false,
  "message": "Post rescheduled successfully"
}
```

**Collision Detection**: Warns if posts scheduled within 5 minutes

---

## Health & Monitoring

### Health Check

**GET** `/api/health`

Returns system health status.

**Auth Required**: No

**Response** (200 or 503):
```json
{
  "status": "healthy",
  "timestamp": "2025-12-19T10:00:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5
    },
    "environment": {
      "status": "healthy",
      "missing": []
    }
  }
}
```

**Status Codes**:
- `200`: All systems healthy
- `503`: One or more systems degraded

---

## Error Codes

### Standard HTTP Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily down |

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional context",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication needed
- `INVALID_TOKEN`: Invalid or expired token
- `PERMISSION_DENIED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVICE_UNAVAILABLE`: External service down

---

## Rate Limiting

### Limits

- **AI Endpoints**: 10 requests/minute per user
- **General API**: No hard limit (monitored)

### Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 45
```

### Response (429)

```json
{
  "error": "Rate limit exceeded",
  "rateLimit": {
    "limit": 10,
    "remaining": 0,
    "resetIn": 45
  }
}
```

---

## Webhooks

### Stripe Webhook

**POST** `/api/webhooks/stripe`

Handles Stripe payment events.

**Auth**: Stripe signature verification

**Events Handled**:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Internal Endpoints

These endpoints are for internal use only and require `WORKER_SECRET` authentication.

### Execute Post

**POST** `/api/workers/execute-post`

Publishes a scheduled post.

**Auth**: Bearer token (WORKER_SECRET)

---

### Retry Post

**POST** `/api/workers/retry-post`

Retries a failed post.

**Auth**: Bearer token (WORKER_SECRET)

---

### Fail Post

**POST** `/api/workers/fail-post`

Marks a post as failed.

**Auth**: Bearer token (WORKER_SECRET)

---

## Cron Endpoints

These endpoints are for scheduled maintenance and require `CRON_SECRET` authentication.

### Token Refresh

**POST** `/api/cron/token-refresh`

Refreshes expiring OAuth tokens.

**Auth**: Bearer token (CRON_SECRET)

---

### Session Cleanup

**POST** `/api/cron/session-cleanup`

Removes expired sessions.

**Auth**: Bearer token (CRON_SECRET)

---

### Job Cleanup

**POST** `/api/cron/job-cleanup`

Cleans old BullMQ jobs.

**Auth**: Bearer token (CRON_SECRET)

---

### Media Cleanup

**POST** `/api/cron/media-cleanup`

Removes orphaned media files.

**Auth**: Bearer token (CRON_SECRET)

---

## Support

For issues or questions:
- Review this documentation
- Check [STRUCTURE.md](./STRUCTURE.md)
- See [CHANGELOG.md](./CHANGELOG.md)
- Open a GitHub issue

**Last Updated**: December 19, 2025
