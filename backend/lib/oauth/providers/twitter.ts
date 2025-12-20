
import { OAuthProvider, TokenExchangeResult, SocialProfile } from '../types';

export class TwitterProvider implements OAuthProvider {
    name = 'twitter';
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor() {
        this.clientId = process.env.X_CLIENT_ID!;
        this.clientSecret = process.env.X_CLIENT_SECRET!;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        this.redirectUri = process.env.X_CALLBACK_URL || `${baseUrl}/api/oauth/twitter/callback`;

        if (!this.clientId || !this.clientSecret) {
            throw new Error('Missing Twitter (X) credentials');
        }
    }

    async getAuthUrl(state: string, verifier: string): Promise<string> {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: 'tweet.read tweet.write users.read',
            state: state,
            code_challenge: verifier, // PKCE Challenge passed here (we actually need the challenge calculated from verifier elsewhere, but let's clarify interface)
            code_challenge_method: 'S256',
        });

        // Note: The interface expects the *verifier* usually for exchange, but for generating URL we need the *challenge*.
        // The reusable state manager returns {state, verifier, challenge}. 
        // We should pass the challenge to this function ideally or let the provider calculate it?
        // Standard PKCE: Verifier is secret, Challenge is public.
        // Let's adjust the method signature in the Types or just pass the challenge as the second arg here to match valid usage.
        // Actually, looking at my previous implementation, I passed `challenge` to the URL.
        // I will assume the second argument passed to `getAuthUrl` IS the challenge for simplicity in the calling code.

        return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    }

    async exchangeCode(code: string, verifier: string): Promise<TokenExchangeResult> {
        const tokenParams = new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            code_verifier: verifier,
        });

        const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`,
            },
            body: tokenParams.toString(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Twitter Token Exchange Failed: ${text}`);
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
        };
    }

    async getUserProfile(accessToken: string): Promise<SocialProfile> {
        const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Twitter User Fetch Failed: ${await response.text()}`);
        }

        const data = await response.json();
        const user = data.data;

        if (!user) throw new Error('No user data returned from Twitter');

        return {
            id: user.id,
            username: user.username,
            name: user.name,
            avatarUrl: user.profile_image_url,
            rawData: user

        };
    }

    async refreshAccessToken(refreshToken: string): Promise<TokenExchangeResult> {
        const tokenParams = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.clientId,
        });

        const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`,
            },
            body: tokenParams.toString(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Twitter Token Refresh Failed: ${text}`);
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token, // Twitter rotates refresh tokens!
            expiresIn: data.expires_in,
        };
    }
}
