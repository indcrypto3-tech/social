import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyticsSnapshots } from '@/lib/db/schema';
import { withErrorHandler, normalizeResponse } from '@/middleware/error';
import { getUser } from '@/middleware/auth';
import { AppError } from '@/lib/errors';
import { eq, desc } from 'drizzle-orm';

export const GET = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);
    if (!user) throw new AppError('Unauthorized', 401);

    const snapshots = await db.select()
        .from(analyticsSnapshots)
        .where(eq(analyticsSnapshots.userId, user.id))
        .orderBy(desc(analyticsSnapshots.date))
        .limit(100);

    return normalizeResponse(snapshots);
});
