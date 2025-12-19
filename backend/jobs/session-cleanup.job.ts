
import { Worker, Queue, Job } from 'bullmq';
import { db } from '../lib/db';
import { sessions } from '../lib/db/schema';
import { lt } from 'drizzle-orm';
import { Redis as IORedis } from 'ioredis';

const QUEUE_NAME = 'session-cleanup';

export async function processSessionCleanup(job: Job) {
    console.log(`[SessionCleanup] Starting cleanup...`);

    // Delete from DB where expiresAt < now
    const now = new Date();

    // Using Drizzle to delete expired sessions
    try {
        const result = await db.delete(sessions)
            .where(lt(sessions.expiresAt, now))
            .returning({ id: sessions.id });

        const count = result.length;
        console.log(`[SessionCleanup] Finished. Removed ${count} expired sessions.`);
        return { removed: count };
    } catch (error) {
        console.error('[SessionCleanup] Error removing expired sessions:', error);
        throw error;
    }
}

export function startSessionCleanupWorker(connection: IORedis) {
    // Ensure the repeatable job exists
    const queue = new Queue(QUEUE_NAME, { connection });

    // Add job if not exists (upsert)
    // Runs every hour
    queue.add('cleanup', {}, {
        repeat: {
            pattern: '0 * * * *'
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
