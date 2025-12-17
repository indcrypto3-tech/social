
import { Queue } from 'bullmq';
import * as dotenv from 'dotenv';

dotenv.config();

const CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const notificationQueue = new Queue('notifications-queue', {
    connection: CONNECTION,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
    }
});

type NotificationPayload = {
    userId: string;
    type: 'post_failed' | 'post_published' | 'weekly_digest';
    data: any;
};

export async function triggerNotification({ userId, type, data }: NotificationPayload) {
    await notificationQueue.add(type, { userId, type, data });
}
