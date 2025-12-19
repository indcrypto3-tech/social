
import { Worker, Queue, Job } from 'bullmq';
import { Redis as IORedis } from 'ioredis';
import { db } from '../lib/db';
import { socialAccounts, analyticsSnapshots } from '../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '../lib/crypto';

const QUEUE_NAME = 'analytics-sync';

interface AnalyticsSyncJobData {
    userId: string;
    accountId?: string; // Optional: sync specific account
}

async function fetchPlatformMetrics(platform: string, accessToken: string, accountId: string) {
    // This is a placeholder - in production, you'd call actual platform APIs

    try {
        switch (platform) {
            case 'facebook':
                return await fetchFacebookMetrics(accessToken, accountId);
            case 'instagram':
                return await fetchInstagramMetrics(accessToken, accountId);
            case 'twitter':
                return await fetchTwitterMetrics(accessToken);
            case 'linkedin':
                return await fetchLinkedInMetrics(accessToken, accountId);
            default:
                return null;
        }
    } catch (error) {
        console.error(`Failed to fetch metrics for ${platform}:`, error);
        return null;
    }
}

async function fetchFacebookMetrics(accessToken: string, pageId: string) {
    // Facebook Graph API call
    const response = await fetch(
        `https://graph.facebook.com/${pageId}?fields=followers_count,fan_count&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Facebook API error');
    }

    const data = await response.json();
    return {
        followers: data.fan_count || data.followers_count || 0,
        impressions: 0, // Would need insights API
        engagement: 0
    };
}

async function fetchInstagramMetrics(accessToken: string, igUserId: string) {
    // Instagram Graph API call
    const response = await fetch(
        `https://graph.facebook.com/${igUserId}?fields=followers_count&access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Instagram API error');
    }

    const data = await response.json();
    return {
        followers: data.followers_count || 0,
        impressions: 0, // Would need insights API
        engagement: 0
    };
}

async function fetchTwitterMetrics(accessToken: string) {
    // Twitter API v2 call
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error('Twitter API error');
    }

    const data = await response.json();
    return {
        followers: data.data?.public_metrics?.followers_count || 0,
        impressions: 0,
        engagement: 0
    };
}

async function fetchLinkedInMetrics(accessToken: string, urn: string) {
    // LinkedIn API call - simplified
    // Note: LinkedIn has complex analytics API
    return {
        followers: 0, // Would need proper API call
        impressions: 0,
        engagement: 0
    };
}

export async function processAnalyticsSync(job: Job<AnalyticsSyncJobData>) {
    const { userId, accountId } = job.data;

    console.log(`[AnalyticsSync] Starting sync for user ${userId}`);

    try {
        // Get accounts to sync
        let accounts;
        if (accountId) {
            const account = await db.query.socialAccounts.findFirst({
                where: and(
                    eq(socialAccounts.id, accountId),
                    eq(socialAccounts.userId, userId)
                )
            });
            accounts = account ? [account] : [];
        } else {
            accounts = await db.query.socialAccounts.findMany({
                where: and(
                    eq(socialAccounts.userId, userId),
                    eq(socialAccounts.isActive, true)
                )
            });
        }

        let syncedCount = 0;
        let failedCount = 0;

        for (const account of accounts) {
            try {
                // Decrypt access token
                const accessToken = decrypt(account.accessToken);

                // Fetch metrics from platform
                const metrics = await fetchPlatformMetrics(
                    account.platform,
                    accessToken,
                    account.platformAccountId
                );

                if (metrics) {
                    // Store snapshot
                    await db.insert(analyticsSnapshots).values({
                        userId: userId,
                        platform: account.platform,
                        followers: metrics.followers,
                        impressions: metrics.impressions,
                        engagement: metrics.engagement,
                        date: new Date()
                    });

                    syncedCount++;
                    console.log(`[AnalyticsSync] Synced ${account.platform} - ${account.accountName}`);
                } else {
                    failedCount++;
                }

            } catch (error) {
                console.error(`[AnalyticsSync] Failed to sync account ${account.id}:`, error);
                failedCount++;
            }
        }

        console.log(`[AnalyticsSync] Completed. Synced: ${syncedCount}, Failed: ${failedCount}`);

        return {
            synced: syncedCount,
            failed: failedCount
        };

    } catch (error) {
        console.error('[AnalyticsSync] Error:', error);
        throw error;
    }
}

export function startAnalyticsSyncWorker(connection: IORedis) {
    const queue = new Queue(QUEUE_NAME, { connection });

    // Schedule analytics sync to run every 6 hours
    queue.add('sync-all-users', {}, {
        repeat: {
            pattern: '0 */6 * * *' // Every 6 hours
        }
    });

    const worker = new Worker(QUEUE_NAME, processAnalyticsSync, {
        connection,
        concurrency: 5 // Process 5 users concurrently
    });

    worker.on('completed', (job) => {
        console.log(`[AnalyticsSync] Job ${job.id} completed.`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[AnalyticsSync] Job ${job?.id} failed:`, err);
    });

    return worker;
}
