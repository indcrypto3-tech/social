
import { Worker } from 'bullmq';
import { db } from '../lib/db'; // Adjust path if running via ts-node from root
import { scheduledPosts, postDestinations, socialAccounts } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

console.log('Starting Worker...');

const worker = new Worker('publish-queue', async (job) => {
    console.log(`Processing job ${job.id} for post ${job.data.postId}`);

    const { postId, accountId } = job.data;

    try {
        // 1. Fetch Post & Account
        const post = await db.query.scheduledPosts.findFirst({
            where: eq(scheduledPosts.id, postId)
        });

        if (!post) throw new Error("Post not found");

        const account = await db.query.socialAccounts.findFirst({
            where: eq(socialAccounts.id, accountId)
        });

        if (!account) throw new Error("Account not found");

        // 2. Perform Posting Logic (Mock for now)
        console.log(`Posting to ${account.platform}... Content: ${post.content}`);

        // Simulate network delay
        await new Promise(r => setTimeout(r, 2000));

        // 3. Update DB
        await db.update(postDestinations)
            .set({ status: 'success', platformPostId: `mock_${Date.now()}` })
            .where(eq(postDestinations.postId, postId)); // In reality, match BOTH postId and accountId

        console.log(`Job ${job.id} completed.`);
        return { success: true };

    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        throw error;
    }
}, {
    connection: CONNECTION,
    concurrency: 5
});

worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
});
