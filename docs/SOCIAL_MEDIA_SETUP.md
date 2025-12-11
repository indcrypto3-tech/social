# Social Media API Setup Guide

This guide explains how to configure Social Login (OAuth) for the Social Media Scheduler. Since we rely on Supabase Auth for handling the Oauth handshake, you will need to create applications on the respective developer platforms and add the keys to your Supabase project.

## General Prerequisites

1.  **Supabase Project**: Ensure you have a Supabase project running (locally or hosted).
2.  **Callback URL**: You will need to provide a "Callback URL" or "Redirect URI" to the social platforms.
    *   **Local Development**: `http://127.0.0.1:54321/auth/v1/callback` (Default Supabase CLI port)
    *   **Production**: `https://<your-project-ref>.supabase.co/auth/v1/callback`

---

## 1. Facebook & Instagram (Meta)

To connect Facebook Pages and Instagram Business accounts, you need a Meta App.

1.  Go to [Meta for Developers](https://developers.facebook.com/).
2.  Click **My Apps** > **Create App**.
3.  Select **Business** as the app type.
4.  Fill in the details and create the app.
5.  **Add Products**:
    *   **Facebook Login for Business**: Click "Set Up".
    *   In settings, add your **Valid OAuth Redirect URIs** (see General Prerequisites above).
6.  **Get Keys**:
    *   Go to **App Settings** > **Basic**.
    *   Copy **App ID** and **App Secret**.
7.  **Supabase Configuration**:
    *   In Supabase Dashboard: **Authentication** > **Providers** > **Facebook**.
    *   Enable it and paste the App ID and Secret.

*Note: For Instagram posting, you will use the same Facebook Login flow, as Instagram Business accounts are connected via Facebook Pages.*

---

## 2. X (Twitter)

1.  Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2.  Create a **Project** and then an **App**.
3.  Go to **User Authentication Settings** > **Set up**.
    *   **App Permissions**: Select primarily **Read and Write** (and Offline access if available).
    *   **Type of App**: Web App, Automated App or Bot.
    *   **Callback URI / Redirect URL**: Add your Supabase Callback URL.
    *   **Website URL**: Your app's homepage (e.g., `http://localhost:3000`).
4.  **Get Keys**:
    *   Go to **Keys and Tokens**.
    *   Copy the **API Key** (Consumer Key) and **API Key Secret** (Consumer Secret).
    *   *Important*: Do not use the "Bearer Token" or "Client ID" (OAuth 2.0 specific) unless explicitly configuring Supabase for OAuth 2.0 (Supabase mostly uses OA1.0a or 2.0 depending on settings, usually Consumer Keys are safest).
5.  **Supabase Configuration**:
    *   In Supabase Dashboard: **Authentication** > **Providers** > **Twitter**.
    *   Enable it and paste the API Key and Secret.

---

## 3. LinkedIn

1.  Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps).
2.  Click **Create App**.
3.  Fill in the form (you will need a LinkedIn Page to associate with).
4.  **Products**:
    *   Request access to **Sign In with LinkedIn using OpenID Connect** (required for login).
    *   Request access to **Share on LinkedIn** (required for posting).
5.  **Auth Settings**:
    *   edit **Authorized redirect URLs for your app** and add the Supabase Callback URL.
6.  **Get Keys**:
    *   Go to **Auth** tab.
    *   Copy **Client ID** and **Client Secret**.
7.  **Supabase Configuration**:
    *   In Supabase Dashboard: **Authentication** > **Providers** > **LinkedIn**.
    *   Enable it and paste the Client ID and Secret.

---

## 4. Google (YouTube)

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new Project.
3.  **APIs & Services**:
    *   Enable **YouTube Data API v3**.
4.  **OAuth Consent Screen**:
    *   Configure it (External).
    *   Add test users if in testing mode.
5.  **Credentials**:
    *   Create Credentials > **OAuth client ID**.
    *   Type: **Web application**.
    *   **Authorized redirect URIs**: Add your Supabase Callback URL.
6.  **Get Keys**:
    *   Copy **Client ID** and **Client Secret**.
7.  **Supabase Configuration**:
    *   In Supabase Dashboard: **Authentication** > **Providers** > **Google**.
    *   Enable it and paste the keys.
    *   *Crucial*: You must add `https://www.googleapis.com/auth/youtube` (and others) to the **Scopes** list in your application code or Supabase settings if supported.

---

## Summary of Supabase Setup

After collecting the keys:

1.  Open your Supabase Project Dashboard (or visit `http://127.0.0.1:54323/project/default/auth/providers` locally).
2.  Enable the provider you want to use.
3.  Paste the **Client ID** and **Client Secret**.
4.  Save.
