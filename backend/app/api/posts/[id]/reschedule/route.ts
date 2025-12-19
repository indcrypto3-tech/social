
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

    if (post.status === 'published' || post.status === 'publishing') {
        throw new ValidationError('Cannot reschedule a published/publishing post');
    }

    if (!body.scheduledAt) {
        throw new ValidationError('New scheduled time is required');
    }

    const newScheduledAt = new Date(body.scheduledAt);
    if (newScheduledAt < new Date()) {
        throw new ValidationError('Scheduled time must be in the future');
    }

    // 2. Update Queue
    const queue = getPublishingQueue();
    const jobId = `post-${postId}`;
    const delay = newScheduledAt.getTime() - Date.now();

    const existingJob = await queue.getJob(jobId);
    if (existingJob) {
        await existingJob.remove(); // Remove old job
    }

    await queue.add('publish-post', {
        postId: postId,
        userId: user.id,
    }, {
        jobId: jobId,
        delay: delay > 0 ? delay : 0,
        removeOnComplete: true
    });

    // 3. Update DB
    await db.update(scheduledPosts)
        .set({ status: 'scheduled', scheduledAt: newScheduledAt })
        .where(eq(scheduledPosts.id, postId));

    return normalizeResponse({ success: true, message: 'Post rescheduled', scheduledAt: newScheduledAt });
});
