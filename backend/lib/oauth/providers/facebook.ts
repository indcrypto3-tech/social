
import { OAuthProvider, TokenExchangeResult, SocialProfile } from '../types';

export class FacebookProvider implements OAuthProvider {
    name = 'facebook';
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor() {
        this.clientId = process.env.FACEBOOK_APP_ID!;
        this.clientSecret = process.env.FACEBOOK_APP_SECRET!;
        this.redirectUri = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/oauth/facebook/callback';

        if (!this.clientId || !this.clientSecret) {
            console.warn('Missing Facebook credentials (FACEBOOK_APP_ID or FACEBOOK_APP_SECRET)');
        }
    }

    async getAuthUrl(state: string): Promise<string> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            state: state,
            scope: 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,instagram_basic,instagram_content_publish',
            response_type: 'code',
        });

        return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
    }

    async exchangeCode(code: string): Promise<TokenExchangeResult> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            code: code,
        });

        const response = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Facebook Token Exchange Failed: ${error}`);
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            expiresIn: data.expires_in,
            // Facebook long-lived tokens logic is separate, but standard flow returns checks
        };
    }

    async getUserProfile(accessToken: string): Promise<SocialProfile> {
        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);

        if (!response.ok) {
            throw new Error(`Facebook User Fetch Failed: ${await response.text()}`);
        }

        const data = await response.json();

        return {
            id: data.id,
            username: data.name, // FB doesn't really have usernames for profiles anymore in API
            name: data.name,
            email: data.email,
            avatarUrl: data.picture?.data?.url,
            rawData: data
        };
    }

    async getPages(accessToken: string) {
        const response = await fetch(`https://graph.facebook.com/me/accounts?fields=id,name,access_token,picture,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}&limit=100`);

        if (!response.ok) {
            throw new Error(`Facebook Pages Fetch Failed: ${await response.text()}`);
        }

        const data = await response.json();
        return data.data || [];
    }
}
