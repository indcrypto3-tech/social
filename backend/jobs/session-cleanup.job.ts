import { Worker, Queue, Job } from 'bullmq';
import { getRedis } from '../lib/redis';
import { Redis as IORedis } from 'ioredis';

const QUEUE_NAME = 'session-cleanup';

export async function processSessionCleanup(job: Job) {
    console.log(`[SessionCleanup] Starting cleanup...`);
    const redis = getRedis(); // Uses IORedis
    let cursor = '0';
    let expiredCount = 0;
    let scannedCount = 0;

    const stream = redis.scanStream({
        match: 'session:*',
        count: 100
    });

    for await (const keys of stream) {
        if (keys.length > 0) {
            scannedCount += keys.length;
            // Pipeline to get values
            const pipeline = redis.pipeline();
            keys.forEach((key: string) => pipeline.get(key));
            const results = await pipeline.exec();

            if (results) {
                const now = new Date();
                const cleanupPipeline = redis.pipeline();

                results.forEach((result, index) => {
                    const [err, value] = result;
                    if (!err && value) {
                        try {
                            const session = JSON.parse(value as string);
                            if (session.expiresAt && new Date(session.expiresAt) < now) {
                                // Double check: Redis TTL should have removed it, but if persistent or orphaned
                                cleanupPipeline.del(keys[index]);
                                expiredCount++;
                            }
                        } catch (e) {
                            // Invalid JSON, delete?
                            // cleanupPipeline.del(keys[index]);
                        }
                    } else if (!value) {
                        // Key exists in scan but empty value? possibly expired just now.
                    }
                });

                if (expiredCount > 0) {
                    await cleanupPipeline.exec();
                }
            }
        }
    }

    console.log(`[SessionCleanup] Finished. Scanned: ${scannedCount}, Expired/Removed: ${expiredCount}`);
    return { scanned: scannedCount, expired: expiredCount };
}

export function startSessionCleanupWorker(connection: IORedis) {
    // Ensure the repeatable job exists
    const queue = new Queue(QUEUE_NAME, { connection });

    // Add job if not exists (upsert)
    queue.add('cleanup', {}, {
        repeat: {
            pattern: '0 * * * *' // Every hour
        }
    });

    const worker = new Worker(QUEUE_NAME, processSessionCleanup, {
        connection,
        concurrency: 1
    });

    worker.on('completed', (job) => {
        console.log(`[SessionCleanup] Job ${job.id} completed.`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[SessionCleanup] Job ${job?.id} failed:`, err);
    });

    return worker;
}
