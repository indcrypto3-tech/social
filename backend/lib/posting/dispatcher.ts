import { db } from '../db';
import { postDestinations, publishLogs, socialAccounts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { FacebookProvider, InstagramProvider, TwitterProvider, LinkedInProvider, YouTubeProvider, TikTokProvider, SocialProvider } from '../social';
import { PostFormatter } from './formatter';
import { isRetryableError } from './retry-policy';

const providers: Record<string, SocialProvider> = {
    facebook: new FacebookProvider(),
    instagram: new InstagramProvider(),
    twitter: new TwitterProvider(),
    linkedin: new LinkedInProvider(),
    youtube: new YouTubeProvider(),
    tiktok: new TikTokProvider(),
};

export class PostDispatcher {
    static async dispatch(postId: string, accountId: string, content: string | null, mediaUrls: string[], options: any = {}) {
        // 1. Get Account
        const account = await db.query.socialAccounts.findFirst({
            where: eq(socialAccounts.id, accountId)
        });

        if (!account) throw new Error('Account not found');

        const provider = providers[account.platform];
        if (!provider) throw new Error(`Provider for ${account.platform} not implemented`);

        // 2. Format Content
        const formattedContent = PostFormatter.formatForPlatform(account.platform, content);

        // 3. Attempt Publish
        try {
            console.log(`[Dispatcher] Publishing to ${account.platform}...`);

            const result = await provider.publish(
                formattedContent,
                mediaUrls,
                account.accessToken,
                { ...options, ...account.metadata as any }
            );

            // 4. Success: Log & Update
            await db.insert(publishLogs).values({
                postId,
                platform: account.platform as any,
                status: 'success',
                attempt: options.attempt || 1,
            });

            await db.update(postDestinations)
                .set({
                    status: 'success',
                    platformPostId: result.platformId,
                    errorMessage: null
                })
                .where(
                    and(
                        eq(postDestinations.postId, postId),
                        eq(postDestinations.socialAccountId, accountId)
                    )
                );

            return result;

        } catch (error: any) {
            console.error(`[Dispatcher] Failed to publish to ${account.platform}:`, error);

            // 5. Failure: Log
            await db.insert(publishLogs).values({
                postId,
                platform: account.platform as any,
                status: 'failed',
                errorCode: error.code || 'UNKNOWN',
                errorMessage: error.message,
                attempt: options.attempt || 1,
            });

            // Update Destination Status
            await db.update(postDestinations)
                .set({
                    status: 'failed',
                    errorMessage: error.message
                })
                .where(
                    and(
                        eq(postDestinations.postId, postId),
                        eq(postDestinations.socialAccountId, accountId)
                    )
                );

            throw error; // Re-throw for Worker to catch and schedule retry
        }
    }
}
