'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { scheduledPosts, postDestinations, socialAccounts, mediaLibrary } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import { Queue } from 'bullmq';

// We need a Redis connection for the server action queue producer
// Reusing connection logic or just creating a new simple connection
const CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

const publishQueue = new Queue('publish-queue', { connection: CONNECTION });

export async function createPost(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const content = formData.get('content') as string;
    const accountIds = formData.getAll('accounts') as string[];
    const scheduledAtRaw = formData.get('scheduledAt') as string;
    const mediaIds = formData.getAll('media') as string[]; // For future use

    if (!content && mediaIds.length === 0) throw new Error("Content or media required");
    if (accountIds.length === 0) throw new Error("Select at least one account");

    const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : new Date(); // Default to now if not set? Or require it?
    // If scheduledAt is in the past or "now", we might want to trigger immediately.
    // For now, let's treat everything as "scheduled" but maybe with 0 delay if "now".

    // 1. Create Scheduled Post
    const [post] = await db.insert(scheduledPosts).values({
        userId: user.id,
        content,
        scheduledAt: scheduledAt,
        status: 'scheduled',
    }).returning();

    // 2. Create Destinations
    const destinations = await Promise.all(accountIds.map(accId => {
        return db.insert(postDestinations).values({
            postId: post.id,
            socialAccountId: accId,
            status: 'pending'
        }).returning();
    }));

    // 3. Add to BullMQ
    // Calculate delay
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());

    await Promise.all(destinations.map(([dest]) => {
        return publishQueue.add('publish-post', {
            postId: post.id,
            accountId: dest.socialAccountId, // We process per-account jobs usually
            destinationId: dest.id
        }, {
            delay: delay,
            jobId: `${post.id}-${dest.socialAccountId}` // Dedup
        });
    }));

    revalidatePath('/calendar');
    revalidatePath('/dashboard');
}

export async function getAccounts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return await db.query.socialAccounts.findMany({
        where: eq(socialAccounts.userId, user.id)
    });
}
