import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { notificationPreferences } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandler, normalizeResponse } from '../../../../middleware/error';
import { createClient } from '../../../../lib/supabase/server';
import { AuthError } from '../../../../lib/errors';

export const GET = withErrorHandler(async (req: NextRequest) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new AuthError();
    }

    const prefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, user.id)
    });

    if (!prefs) {
        // Return defaults if not found
        return normalizeResponse({
            emailPostFailed: true,
            emailPostPublished: false,
            weeklyDigest: false,
        });
    }

    return normalizeResponse({
        emailPostFailed: prefs.emailPostFailed,
        emailPostPublished: prefs.emailPostPublished,
        weeklyDigest: prefs.weeklyDigest,
    });
});

export const PATCH = withErrorHandler(async (req: NextRequest) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new AuthError();
    }

    const body = await req.json();
    const { emailPostFailed, emailPostPublished, weeklyDigest } = body;

    const existing = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, user.id)
    });

    if (existing) {
        await db.update(notificationPreferences)
            .set({
                emailPostFailed,
                emailPostPublished,
                weeklyDigest,
                updatedAt: new Date()
            })
            .where(eq(notificationPreferences.id, existing.id));
    } else {
        await db.insert(notificationPreferences).values({
            userId: user.id,
            emailPostFailed,
            emailPostPublished,
            weeklyDigest,
        });
    }

    return normalizeResponse({ success: true });
});
