import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaLibrary } from '@/lib/db/schema';
import { withErrorHandler, normalizeResponse } from '@/middleware/error';
import { getUser } from '@/middleware/auth';
import { AuthError } from '@/lib/errors';
import { eq, desc } from 'drizzle-orm';

export const GET = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

    const media = await db.select().from(mediaLibrary)
        .where(eq(mediaLibrary.userId, user.id))
        .orderBy(desc(mediaLibrary.createdAt));

    return normalizeResponse(media);
});

export const POST = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

    const body = await req.json();
    const { url, fileName, fileType, fileSize } = body;

    if (!url || !fileType) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newMedia] = await db.insert(mediaLibrary).values({
        userId: user.id,
        url,
        fileName,
        fileType,
        fileSize: fileSize || 0,
    }).returning();

    return normalizeResponse(newMedia);
});

export const DELETE = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);
    if (!user) throw new AuthError('Unauthorized');

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Missing media ID" }, { status: 400 });
    }

    const [deletedMedia] = await db.delete(mediaLibrary)
        .where(eq(mediaLibrary.id, id))
        .returning();

    return normalizeResponse(deletedMedia);
});
