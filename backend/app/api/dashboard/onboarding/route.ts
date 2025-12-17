import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { socialAccounts, scheduledPosts, users } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { withErrorHandler, normalizeResponse } from '@/middleware/error';
import { getUser } from '@/middleware/auth';
import { AuthError } from '@/lib/errors';

export const GET = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);

    if (!user) {
        throw new AuthError();
    }

    // Check accounts
    const accountCount = await db.select({ count: count() })
        .from(socialAccounts)
        .where(eq(socialAccounts.userId, user.id));

    // Check posts
    const postCount = await db.select({ count: count() })
        .from(scheduledPosts)
        .where(eq(scheduledPosts.userId, user.id));

    // Check tier
    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
    });

    const data = {
        hasConnectedAccount: accountCount[0].count > 0,
        hasCreatedPost: postCount[0].count > 0,
        hasScheduledPost: postCount[0].count > 0,
        isPro: dbUser?.subscriptionTier !== 'free',
    };

    return normalizeResponse(data);
});
