
import { OAuthProvider, TokenExchangeResult, SocialProfile } from '../types';

export class LinkedInProvider implements OAuthProvider {
    name = 'linkedin';
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor() {
        this.clientId = process.env.LINKEDIN_CLIENT_ID!;
        this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
        this.redirectUri = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/api/oauth/linkedin/callback';

        if (!this.clientId || !this.clientSecret) {
            console.warn('Missing LinkedIn credentials');
        }
    }

    async getAuthUrl(state: string): Promise<string> {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            state: state,
            scope: 'r_liteprofile w_member_social r_organization_social',
        });

        return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    }

    async exchangeCode(code: string): Promise<TokenExchangeResult> {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });

        const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            throw new Error(`LinkedIn Token Exchange Failed: ${await response.text()}`);
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            expiresIn: data.expires_in,
            refreshToken: data.refresh_token, // LinkedIn V2 usually doesn't give refresh tokens easily for all scopes, but checking docs
        };
    }

    async getUserProfile(accessToken: string): Promise<SocialProfile> {
        // r_liteprofile endpoint
        const response = await fetch('https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`LinkedIn User Fetch Failed: ${await response.text()}`);
        }

        const data = await response.json();

        // Helper to extract image
        let avatarUrl = null;
        if (data.profilePicture && data.profilePicture['displayImage~'] && data.profilePicture['displayImage~'].elements) {
            const elements = data.profilePicture['displayImage~'].elements;
            if (elements.length > 0) {
                avatarUrl = elements[0].identifiers[0].identifier;
            }
        }

        const firstName = Object.values(data.firstName.localized)[0] as string;
        const lastName = Object.values(data.lastName.localized)[0] as string;
        const fullName = `${firstName} ${lastName}`;

        return {
            id: data.id,
            username: fullName, // LinkedIn doesn't give a handle publicly
            name: fullName,
            avatarUrl: avatarUrl || undefined,
            rawData: data
        };
    }

    async getOrganizations(accessToken: string) {
        const response = await fetch('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organizationalTarget~(id,localizedName,logoV2(original~:playableStreams))))', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            },
        });

        if (!response.ok) {
            // If this fails (e.g. no permission), just return empty
            console.warn('Failed to fetch LinkedIn Orgs', await response.text());
            return [];
        }

        const data = await response.json();
        return data.elements || [];
    }
}
