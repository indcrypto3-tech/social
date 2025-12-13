import { NextRequest } from 'next/server';
import { db } from '../../../../../lib/db';
import { teamInvites, teamMembers } from '../../../../../lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { withErrorHandler, normalizeResponse } from '../../../../../middleware/error';
import { createClient } from '../../../../../lib/supabase/server';
import { AuthError, NotFoundError, ValidationError } from '../../../../../lib/errors';

export const POST = withErrorHandler(async (req: NextRequest, { params }: { params: { token: string } }) => {
    const token = params.token;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new AuthError();
    }

    const invite = await db.query.teamInvites.findFirst({
        where: and(eq(teamInvites.token, token), gt(teamInvites.expiresAt, new Date())),
    });

    if (!invite) {
        throw new NotFoundError('Invalid or expired invite');
    }

    // Check redundancy
    const existingMember = await db.query.teamMembers.findFirst({
        where: and(eq(teamMembers.teamId, invite.teamId), eq(teamMembers.userId, user.id)),
    });

    if (!existingMember) {
        await db.insert(teamMembers).values({
            teamId: invite.teamId,
            userId: user.id,
            role: invite.role,
        });
    }

    await db.delete(teamInvites).where(eq(teamInvites.id, invite.id));

    return normalizeResponse({ success: true });
});
