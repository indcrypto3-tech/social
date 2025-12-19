
import { Worker, Queue, Job } from 'bullmq';
import { Redis as IORedis } from 'ioredis';

const QUEUE_NAME = 'media-cleanup';
const WORKER_SECRET = process.env.WORKER_SECRET || 'local-worker-secret';
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';

export async function processMediaCleanup(job: Job) {
    console.log(`[MediaCleanup] Starting cleanup...`);

    try {
        // Call the cleanup API endpoint
        const response = await fetch(`${API_BASE_URL}/api/media/cleanup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WORKER_SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Cleanup API failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`[MediaCleanup] Finished. Deleted: ${result.deleted}, Failed: ${result.failed}`);

        return result;
    } catch (error) {
        console.error('[MediaCleanup] Error:', error);
        throw error;
    }
}

export function startMediaCleanupWorker(connection: IORedis) {
    const queue = new Queue(QUEUE_NAME, { connection });

    // Schedule cleanup to run daily at 2 AM
    queue.add('cleanup', {}, {
        repeat: {
            pattern: '0 2 * * *' // Daily at 2 AM
        }
    });

    const worker = new Worker(QUEUE_NAME, processMediaCleanup, {
        connection,
        concurrency: 1
    });

    worker.on('completed', (job) => {
        console.log(`[MediaCleanup] Job ${job.id} completed.`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[MediaCleanup] Job ${job?.id} failed:`, err);
    });

    return worker;
}
