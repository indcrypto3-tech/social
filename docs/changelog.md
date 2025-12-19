# Changelog

All notable changes to the Autopostr project will be documented in this file.

## [Unreleased]

## [1.0.0] - 2025-12-19

### Added
- **OAuth Architecture**: Implemented Backend-for-Frontend (BFF) pattern for social OAuth.
- **X (Twitter) Integration**: Added secure, backend-managed OAuth flow for X.
- **X Free Plan Support**: Optimized OAuth scopes to work with X Developer Free Plan (removed `offline.access`, limited scopes to `tweet.read`, `tweet.write`, `users.read`).
- **Documentation**: Added `STRUCTURE.md`, `changelog.md`, and updated setup guides.

### Changed
- **Rebranding**: Renamed application from "Social Scheduler" to **Autopostr**.
- **Frontend Refactor**: Removed direct Supabase OAuth dependencies from frontend components.
- **API**: Updated API base URL handling in frontend to prevent `Invalid URL` errors.
- **Sessions**: Improved session handling with a global SessionProvider.

### Removed
- **Legacy Code**: Removed deprecated root-level `app/`, `components/`, and `lib/` directories.
- **Supabase Social Auth**: Removed client-side social login features in favor of backend implementation.

### Fixed
- **Dashboard**: Fixed widget loading issues caused by undefined API URLs.
- **Auth Flow**: Resolved issues with Twitter OAuth callback loop and token persistence.
