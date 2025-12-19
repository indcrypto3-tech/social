import { OAuthProvider } from './types';
import { TwitterProvider } from './providers/twitter';
import { FacebookProvider } from './providers/facebook';
import { LinkedInProvider } from './providers/linkedin';

export const PROVIDERS: Record<string, any> = {
    'twitter': TwitterProvider,
    'facebook': FacebookProvider,
    'linkedin': LinkedInProvider,
};

export function getProvider(platform: string): OAuthProvider {
    const ProviderClass = PROVIDERS[platform];
    if (!ProviderClass) {
        throw new Error(`Provider ${platform} not implemented`);
    }
    return new ProviderClass();
}
