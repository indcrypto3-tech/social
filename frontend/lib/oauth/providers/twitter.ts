
import { OAuthProvider, TokenExchangeResult, SocialProfile } from '../types';

export class TwitterProvider implements OAuthProvider {
    name = 'twitter';
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor() {
        this.clientId = process.env.X_CLIENT_ID!;
        this.clientSecret = process.env.X_CLIENT_SECRET!;
        this.redirectUri = process.env.X_CALLBACK_URL || 'http://localhost:3000/api/oauth/twitter/callback';

        if (!this.clientId || !this.clientSecret) {
            throw new Error('Missing Twitter (X) credentials');
        }
    }

    async getAuthUrl(state: string, challenge: string, redirectUri?: string): Promise<string> {
        const finalRedirectUri = redirectUri || this.redirectUri;
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: finalRedirectUri,
            scope: 'tweet.read tweet.write users.read offline.access',
            state: state,
            code_challenge: challenge,
            code_challenge_method: 'S256',
        });

        return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    }

    async exchangeCode(code: string, verifier: string, redirectUri?: string): Promise<TokenExchangeResult> {
        const finalRedirectUri = redirectUri || this.redirectUri;
        const tokenParams = new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: this.clientId,
            redirect_uri: finalRedirectUri,
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
}
