
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { generatePKCE, generateState } from './pkce';

const COOKIE_NAME_PREFIX = 'oauth_state_';
const COOKIE_MAX_AGE = 60 * 10; // 10 minutes

export interface OAuthStateData {
    state: string;
    verifier?: string;
    userId: string;
    platform: string;
}

export class OAuthStateManager {
    static async create(userId: string, platform: string) {
        const state = generateState();
        const { verifier, challenge } = generatePKCE();

        const data: OAuthStateData = {
            state,
            verifier,
            userId,
            platform
        };

        // We use a dynamic cookie name to allow multiple concurrent flows if needed, 
        // but typically one is enough. For simplicity, we use one per platform or just one global.
        // Let's use one per platform to avoid collisions.
        const cookieName = `${COOKIE_NAME_PREFIX}${platform}`;

        cookies().set(cookieName, JSON.stringify(data), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-site cookie usage in Prod
            maxAge: COOKIE_MAX_AGE,
            path: '/',
        });

        return { state, verifier, challenge };
    }

    static validate(platform: string, incomingState: string) {
        const cookieName = `${COOKIE_NAME_PREFIX}${platform}`;
        const cookieStore = cookies();
        const storedCookie = cookieStore.get(cookieName);

        if (!storedCookie || !storedCookie.value) {
            throw new Error('Session expired or invalid cookie');
        }

        let data: OAuthStateData;
        try {
            data = JSON.parse(storedCookie.value);
        } catch (e) {
            throw new Error('Invalid cookie data');
        }

        if (data.state !== incomingState) {
            throw new Error('State mismatch - possible CSRF attack');
        }

        // Cleanup
        cookieStore.delete(cookieName);

        return data;
    }
}
