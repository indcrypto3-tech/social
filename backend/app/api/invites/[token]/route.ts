import { db } from '../../../../lib/db';
import { teamInvites } from '../../../../lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { withErrorHandler, normalizeResponse } from '../../../../middleware/error';
import { NotFoundError } from '../../../../lib/errors';

export const GET = withErrorHandler(async (req: Request, { params }: { params: { token: string } }) => {
    const token = params.token;

    const invite = await db.query.teamInvites.findFirst({
        where: and(eq(teamInvites.token, token), gt(teamInvites.expiresAt, new Date())),
        with: {
            team: true,
        },
    });

    if (!invite) {
        throw new NotFoundError('Invalid or expired invite');
    }

    return normalizeResponse({
        email: invite.email,
        role: invite.role,
        teamName: invite.team.name,
        expiresAt: invite.expiresAt
    });
});
