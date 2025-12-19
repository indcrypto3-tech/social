
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { teamInvites, teamMembers, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Missing invite token' }, { status: 400 });
        }

        // Find invite
        const invite = await db.query.teamInvites.findFirst({
            where: eq(teamInvites.token, token)
        });

        if (!invite) {
            return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 });
        }

        // Check if already accepted
        if (invite.acceptedAt) {
            return NextResponse.json({ error: 'Invite already accepted' }, { status: 400 });
        }

        // Check expiry
        if (new Date() > new Date(invite.expiresAt)) {
            return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
        }

        // Get user email to verify
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, user.id)
        });

        // Verify email matches (optional - you might want to allow any user)
        if (userRecord?.email !== invite.email) {
            return NextResponse.json({
                error: 'This invite was sent to a different email address'
            }, { status: 403 });
        }

        // Check if already a member
        const existingMember = await db.query.teamMembers.findFirst({
            where: and(
                eq(teamMembers.teamId, invite.teamId),
                eq(teamMembers.userId, user.id)
            )
        });

        if (existingMember) {
            return NextResponse.json({
                error: 'You are already a member of this team'
            }, { status: 400 });
        }

        // Add to team
        await db.insert(teamMembers).values({
            teamId: invite.teamId,
            userId: user.id,
            role: invite.role
        });

        // Mark invite as accepted
        await db.update(teamInvites)
            .set({ acceptedAt: new Date() })
            .where(eq(teamInvites.id, invite.id));

        console.log(`[TEAM_INVITE] User ${user.id} accepted invite to team ${invite.teamId}`);

        return NextResponse.json({
            success: true,
            teamId: invite.teamId,
            role: invite.role
        });

    } catch (error: any) {
        console.error('Accept invite error:', error);
        return NextResponse.json({
            error: 'Failed to accept invite',
            details: error.message
        }, { status: 500 });
    }
}
