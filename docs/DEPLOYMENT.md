# Deployment Guide

This guide describes how to deploy Autopostr as two separate services on Vercel.

## 1. Prerequisites
- Two Vercel Projects (e.g., `autopostr-frontend` and `autopostr-backend`).
- A Production Database (PostgreSQL) URL.
- A Production Redis URL.
- Supabase Project (Auth & DB).

## 2. Backend Deployment (`autopostr-backend`)
1.  **Framework Preset**: Next.js
2.  **Root Directory**: `backend`
3.  **Build Command**: `next build` (Default)
4.  **Install Command**: `npm install` (Default)
5.  **Environment Variables**:
    *   `DATABASE_URL`: `postgres://...`
    *   `REDIS_URL`: `redis://...`
    *   `NEXT_PUBLIC_SUPABASE_URL`: `https://...`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `...`
    *   `FRONTEND_URL`: `https://your-frontend-domain.vercel.app` (Required for CORS)
    *   `OAUTH_CLIENT_SECRETS`: (Twitter, Google, etc.)

## 3. Frontend Deployment (`autopostr-frontend`)
1.  **Framework Preset**: Next.js
2.  **Root Directory**: `frontend`
3.  **Build Command**: `next build` (Default)
4.  **Install Command**: `npm install` (Default)
5.  **Environment Variables**:
    *   `NEXT_PUBLIC_SUPABASE_URL`: `https://...`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `...`
    *   `NEXT_PUBLIC_BACKEND_URL`: `https://your-backend-domain.vercel.app` (Required for API Calls)
    *   `NEXT_PUBLIC_APP_URL`: `https://your-frontend-domain.vercel.app`

## 4. Post-Deployment Checks
1.  Verify `NEXT_PUBLIC_BACKEND_URL` is set on Frontend.
2.  Verify `FRONTEND_URL` is set on Backend.
3.  Check Browser Console for CORS errors.
4.  Test Login flow (Supabase Auth -> Session Sync).
5.  Test OAuth Connection (Redirects to Backend -> Back to Frontend).
