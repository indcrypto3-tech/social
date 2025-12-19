
import { Queue } from 'bullmq';
import { getRedis } from '../lib/redis';

// Use same name as worker will use
export const PUBLISHING_QUEUE_NAME = 'publishing-queue';

// Lazy load Function to get Queue instance
let publishingQueue: Queue | null = null;

export function getPublishingQueue() {
    if (!publishingQueue) {
        // Reuse general Redis connection for Queue management if possible, 
        // but BullMQ usually manages its own connections or takes connection opts.
        // We can pass the IOredis connection instance or connection config.
        const connection = getRedis();
        publishingQueue = new Queue(PUBLISHING_QUEUE_NAME, { connection });
    }
    return publishingQueue;
}
