
import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';

const CRON_SECRET = process.env.CRON_SECRET || process.env.WORKER_SECRET || 'local-cron-secret';

function validateCronRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    return authHeader === `Bearer ${CRON_SECRET}`;
}

export async function POST(req: Request) {
    if (!validateCronRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        logger.info('[CRON] Starting BullMQ job cleanup');

        const connection = getRedis();
        const queueNames = ['publishing-queue', 'analytics-sync', 'media-cleanup'];

        let totalCleaned = 0;

        for (const queueName of queueNames) {
            try {
                const queue = new Queue(queueName, { connection });

                // Clean completed jobs older than 24 hours
                const completed = await queue.clean(24 * 60 * 60 * 1000, 1000, 'completed');

                // Clean failed jobs older than 7 days
                const failed = await queue.clean(7 * 24 * 60 * 60 * 1000, 1000, 'failed');

                const cleaned = completed.length + failed.length;
                totalCleaned += cleaned;

                logger.info(`[CRON] Cleaned ${cleaned} jobs from ${queueName}`);
            } catch (error: any) {
                logger.error(`[CRON] Failed to clean queue ${queueName}`, error);
            }
        }

        logger.info(`[CRON] Job cleanup completed. Total cleaned: ${totalCleaned}`);

        return NextResponse.json({
            success: true,
            cleaned: totalCleaned
        });

    } catch (error: any) {
        logger.error('[CRON] Job cleanup failed', error);
        return NextResponse.json({
            error: 'Job cleanup failed',
            details: error.message
        }, { status: 500 });
    }
}
