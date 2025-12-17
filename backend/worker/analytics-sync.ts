
import { Worker, Queue } from 'bullmq';
import { db } from '../lib/db';
import { socialAccounts, analyticsSnapshots } from '../lib/db/schema';
import { fetchInstagramAnalytics } from '../lib/analytics/instagram';
import { fetchFacebookAnalytics } from '../lib/analytics/facebook';
import { fetchTwitterAnalytics } from '../lib/analytics/twitter';
import { fetchLinkedInAnalytics } from '../lib/analytics/linkedin';
import { fetchYoutubeAnalytics } from '../lib/analytics/youtube';
import * as dotenv from 'dotenv';

dotenv.config();

const CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

export async function syncAnalytics() {
    console.log("[Analytics] Starting sync...");
    const accounts = await db.select().from(socialAccounts);

    for (const account of accounts) {
        try {
            let metrics = { followers: 0, impressions: 0, engagement: 0 };
            console.log(`[Analytics] Syncing ${account.platform} (${account.accountName})...`);

            switch (account.platform) {
                case 'instagram':
                    metrics = await fetchInstagramAnalytics(account.accessToken, account.platformAccountId);
                    break;
                case 'facebook':
                    metrics = await fetchFacebookAnalytics(account.accessToken, account.platformAccountId);
                    break;
                case 'twitter':
                    metrics = await fetchTwitterAnalytics(account.accessToken, account.platformAccountId);
                    break;
                case 'linkedin':
                    metrics = await fetchLinkedInAnalytics(account.accessToken, account.platformAccountId);
                    break;
                case 'youtube':
                    metrics = await fetchYoutubeAnalytics(account.accessToken, account.platformAccountId);
                    break;
                default:
                    continue;
            }

            await db.insert(analyticsSnapshots).values({
                userId: account.userId,
                platform: account.platform,
                followers: metrics.followers,
                impressions: metrics.impressions,
                engagement: metrics.engagement,
                date: new Date(),
            });

        } catch (error) {
            console.error(`[Analytics] Failed to sync account ${account.id}:`, error);
        }
    }
    console.log("[Analytics] Sync completed.");
}

// Ensure the queue exists and schedule the job
const queue = new Queue('analytics-queue', { connection: CONNECTION });

async function scheduleJob() {
    // Upsert the repeatable job
    await queue.add('sync-daily', {}, {
        repeat: {
            pattern: '0 0 * * *', // Daily at midnight
        },
        jobId: 'analytics-daily-sync' // Ensure one instance
    });
}

// Start worker
const worker = new Worker('analytics-queue', async (job) => {
    await syncAnalytics();
}, {
    connection: CONNECTION,
    concurrency: 1
});

worker.on('failed', (job, err) => {
    console.error(`[Analytics] Job failed:`, err);
});

scheduleJob()
    .then(() => console.log("[Analytics] Worker and Scheduler active."))
    .catch(console.error);
