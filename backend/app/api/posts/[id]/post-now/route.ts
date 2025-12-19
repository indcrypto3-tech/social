
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

    // 1. Fetch Post (Ownership Check)
    const post = await db.query.scheduledPosts.findFirst({
        where: and(eq(scheduledPosts.id, postId), eq(scheduledPosts.userId, user.id))
    });

    if (!post) throw new NotFoundError('Post not found');

    // 2. Validate Status
    if (post.status === 'publishing' || post.status === 'published') {
        throw new ValidationError('Post is already published or publishing');
    }

    // 3. Queue Job (Immediate)
    const queue = getPublishingQueue();
    const jobId = `post-${postId}`;

    // Add job to BullMQ
    await queue.add('publish-post', {
        postId: postId,
        userId: user.id,
    }, {
        jobId: jobId, // Prevent duplicates via ID
        removeOnComplete: true,
        removeOnFail: false // Keep failed jobs for debugging
    });

    // 4. Update DB Status
    await db.update(scheduledPosts)
        .set({ status: 'publishing' })
        .where(eq(scheduledPosts.id, postId));

    return normalizeResponse({ success: true, message: 'Post queued for immediate publishing' });
});
