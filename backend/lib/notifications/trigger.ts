import { Queue } from 'bullmq';
import * as dotenv from 'dotenv';
import { Redis } from 'ioredis';

dotenv.config();

let notificationQueue: Queue | null = null;

function getNotificationQueue() {
    if (notificationQueue) return notificationQueue;

    if (!process.env.REDIS_URL) {
        throw new Error('REDIS_URL is not defined');
    }

    const connection = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
    });

    notificationQueue = new Queue('notifications-queue', {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: true,
        }
    });

    return notificationQueue;
}

type NotificationPayload = {
    userId: string;
    type: 'post_failed' | 'post_published' | 'weekly_digest';
    data: any;
};

export async function triggerNotification({ userId, type, data }: NotificationPayload) {
    try {
        const queue = getNotificationQueue();
        await queue.add(type, { userId, type, data });
    } catch (error) {
        console.error('Failed to trigger notification:', error);
        // Do not throw, to prevent crashing the calling flow
    }
}

