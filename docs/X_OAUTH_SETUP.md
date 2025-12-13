# X (Twitter) OAuth Setup Guide

This guide explains how to obtain the necessary credentials to connect X (Twitter) user accounts to your application.

## Prerequisites

- An X (Twitter) account
- Access to the [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)

## Steps to Get X OAuth Credentials

### 1. Create a Developer Account

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your X account
3. Apply for a developer account if you haven't already
4. Complete the application form with your use case

### 2. Create a New Project and App

1. Once approved, click **"Create Project"**
2. Give your project a name (e.g., "Social Media Scheduler")
3. Select your use case
4. Provide a project description
5. Create a new App within the project

### 3. Configure App Settings

1. Navigate to your app's settings
2. Under **"User authentication settings"**, click **"Set up"**
3. Configure the following:
   - **App permissions**: Select "Read and write" (or "Read and write and Direct message" if needed)
   - **Type of App**: Select "Web App, Automated App or Bot"
   - **App info**:
     - Callback URL: `http://localhost:4000/api/auth/callback/twitter` (for development)
     - Website URL: Your app's URL
     - Terms of Service: Your terms URL (optional for development)
     - Privacy Policy: Your privacy policy URL (optional for development)
4. Save your settings

### 4. Get Your Credentials

After setting up authentication, you'll receive:

#### OAuth 2.0 Credentials
- **Client ID**: Found in the "OAuth 2.0 Client ID and Client Secret" section
- **Client Secret**: Found in the same section (save this immediately, it's only shown once)

#### API Keys (OAuth 1.0a - if needed)
- **API Key**: Also called Consumer Key
- **API Secret**: Also called Consumer Secret

#### Bearer Token
- Found in the "Bearer Token" section
- Used for app-only authentication

### 5. Add Credentials to Your .env File

Add the following to your `backend/.env` file:

```bash
# X (Twitter) OAuth 2.0
X_CLIENT_ID=your-actual-client-id
X_CLIENT_SECRET=your-actual-client-secret
X_BEARER_TOKEN=your-actual-bearer-token
X_CALLBACK_URL=http://localhost:4000/api/auth/callback/twitter
```

Add to your `frontend/.env` file:

```bash
# X (Twitter) OAuth
NEXT_PUBLIC_X_CALLBACK_URL=http://localhost:4000/api/auth/callback/twitter
```

### 6. Update Callback URL for Production

When deploying to production, update the callback URL in both:
1. X Developer Portal app settings
2. Your production environment variables

Example production callback:
```
https://yourdomain.com/api/auth/callback/twitter
```

## Important Notes

### Security
- **Never commit your `.env` file** to version control
- Keep your Client Secret and Bearer Token secure
- Rotate credentials if they're ever exposed
- Use different credentials for development and production

### Rate Limits
- X API has rate limits based on your access level
- Free tier: Limited requests per 15-minute window
- Basic tier ($100/month): Higher limits
- Pro tier ($5,000/month): Even higher limits

### OAuth 2.0 vs OAuth 1.0a
- **OAuth 2.0**: Recommended for new integrations, simpler flow
- **OAuth 1.0a**: Legacy but still supported, more complex

This app uses OAuth 2.0 by default.

## Testing Your Integration

1. Start your backend server: `npm run dev` (in backend directory)
2. Start your frontend: `npm run dev` (in frontend directory)
3. Navigate to the account connection page
4. Click "Connect X Account"
5. You should be redirected to X for authorization
6. After authorizing, you'll be redirected back to your app

## Troubleshooting

### "Invalid callback URL" error
- Ensure the callback URL in your X app settings exactly matches the one in your code
- For localhost, use `http://` not `https://`

### "Invalid client credentials" error
- Double-check your Client ID and Client Secret
- Ensure there are no extra spaces or line breaks

### "App is suspended" error
- Check your X Developer Portal for any violations
- Ensure your app complies with X's Developer Agreement

## Resources

- [X API Documentation](https://developer.twitter.com/en/docs)
- [OAuth 2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)

## Support

If you encounter issues:
1. Check the [X API Status Page](https://api.twitterstat.us/)
2. Review the [X Developer Community](https://twittercommunity.com/)
3. Check your app's error logs for detailed error messages
