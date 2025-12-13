import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';
import { withErrorHandler, normalizeResponse } from '@/middleware/error';
import { getUser } from '@/middleware/auth';
import { AuthError, NotFoundError, ValidationError } from '@/lib/errors';
import { eq, and } from 'drizzle-orm';

export const GET = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

    const post = await db.query.scheduledPosts.findFirst({
        where: and(eq(scheduledPosts.id, params.id), eq(scheduledPosts.userId, user.id)),
        with: { destinations: { with: { socialAccount: true } } }
    });

    if (!post) throw new NotFoundError('Post not found');
    return normalizeResponse(post);
});

export const PATCH = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');
    const body = await req.json();

    // Verify ownership
    const post = await db.query.scheduledPosts.findFirst({
        where: and(eq(scheduledPosts.id, params.id), eq(scheduledPosts.userId, user.id))
    });
    if (!post) throw new NotFoundError('Post not found');

    if (post.status === 'publishing' || post.status === 'published') {
        throw new ValidationError('Cannot edit published posts');
    }

    const updateData: any = { updatedAt: new Date() };
    if (body.content !== undefined) updateData.content = body.content;
    if (body.scheduledAt) updateData.scheduledAt = new Date(body.scheduledAt);
    if (body.status) updateData.status = body.status;

    await db.update(scheduledPosts)
        .set(updateData)
        .where(eq(scheduledPosts.id, params.id));

    return normalizeResponse({ success: true });
});

export const DELETE = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

    const result = await db.delete(scheduledPosts)
        .where(and(eq(scheduledPosts.id, params.id), eq(scheduledPosts.userId, user.id)))
        .returning();

    if (result.length === 0) throw new NotFoundError('Post not found');
    return normalizeResponse({ success: true });
});
