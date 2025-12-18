
import { OAuthProvider } from './types';
import { TwitterProvider } from './providers/twitter';

export const PROVIDERS: Record<string, any> = {
    'twitter': TwitterProvider,
};

export function getProvider(platform: string): OAuthProvider {
    const ProviderClass = PROVIDERS[platform];
    if (!ProviderClass) {
        throw new Error(`Provider ${platform} not implemented`);
    }
    return new ProviderClass();
}
