export interface PublishResult {
    platformId: string;
    url?: string;
    errors?: any;
}

export interface SocialProvider {
    name: string;
    validateToken(token: string): Promise<boolean>;
    publish(content: string, mediaUrls: string[], accessToken: string, options?: any): Promise<PublishResult>;
}

export * from './instagram';
export * from './facebook';
export * from './twitter';
export * from './linkedin';
export * from './tiktok';
export * from './youtube';
