
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getPublishingQueue } from '@/jobs/publishing.queue';

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { postId, newScheduledAt } = body;

        if (!postId || !newScheduledAt) {
            return NextResponse.json({
                error: 'Missing required fields: postId and newScheduledAt'
            }, { status: 400 });
        }

        // Fetch post to verify ownership
        const post = await db.query.scheduledPosts.findFirst({
            where: and(
                eq(scheduledPosts.id, postId),
                eq(scheduledPosts.userId, user.id)
            )
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Validate status - can't reschedule published/publishing posts
        if (post.status === 'published' || post.status === 'publishing') {
            return NextResponse.json({
                error: 'Cannot reschedule published or publishing posts'
            }, { status: 400 });
        }

        const newDate = new Date(newScheduledAt);

        // Validate new date is in the future
        if (newDate < new Date()) {
            return NextResponse.json({
                error: 'Cannot schedule posts in the past'
            }, { status: 400 });
        }

        // Check for collision - posts scheduled within 5 minutes of each other
        const COLLISION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
        const collisionStart = new Date(newDate.getTime() - COLLISION_WINDOW_MS);
        const collisionEnd = new Date(newDate.getTime() + COLLISION_WINDOW_MS);

        const nearbyPosts = await db.query.scheduledPosts.findMany({
            where: and(
                eq(scheduledPosts.userId, user.id),
                // Exclude current post
                // Check if scheduledAt is between collision window
            )
        });

        const hasCollision = nearbyPosts.some(p => {
            if (p.id === postId) return false; // Skip self
            const pTime = new Date(p.scheduledAt).getTime();
            return pTime >= collisionStart.getTime() && pTime <= collisionEnd.getTime();
        });

        // Update queue
        const queue = getPublishingQueue();
        const jobId = `post-${postId}`;
        const delay = newDate.getTime() - Date.now();

        // Remove existing job if any
        const existingJob = await queue.getJob(jobId);
        if (existingJob) {
            await existingJob.remove();
        }

        // Add new job with delay
        await queue.add('publish-post', {
            postId: postId,
            userId: user.id,
        }, {
            jobId: jobId,
            delay: delay > 0 ? delay : 0,
            removeOnComplete: true
        });

        // Update database
        await db.update(scheduledPosts)
            .set({
                scheduledAt: newDate,
                status: 'scheduled',
                updatedAt: new Date()
            })
            .where(eq(scheduledPosts.id, postId));

        return NextResponse.json({
            success: true,
            scheduledAt: newDate,
            hasCollision: hasCollision,
            message: hasCollision
                ? 'Post rescheduled, but there are other posts scheduled nearby'
                : 'Post rescheduled successfully'
        });

    } catch (error: any) {
        console.error('Drag reschedule error:', error);
        return NextResponse.json({
            error: 'Failed to reschedule',
            details: error.message
        }, { status: 500 });
    }
}
