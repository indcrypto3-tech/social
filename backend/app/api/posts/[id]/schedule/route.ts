
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';
import { withErrorHandler, normalizeResponse } from '@/middleware/error';
import { getUser } from '@/middleware/auth';
import { AuthError, NotFoundError, ValidationError } from '@/lib/errors';
import { eq, and } from 'drizzle-orm';
import { getPublishingQueue } from '@/jobs/publishing.queue';

export const POST = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

    const postId = params.id;
    const body = await req.json();

    // 1. Fetch Post (Ownership Check)
    const post = await db.query.scheduledPosts.findFirst({
        where: and(eq(scheduledPosts.id, postId), eq(scheduledPosts.userId, user.id))
    });

    if (!post) throw new NotFoundError('Post not found');

    // 2. Validate Status
    if (post.status === 'publishing' || post.status === 'published') {
        throw new ValidationError('Cannot schedule a published post');
    }

    // 3. Determine Schedule Time
    // If body has scheduledAt, use it. Else use post's existing scheduledAt.
    let scheduledAt = post.scheduledAt;
    if (body.scheduledAt) {
        scheduledAt = new Date(body.scheduledAt);
    }

    if (!scheduledAt || scheduledAt < new Date()) {
        // If scheduled time is in past/invalid, and we are calling 'schedule', reject.
        // Unless 'post-now' logic is desired, but this is explicit 'schedule'.
        throw new ValidationError('Scheduled time must be in the future');
    }

    // 4. Queue Job (Delayed)
    const queue = getPublishingQueue();
    const jobId = `post-${postId}`;
    const delay = scheduledAt.getTime() - Date.now();

    // Prevent duplicates: remove existing if any (reschedule logic overlaps here)
    const existingJob = await queue.getJob(jobId);
    if (existingJob) {
        try {
            await existingJob.remove();
        } catch (e) { console.warn("Failed to remove existing job", e); }
    }

    await queue.add('publish-post', {
        postId: postId,
        userId: user.id,
    }, {
        jobId: jobId,
        delay: delay > 0 ? delay : 0,
        removeOnComplete: true
    });

    // 5. Update DB Status
    await db.update(scheduledPosts)
        .set({ status: 'scheduled', scheduledAt: scheduledAt })
        .where(eq(scheduledPosts.id, postId));

    return normalizeResponse({ success: true, message: 'Post scheduled', scheduledAt });
});
