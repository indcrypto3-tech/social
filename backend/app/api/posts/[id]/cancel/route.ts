
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';
import { withErrorHandler, normalizeResponse } from '@/middleware/error';
import { getUser } from '@/middleware/auth';
import { AuthError, NotFoundError } from '@/lib/errors';
import { eq, and } from 'drizzle-orm';
import { getPublishingQueue } from '@/jobs/publishing.queue';

export const POST = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

    const postId = params.id;

    // 1. Fetch Post
    const post = await db.query.scheduledPosts.findFirst({
        where: and(eq(scheduledPosts.id, postId), eq(scheduledPosts.userId, user.id))
    });

    if (!post) throw new NotFoundError('Post not found');

    // 2. Remove from Queue
    const queue = getPublishingQueue();
    const jobId = `post-${postId}`;
    const existingJob = await queue.getJob(jobId);

    if (existingJob) {
        await existingJob.remove();
    }

    // 3. Update DB Status to draft
    await db.update(scheduledPosts)
        .set({ status: 'draft' })
        .where(eq(scheduledPosts.id, postId));

    return normalizeResponse({ success: true, message: 'Post scheduling cancelled, reverted to draft' });
});
