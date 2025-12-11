'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { scheduledPosts, postDestinations, socialAccounts } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- CREATE ---
// Already implemented in composer/actions.ts as createPost

// --- READ ---

export async function getScheduledPosts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Fetch posts with their destinations
    const posts = await db.query.scheduledPosts.findMany({
        where: eq(scheduledPosts.userId, user.id),
        orderBy: [desc(scheduledPosts.scheduledAt)],
        with: {
            destinations: {
                with: {
                    socialAccount: true
                }
            }
        }
    });

    return posts;
}

export async function getPostById(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const post = await db.query.scheduledPosts.findFirst({
        where: and(
            eq(scheduledPosts.id, postId),
            eq(scheduledPosts.userId, user.id)
        ),
        with: {
            destinations: {
                with: {
                    socialAccount: true
                }
            }
        }
    });

    return post;
}

// --- UPDATE ---

export async function updatePost(postId: string, data: { content?: string, scheduledAt?: Date }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Verify ownership
    const post = await db.query.scheduledPosts.findFirst({
        where: and(eq(scheduledPosts.id, postId), eq(scheduledPosts.userId, user.id))
    });

    if (!post) throw new Error('Post not found');

    if (post.status !== 'draft' && post.status !== 'scheduled') {
        throw new Error('Cannot edit published or processing posts');
    }

    await db.update(scheduledPosts)
        .set({
            content: data.content,
            scheduledAt: data.scheduledAt,
            updatedAt: new Date()
        })
        .where(eq(scheduledPosts.id, postId));

    // Refactoring destinations/queue logic would be needed here for full resaleability
    // For now, assume simple content updates

    revalidatePath('/dashboard');
    revalidatePath('/calendar');
}

// --- DELETE ---

export async function deletePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Verify ownership
    // Drizzle delete with returning check is faster but finding first is safer logic wise
    await db.delete(scheduledPosts)
        .where(and(
            eq(scheduledPosts.id, postId),
            eq(scheduledPosts.userId, user.id)
        ));

    // Note: This does NOT remove the job from BullMQ if it's already scheduled.
    // In a production app, we should find the BullMQ Job ID (stored in DB?) and remove it.
    // Current simple implementation relies on Worker checking DB existence before execution.
    // Since we delete the DB row here, the Worker will fail to find the post and gracefully exit (as per worker.ts logic).

    revalidatePath('/dashboard');
    revalidatePath('/calendar');
}
