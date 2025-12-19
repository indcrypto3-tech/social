
export interface OAuthProviderConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}

export interface AuthUrlResult {
    url: string;
    state: string;
    verifier?: string; // For PKCE
}

export interface TokenExchangeResult {
    accessToken: string;
    refreshToken?: string | null;
    expiresIn?: number; // seconds
}

export interface SocialProfile {
    id: string;
    username: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    rawData?: any;
}

export interface OAuthProvider {
    name: string;
    getAuthUrl(state: string, verifier?: string): Promise<string>;

    exchangeCode(code: string, verifier?: string): Promise<TokenExchangeResult>;
    getUserProfile(accessToken: string): Promise<SocialProfile>;
    refreshAccessToken?(refreshToken: string): Promise<TokenExchangeResult>;
}
