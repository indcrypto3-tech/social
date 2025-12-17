import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduledPosts, postDestinations } from '@/lib/db/schema';
import { withErrorHandler, normalizeResponse } from '@/middleware/error';
import { getUser } from '@/middleware/auth';
import { AuthError, ValidationError } from '@/lib/errors';
import { eq, desc } from 'drizzle-orm';

export const GET = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

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
    return normalizeResponse(posts);
});

export const POST = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

    const body = await req.json();

    if (!body) {
        throw new ValidationError("Request body is required");
    }

    // Basic validation
    if (!body.content && (!body.mediaUrls || body.mediaUrls.length === 0)) {
        throw new ValidationError("Content or media is required");
    }

    if (!body.scheduledAt) {
        body.scheduledAt = new Date(); // Default to now (immediate publish intent)
    }

    // Insert Post
    const [newPost] = await db.insert(scheduledPosts).values({
        userId: user.id,
        content: body.content,
        mediaUrls: body.mediaUrls,
        scheduledAt: new Date(body.scheduledAt),
        status: 'scheduled' // or draft
    }).returning();

    // Insert Destinations if provided
    if (body.accountIds && Array.isArray(body.accountIds)) {
        if (body.accountIds.length > 0) {
            const destValues = body.accountIds.map((accId: string) => ({
                postId: newPost.id,
                socialAccountId: accId,
                status: 'pending'
            }));
            // @ts-ignore - status enum typing issue sometimes happens with simple strings
            await db.insert(postDestinations).values(destValues);
        }
    }

    // If immediate, logic to trigger worker would go here (e.g. add to BullMQ)
    // For now, we just save to DB.

    return normalizeResponse(newPost, 201);
});
