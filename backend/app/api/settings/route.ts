import { NextRequest } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandler, normalizeResponse } from '../../../middleware/error';
import { createClient } from '../../../lib/supabase/server';
import { AuthError, NotFoundError } from '../../../lib/errors';

export const GET = withErrorHandler(async (req: NextRequest) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new AuthError();
    }

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    });

    if (!dbUser) {
        throw new NotFoundError('User not found');
    }

    // Return sanitized user profile
    const profile = {
        id: dbUser.id,
        fullName: dbUser.fullName,
        email: dbUser.email,
        timezone: dbUser.timezone,
        avatarUrl: dbUser.avatarUrl,
        subscriptionPlan: dbUser.subscriptionPlan || 'free',
        subscriptionTier: dbUser.subscriptionTier,
        subscriptionStatus: dbUser.subscriptionStatus || 'inactive'
    };

    return normalizeResponse(profile);
});

export const PATCH = withErrorHandler(async (req: NextRequest) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new AuthError();
    }

    const body = await req.json();
    const { fullName, timezone, avatarUrl } = body;

    // TODO: Add Zod validation here

    await db.update(users)
        .set({
            fullName,
            timezone,
            avatarUrl: avatarUrl || undefined,
            updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

    return normalizeResponse({ success: true });
});
