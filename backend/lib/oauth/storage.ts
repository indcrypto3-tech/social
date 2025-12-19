
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { platformEnum } from '@/lib/db/schema';
import { SocialProfile, TokenExchangeResult } from './types';
import { encrypt } from '@/lib/crypto';

export class OAuthAccountStorage {
    static async storeAccount(
        userId: string,
        platform: string,
        tokens: TokenExchangeResult,
        profile: SocialProfile
    ) {
        // Calculate expiration date if provided
        let expiresAt: Date | null = null;
        if (tokens.expiresIn) {
            expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
        }

        // Validate platform enum
        const platformKey = platform as (typeof platformEnum.enumValues)[number];
        const encryptedAccessToken = encrypt(tokens.accessToken);
        const encryptedRefreshToken = tokens.refreshToken ? encrypt(tokens.refreshToken) : null;

        await db.insert(socialAccounts).values({
            userId: userId,
            platform: platformKey,
            platformAccountId: profile.id,
            accountName: profile.username || profile.name || 'Unknown',
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            tokenExpiresAt: expiresAt,
            metadata: {
                name: profile.name,
                username: profile.username,
                email: profile.email,
                avatar_url: profile.avatarUrl,
                ...profile.rawData
            },
        }).onConflictDoUpdate({
            target: [socialAccounts.platform, socialAccounts.platformAccountId],
            set: {
                userId: userId, // Claim ownership
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                tokenExpiresAt: expiresAt,
                accountName: profile.username || profile.name || 'Unknown',
                metadata: {
                    name: profile.name,
                    username: profile.username,
                    email: profile.email,
                    avatar_url: profile.avatarUrl,
                    ...profile.rawData
                },
                updatedAt: new Date(),
                isActive: true
            }
        });
    }
}
