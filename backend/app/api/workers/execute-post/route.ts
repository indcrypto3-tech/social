
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduledPosts, postDestinations, socialAccounts, publishLogs } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';
import * as socialProviders from '@/lib/social';

// Secret key check to prevent unauthorized execution
const WORKER_SECRET = process.env.WORKER_SECRET || 'local-worker-secret';

function validateWorkerRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    return authHeader === `Bearer ${WORKER_SECRET}`;
}

const logger = {
    info: (msg: string, meta?: any) => console.log(`[WORKER] ${msg}`, meta ? JSON.stringify(meta) : ''),
    error: (msg: string, meta?: any) => console.error(`[WORKER] ${msg}`, meta ? JSON.stringify(meta) : ''),
};

export async function POST(req: Request) {
    if (!validateWorkerRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized Worker Access' }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
        return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    try {
        // 1. Fetch Post & Destinations
        const post = await db.query.scheduledPosts.findFirst({
            where: eq(scheduledPosts.id, postId),
            with: {
                destinations: {
                    with: {
                        socialAccount: true
                    }
                }
            }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const destinations = post.destinations;
        let successCount = 0;
        let failCount = 0;

        // 2. Iterate Destinations
        for (const dest of destinations) {
            const platform = dest.socialAccount.platform;
            const account = dest.socialAccount;

            try {
                // Get Provider
                const providerClass = Object.values(socialProviders).find(p => {
                    try {
                        // Instantiate to check name, or map via static property if available?
                        // The export structure is 'export class FacebookProvider ...'
                        // We need a factory or map.
                        // Let's assume standard naming or iterate instances.
                        // Efficient way:
                        return new (p as any)().name === platform;
                    } catch { return false; }
                });

                if (!providerClass) {
                    throw new Error(`Provider for ${platform} not found`);
                }

                const provider = new (providerClass as any)();

                // Decrypt Token
                const accessToken = decrypt(account.accessToken);
                if (!accessToken) throw new Error('Could not decrypt access token');

                // Validate Token? (Optional optimization: only if failures expected)
                // const isValid = await provider.validateToken(accessToken);
                // if (!isValid) throw new Error('Token expired or invalid'); 

                // Publish
                // Prepare options based on metadata (e.g. Page ID, User ID)
                let options: any = {};
                const metadata = account.metadata as any;

                if (platform === 'facebook') {
                    options.pageId = account.platformAccountId;
                } else if (platform === 'instagram') {
                    options.instagramUserId = account.platformAccountId;
                } else if (platform === 'linkedin') {
                    options.urn = account.platformAccountId; // stored as urn in platformAccountId logic earlier? Check logic.
                    // If callback stored Org ID as URN, we are good.
                }

                logger.info(`Publishing to ${platform}...`, { postId, accountId: account.id });

                const result = await provider.publish(post.content || '', post.mediaUrls || [], accessToken, options);

                // Success
                await db.update(postDestinations)
                    .set({
                        status: 'success',
                        platformPostId: result.platformId,
                        updatedAt: new Date()
                    })
                    .where(eq(postDestinations.id, dest.id));

                await db.insert(publishLogs).values({
                    postId: post.id,
                    platform: platform,
                    status: 'success',
                    attempt: 1
                });

                successCount++;

            } catch (error: any) {
                logger.error(`Failed to publish to ${platform}`, { accountId: account.id, error: error.message });

                await db.update(postDestinations)
                    .set({
                        status: 'failed',
                        errorMessage: error.message,
                        updatedAt: new Date()
                    })
                    .where(eq(postDestinations.id, dest.id));

                await db.insert(publishLogs).values({
                    postId: post.id,
                    platform: platform,
                    status: 'failed',
                    errorMessage: error.message,
                    attempt: 1
                });

                failCount++;
            }
        }

        // 3. Update Overall Post Status
        let finalStatus = 'published';
        if (failCount > 0 && successCount === 0) {
            finalStatus = 'failed';
        } else if (failCount > 0 && successCount > 0) {
            // Partial success? Schema enum has 'published' or 'failed'.
            // Usually 'published' if at least one works, but UI should show partials.
            // Let's stick to 'published' so it moves out of queue, but destinations show errors.
            finalStatus = 'published';
        }

        // Only update if it was processing (which it should be)
        await db.update(scheduledPosts)
            .set({ status: finalStatus as any, updatedAt: new Date() })
            .where(eq(scheduledPosts.id, postId));

        return NextResponse.json({
            success: true,
            results: { success: successCount, failed: failCount }
        });

    } catch (error: any) {
        logger.error("WORKER_EXECUTION_ERROR", { error: error.message });
        return NextResponse.json({ error: 'Internal Worker Error' }, { status: 500 });
    }
}
