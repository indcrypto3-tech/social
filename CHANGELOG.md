# Changelog

## [Unreleased] - 2025-12-20

### Fixed
- **API Connectivity**: Audited and fixed frontend-backend communication to ensure all requests routed through the shared API client and proxy.
- **Billing**: Updated `BillingContent` component to use the shared `apiClient` instead of direct `fetch` calls.
- **OAuth**:
    - Removed legacy `frontend/lib/oauth` and `frontend/app/api/oauth` code to prevent logic duplication.
    - Updated Backend Twitter Provider to default to `localhost:3000` (Frontend) callback URL for correct local development flow.
    - Updated Backend Facebook & LinkedIn Providers to support `NEXT_PUBLIC_APP_URL` fallback.
- **Docs**: Updated `STRUCTURE.md` to reflect the Proxy/Rewrite architecture.

### Removed
- Legacy Supabase OAuth components in Frontend (delegated to Backend).
