import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaLibrary } from '@/lib/db/schema';
import { withErrorHandler, normalizeResponse } from '@/middleware/error';
import { getUser } from '@/middleware/auth';
import { AppError } from '@/lib/errors';
import { eq, desc } from 'drizzle-orm';

export const GET = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);
    if (!user) throw new AppError('Unauthorized', 401);

    const media = await db.select().from(mediaLibrary)
        .where(eq(mediaLibrary.userId, user.id))
        .orderBy(desc(mediaLibrary.createdAt));

    return normalizeResponse(media);
});

export const POST = withErrorHandler(async (request: Request) => {
    // Placeholder for future implementation
    return normalizeResponse({ message: "Not implemented" });
});
