
import { Worker, Job } from 'bullmq';
import { db } from '../lib/db';
import { notificationPreferences, notificationEvents, users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { sendEmail } from '../lib/notifications/email';
import { PostFailedEmail } from '../lib/notifications/templates/post-failed';
import { PostPublishedEmail } from '../lib/notifications/templates/post-published';
import { WeeklyDigestEmail } from '../lib/notifications/templates/weekly-digest';
import { render } from '@react-email/components';

dotenv.config();

const CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

export function startNotificationWorker() {
    console.log('Starting Notification Worker...');

    // @ts-ignore
    const worker = new Worker('notifications-queue', async (job: Job) => {
        const { userId, type, data } = job.data;
        console.log(`[Notification] Processing ${type} for user ${userId}`);

        // 1. Log event
        await db.insert(notificationEvents).values({
            userId,
            type,
            payload: data,
        });

        // 2. Fetch User & Preferences
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                notificationPreferences: true,
            }
        });

        if (!user || !user.email) {
            console.warn(`User ${userId} not found or no email.`);
            return;
        }

        const prefs = user.notificationPreferences || {
            emailPostFailed: true,
            emailPostPublished: true,
            weeklyDigest: false,
        };

        let emailHtml = '';
        let subject = '';
        let shouldSend = false;

        try {
            switch (type) {
                case 'post_failed':
                    if (prefs.emailPostFailed) {
                        emailHtml = await render(PostFailedEmail({
                            postContent: data.content,
                            error: data.error,
                            postLink: `${process.env.NEXT_PUBLIC_APP_URL}/composer?postId=${data.postId}`,
                        }));
                        subject = 'Post Failed to Publish - Social Scheduler';
                        shouldSend = true;
                    }
                    break;

                case 'post_published':
                    if (prefs.emailPostPublished) {
                        emailHtml = await render(PostPublishedEmail({
                            postContent: data.content,
                            platform: data.platform,
                            postLink: data.url || '#',
                        }));
                        subject = 'Your Post is Live! - Social Scheduler';
                        shouldSend = true;
                    }
                    break;

                case 'weekly_digest':
                    if (prefs.weeklyDigest) {
                        emailHtml = await render(WeeklyDigestEmail({
                            stats: data.stats,
                            startDate: data.startDate,
                            endDate: data.endDate,
                        }));
                        subject = 'Weekly Performance Digest - Social Scheduler';
                        shouldSend = true;
                    }
                    break;
            }

            if (shouldSend && emailHtml) {
                const result = await sendEmail({
                    to: user.email,
                    subject,
                    html: emailHtml,
                });
                if (!result.success) {
                    throw new Error(`Email sending failed: ${JSON.stringify(result.error)}`);
                }
                console.log(`[Notification] Sent ${type} email to ${user.email}`);
            } else {
                console.log(`[Notification] Skipped ${type} for ${user.email} (Preferences off)`);
            }

        } catch (e: any) {
            console.error(`[Notification] Error processing job ${job.id}:`, e);
            throw e;
        }

    }, {
        connection: CONNECTION,
        concurrency: 5
    });

    worker.on('failed', (job, err) => {
        console.error(`[Notification] Job ${job?.id} failed: ${err.message}`);
    });

    return worker;
}
